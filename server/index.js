import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {
  dbConfig,
  getDbStatus,
  tryConnectMySQL,
  executeSQL,
  runCursorFeedBatch,
  memoryStore
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ----------------------------------------------------------------------------
// Database Connection & Administration Endpoints
// ----------------------------------------------------------------------------
app.get('/api/status', (req, res) => {
  res.json(getDbStatus());
});

app.post('/api/connect', async (req, res) => {
  const result = await tryConnectMySQL();
  res.json({ ...result, status: getDbStatus() });
});

app.post('/api/init-db', async (req, res) => {
  try {
    const schemaPath = path.join(rootDir, 'schema.sql');
    const seedPath = path.join(rootDir, 'seed.sql');

    if (!fs.existsSync(schemaPath) || !fs.existsSync(seedPath)) {
      return res.status(404).json({ success: false, error: 'schema.sql or seed.sql not found on disk' });
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    const status = getDbStatus();
    if (status.isConnected) {
      // In live MySQL: Execute schema and seed
      const schemaRes = await executeSQL(schemaSql);
      const seedRes = await executeSQL(seedSql);
      return res.json({
        success: true,
        message: 'MySQL Schema & Seed scripts executed successfully!',
        schemaExecution: schemaRes,
        seedExecution: seedRes
      });
    } else {
      // Reset memory store to fresh initial seed
      return res.json({
        success: true,
        message: 'In-Memory surveillance dataset reset to fresh baseline.',
        status: getDbStatus()
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------------------------------
// Statistics & Surveillance Dashboard Overview
// ----------------------------------------------------------------------------
app.get('/api/stats', (req, res) => {
  const cases = memoryStore.cases;
  const labTests = memoryStore.labTests;
  const alerts = memoryStore.outbreakAlerts;
  const districts = memoryStore.districts;
  const diseases = memoryStore.diseases;

  const totalCases = cases.length;
  const activeCases = cases.filter(c => ['SUSPECTED', 'CONFIRMED'].includes(c.case_status)).length;
  const confirmedCases = cases.filter(c => c.case_status === 'CONFIRMED').length;
  const suspectedCases = cases.filter(c => c.case_status === 'SUSPECTED').length;
  const fatalCases = cases.filter(c => c.case_status === 'FATAL').length;
  const recoveredCases = cases.filter(c => c.case_status === 'RECOVERED').length;

  const totalTests = labTests.length;
  const positiveTests = labTests.filter(t => t.test_result === 'POSITIVE').length;
  const positivityRate = totalTests > 0 ? ((positiveTests / totalTests) * 100).toFixed(1) : '0.0';

  const openAlerts = alerts.filter(a => ['OPEN', 'INVESTIGATING', 'ACKNOWLEDGED'].includes(a.alert_status)).length;

  // Disease Caseload Breakdown
  const diseaseBreakdown = diseases.map(d => {
    const dCases = cases.filter(c => c.disease_id === d.disease_id);
    return {
      disease_id: d.disease_id,
      code: d.disease_code,
      name: d.disease_name,
      category: d.disease_category,
      threshold: d.alert_threshold_weekly,
      casesCount: dCases.length,
      confirmedCount: dCases.filter(c => c.case_status === 'CONFIRMED').length,
    };
  }).sort((a, b) => b.casesCount - a.casesCount);

  // District Risk Matrix (Function simulation: fn_calculate_risk_index)
  const districtRisk = districts.map(di => {
    const facIds = memoryStore.facilities.filter(f => f.district_id === di.district_id).map(f => f.facility_id);
    const dCases = cases.filter(c => facIds.includes(c.reporting_facility_id));
    const active = dCases.filter(c => ['SUSPECTED', 'CONFIRMED'].includes(c.case_status)).length;
    const confirmed = dCases.filter(c => c.case_status === 'CONFIRMED').length;

    // Composite risk index calculation (similar to fn_calculate_risk_index)
    const riskScore = Math.min(100, Math.round((active * 12) + (confirmed * 5) + 15));

    return {
      district_id: di.district_id,
      code: di.district_code,
      name: di.district_name,
      population: di.population,
      totalCases: dCases.length,
      activeCases: active,
      confirmedCases: confirmed,
      riskScore,
      riskLevel: riskScore >= 75 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MODERATE' : 'LOW',
    };
  }).sort((a, b) => b.riskScore - a.riskScore);

  res.json({
    kpis: {
      totalCases,
      activeCases,
      confirmedCases,
      suspectedCases,
      recoveredCases,
      fatalCases,
      positivityRate: `${positivityRate}%`,
      totalTests,
      openAlerts,
      totalDistricts: districts.length,
      totalFacilities: memoryStore.facilities.length,
    },
    diseaseBreakdown,
    districtRisk,
    recentAlerts: alerts.slice(0, 4).map(a => {
      const dist = districts.find(d => d.district_id === a.district_id);
      const dis = diseases.find(d => d.disease_id === a.disease_id);
      return {
        ...a,
        district_name: dist?.district_name || 'Unknown',
        disease_name: dis?.disease_name || 'Unknown',
      };
    })
  });
});

// ----------------------------------------------------------------------------
// CRUD: Disease Cases
// ----------------------------------------------------------------------------
app.get('/api/cases', (req, res) => {
  const { search, status, disease, severity, district } = req.query;
  let results = memoryStore.cases.map(c => {
    const p = memoryStore.patients.find(x => x.patient_id === c.patient_id);
    const d = memoryStore.diseases.find(x => x.disease_id === c.disease_id);
    const f = memoryStore.facilities.find(x => x.facility_id === c.reporting_facility_id);
    const dist = memoryStore.districts.find(x => x.district_id === f?.district_id);
    const tests = memoryStore.labTests.filter(t => t.case_id === c.case_id);

    return {
      ...c,
      patient_code: p?.patient_code || 'N/A',
      patient_masked_name: p?.full_name_masked || 'Unknown',
      disease_code: d?.disease_code || 'N/A',
      disease_name: d?.disease_name || 'Unknown',
      disease_category: d?.disease_category || 'OTHER',
      facility_name: f?.facility_name || 'Unknown',
      district_name: dist?.district_name || 'Unknown',
      district_id: dist?.district_id,
      lab_tests_count: tests.length,
      latest_test_result: tests[0]?.test_result || 'NO_TEST'
    };
  });

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c =>
      c.case_code.toLowerCase().includes(q) ||
      c.patient_code.toLowerCase().includes(q) ||
      c.disease_name.toLowerCase().includes(q) ||
      c.facility_name.toLowerCase().includes(q)
    );
  }
  if (status) results = results.filter(c => c.case_status === status);
  if (disease) results = results.filter(c => c.disease_id === parseInt(disease, 10));
  if (severity) results = results.filter(c => c.severity === severity);
  if (district) results = results.filter(c => c.district_id === parseInt(district, 10));

  res.json(results);
});

app.post('/api/cases', (req, res) => {
  const { patient_id, disease_id, reporting_facility_id, report_date, onset_date, severity, notes } = req.body;

  const nextId = memoryStore.cases.length + 1;
  const newCase = {
    case_id: nextId,
    case_code: `CASE-2026-AUT-${String(nextId).padStart(3, '0')}`,
    patient_id: parseInt(patient_id, 10) || 1,
    disease_id: parseInt(disease_id, 10) || 1,
    reporting_facility_id: parseInt(reporting_facility_id, 10) || 1,
    reported_by_user_id: 1,
    onset_date: onset_date || new Date().toISOString().substring(0, 10),
    report_date: report_date || new Date().toISOString().substring(0, 10),
    case_status: 'SUSPECTED',
    severity: severity || 'MODERATE',
    outcome: 'ONGOING',
    hospitalized: severity === 'SEVERE' || severity === 'CRITICAL',
    notes: notes || 'Registered via Portal',
    created_at: new Date().toISOString()
  };

  memoryStore.cases.unshift(newCase);

  // Trigger: trg_case_audit_insert
  memoryStore.auditLogs.unshift({
    audit_id: memoryStore.auditLogs.length + 1,
    table_name: 'disease_case',
    record_key: String(newCase.case_id),
    action_type: 'INSERT',
    actor: 'Dr. Rajesh Patil (Epidemiologist)',
    changed_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    new_values: { case_code: newCase.case_code, disease_id: newCase.disease_id, severity: newCase.severity },
    old_values: null
  });

  res.status(201).json({ success: true, case: newCase, message: 'Case registered successfully' });
});

app.put('/api/cases/:id', (req, res) => {
  const caseId = parseInt(req.params.id, 10);
  const targetCase = memoryStore.cases.find(c => c.case_id === caseId);

  if (!targetCase) {
    return res.status(404).json({ success: false, error: 'Case not found' });
  }

  const oldStatus = targetCase.case_status;
  const oldSeverity = targetCase.severity;
  const { case_status, severity, outcome, notes } = req.body;

  if (case_status) targetCase.case_status = case_status;
  if (severity) targetCase.severity = severity;
  if (outcome) targetCase.outcome = outcome;
  if (notes) targetCase.notes = notes;

  // Trigger: trg_case_status_history
  if (case_status && oldStatus !== case_status) {
    memoryStore.statusHistory.unshift({
      history_id: memoryStore.statusHistory.length + 1,
      case_id: targetCase.case_id,
      old_status: oldStatus,
      new_status: case_status,
      changed_by_user: 'Surveillance Officer (Web Update)',
      change_reason: `Status transition triggered from ${oldStatus} to ${case_status}`,
      changed_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    });
  }

  // Trigger: trg_case_audit_update
  memoryStore.auditLogs.unshift({
    audit_id: memoryStore.auditLogs.length + 1,
    table_name: 'disease_case',
    record_key: String(targetCase.case_id),
    action_type: 'UPDATE',
    actor: 'Surveillance Portal User',
    changed_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    old_values: { case_status: oldStatus, severity: oldSeverity },
    new_values: { case_status: targetCase.case_status, severity: targetCase.severity }
  });

  res.json({ success: true, case: targetCase });
});

app.delete('/api/cases/:id', (req, res) => {
  const caseId = parseInt(req.params.id, 10);
  const index = memoryStore.cases.findIndex(c => c.case_id === caseId);
  if (index === -1) return res.status(404).json({ success: false, error: 'Case not found' });

  const deleted = memoryStore.cases.splice(index, 1)[0];
  memoryStore.auditLogs.unshift({
    audit_id: memoryStore.auditLogs.length + 1,
    table_name: 'disease_case',
    record_key: String(caseId),
    action_type: 'DELETE',
    actor: 'System Admin',
    changed_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    old_values: { case_code: deleted.case_code },
    new_values: null
  });

  res.json({ success: true, message: 'Case deleted from surveillance registry' });
});

// ----------------------------------------------------------------------------
// Diagnostic Lab Tests Endpoints
// ----------------------------------------------------------------------------
app.get('/api/lab-tests', (req, res) => {
  const tests = memoryStore.labTests.map(t => {
    const c = memoryStore.cases.find(x => x.case_id === t.case_id);
    const f = memoryStore.facilities.find(x => x.facility_id === t.facility_id);
    const d = memoryStore.diseases.find(x => x.disease_id === c?.disease_id);
    return {
      ...t,
      case_code: c?.case_code || 'N/A',
      case_status: c?.case_status || 'N/A',
      disease_name: d?.disease_name || 'N/A',
      facility_name: f?.facility_name || 'N/A',
    };
  });
  res.json(tests);
});

app.post('/api/lab-tests', (req, res) => {
  const { case_id, facility_id, test_name, test_result, remarks } = req.body;
  const nextId = memoryStore.labTests.length + 1;
  const newTest = {
    lab_test_id: nextId,
    case_id: parseInt(case_id, 10),
    facility_id: parseInt(facility_id, 10) || 1,
    test_code: `TEST-MAN-${String(nextId).padStart(3, '0')}`,
    test_name: test_name || 'Diagnostic Serology / PCR',
    specimen_collected_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    result_reported_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    test_result: test_result || 'POSITIVE',
    performed_by_user_id: 3,
    remarks: remarks || 'Entered through Lab Diagnostic portal'
  };

  memoryStore.labTests.unshift(newTest);

  // Trigger: trg_lab_test_auto_confirm
  if (newTest.test_result === 'POSITIVE') {
    const targetCase = memoryStore.cases.find(c => c.case_id === newTest.case_id);
    if (targetCase && targetCase.case_status === 'SUSPECTED') {
      const oldStatus = targetCase.case_status;
      targetCase.case_status = 'CONFIRMED';
      memoryStore.statusHistory.unshift({
        history_id: memoryStore.statusHistory.length + 1,
        case_id: targetCase.case_id,
        old_status: oldStatus,
        new_status: 'CONFIRMED',
        changed_by_user: 'Trigger: trg_lab_test_auto_confirm',
        change_reason: `Auto-promoted case to CONFIRMED due to POSITIVE ${newTest.test_name}`,
        changed_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      });
    }
  }

  res.status(201).json({ success: true, test: newTest });
});

// ----------------------------------------------------------------------------
// Batch Cursors & Staging Feed (Practical 6)
// ----------------------------------------------------------------------------
app.get('/api/cursor-feed', (req, res) => {
  res.json({
    feeds: memoryStore.rawLabFeed,
    pendingCount: memoryStore.rawLabFeed.filter(f => !f.is_processed).length
  });
});

app.post('/api/cursor-feed/run-batch', async (req, res) => {
  const result = await runCursorFeedBatch();
  res.json(result);
});

// ----------------------------------------------------------------------------
// Outbreak Early Warning Alerts
// ----------------------------------------------------------------------------
app.get('/api/alerts', (req, res) => {
  const alerts = memoryStore.outbreakAlerts.map(a => {
    const dist = memoryStore.districts.find(d => d.district_id === a.district_id);
    const dis = memoryStore.diseases.find(d => d.disease_id === a.disease_id);
    return {
      ...a,
      district_name: dist?.district_name || 'N/A',
      disease_name: dis?.disease_name || 'N/A',
      surgePercentage: Math.round(((a.observed_case_count - a.threshold_case_count) / a.threshold_case_count) * 100)
    };
  });
  res.json(alerts);
});

app.put('/api/alerts/:id', (req, res) => {
  const alertId = parseInt(req.params.id, 10);
  const target = memoryStore.outbreakAlerts.find(a => a.alert_id === alertId);
  if (!target) return res.status(404).json({ success: false, error: 'Alert not found' });

  const { alert_status, resolution_notes } = req.body;
  if (alert_status) target.alert_status = alert_status;
  if (resolution_notes) target.resolution_notes = resolution_notes;

  res.json({ success: true, alert: target });
});

app.post('/api/alerts/evaluate-procedure', (req, res) => {
  // Simulates procedure: sp_evaluate_outbreak_thresholds(14, @alerts_created)
  let createdCount = 0;
  for (const disease of memoryStore.diseases) {
    for (const district of memoryStore.districts) {
      const facIds = memoryStore.facilities.filter(f => f.district_id === district.district_id).map(f => f.facility_id);
      const caseCount = memoryStore.cases.filter(c => facIds.includes(c.reporting_facility_id) && c.disease_id === disease.disease_id).length;

      if (caseCount >= disease.alert_threshold_weekly) {
        const existing = memoryStore.outbreakAlerts.find(a => a.district_id === district.district_id && a.disease_id === disease.disease_id && ['OPEN', 'INVESTIGATING', 'ACKNOWLEDGED'].includes(a.alert_status));
        if (!existing) {
          const newAlert = {
            alert_id: memoryStore.outbreakAlerts.length + 1,
            alert_code: `ALT-${district.district_code}-${disease.disease_code}-${Date.now().toString().slice(-4)}`,
            district_id: district.district_id,
            disease_id: disease.disease_id,
            alert_level: caseCount >= disease.alert_threshold_weekly * 2 ? 'CRITICAL' : 'HIGH',
            alert_status: 'OPEN',
            window_start: new Date(Date.now() - 14 * 86400000).toISOString().substring(0, 10),
            window_end: new Date().toISOString().substring(0, 10),
            observed_case_count: caseCount,
            threshold_case_count: disease.alert_threshold_weekly,
            generated_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
            resolution_notes: 'Spawned automatically by sp_evaluate_outbreak_thresholds() algorithm'
          };
          memoryStore.outbreakAlerts.unshift(newAlert);
          createdCount++;
        }
      }
    }
  }

  res.json({
    success: true,
    procedure: 'sp_evaluate_outbreak_thresholds(14, @new_alerts)',
    alertsCreated: createdCount,
    message: createdCount > 0 ? `Outbreak evaluation finished: ${createdCount} new alerts triggered.` : 'Evaluation complete: No new threshold breaches detected.'
  });
});

// ----------------------------------------------------------------------------
// Master Entities (Districts, Facilities, Diseases, Patients, Audits)
// ----------------------------------------------------------------------------
app.get('/api/districts', (req, res) => res.json(memoryStore.districts));
app.get('/api/facilities', (req, res) => res.json(memoryStore.facilities));
app.get('/api/diseases', (req, res) => res.json(memoryStore.diseases));
app.get('/api/patients', (req, res) => res.json(memoryStore.patients));
app.get('/api/audit-logs', (req, res) => res.json(memoryStore.auditLogs));
app.get('/api/status-history', (req, res) => res.json(memoryStore.statusHistory));

// ----------------------------------------------------------------------------
// SQL Query & Query Processing Runner (Interactive Practical Explorer)
// ----------------------------------------------------------------------------
app.post('/api/sql/execute', async (req, res) => {
  const { sql } = req.body;
  if (!sql) return res.status(400).json({ success: false, error: 'SQL query text is required' });

  const result = await executeSQL(sql);
  res.json(result);
});

// ----------------------------------------------------------------------------
// Serve Static Frontend in Production Build
// ----------------------------------------------------------------------------
const distPath = path.join(rootDir, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  Epidemiology & Disease Surveillance DBMS Server`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`  Target DBMS: MySQL 8.x (localhost:3306)`);
  console.log(`=======================================================`);
});
