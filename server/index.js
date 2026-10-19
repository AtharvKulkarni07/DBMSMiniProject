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
  memoryStore
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ─── DB Status ───────────────────────────────────────────────────────────────
app.get('/api/status', (req, res) => res.json(getDbStatus()));

app.post('/api/connect', async (req, res) => {
  const result = await tryConnectMySQL();
  res.json({ ...result, status: getDbStatus() });
});

// Helper: run query against MySQL pool, fall back to in-memory handler
async function query(sql, params, fallback) {
  const status = getDbStatus();
  if (status.isConnected) {
    try {
      const result = await executeSQL(sql, params);
      return { rows: result.rows ?? result.results ?? [], error: result.error };
    } catch (e) {
      return { rows: [], error: e.message };
    }
  }
  return { rows: fallback(), error: null };
}

// ─── DISEASES ─────────────────────────────────────────────────────────────────
app.get('/api/diseases', (req, res) => {
  res.json(memoryStore.diseases);
});

app.post('/api/diseases', async (req, res) => {
  const { disease_code, disease_name, disease_category, transmission_mode, alert_threshold_weekly, is_notifiable, description } = req.body;
  if (!disease_name) return res.status(400).json({ error: 'disease_name is required' });

  const newItem = {
    disease_id: memoryStore.diseases.length + 1,
    disease_code: disease_code || `DIS-${Date.now().toString().slice(-5)}`,
    disease_name,
    disease_category: disease_category || 'OTHER',
    transmission_mode: transmission_mode || 'UNKNOWN',
    alert_threshold_weekly: parseInt(alert_threshold_weekly, 10) || 5,
    is_notifiable: is_notifiable ?? 1,
    description: description || ''
  };

  const status = getDbStatus();
  if (status.isConnected) {
    const r = await executeSQL(
      `INSERT INTO disease (disease_code, disease_name, disease_category, transmission_mode, alert_threshold_weekly, is_notifiable, description) VALUES (?,?,?,?,?,?,?)`,
      [newItem.disease_code, newItem.disease_name, newItem.disease_category, newItem.transmission_mode, newItem.alert_threshold_weekly, newItem.is_notifiable, newItem.description]
    );
    if (r.error) return res.status(500).json({ error: r.error });
    newItem.disease_id = r.results?.insertId ?? newItem.disease_id;
  }

  memoryStore.diseases.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/diseases/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = memoryStore.diseases.find(d => d.disease_id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  const fields = ['disease_name', 'disease_category', 'transmission_mode', 'alert_threshold_weekly', 'is_notifiable', 'description'];
  fields.forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });

  const status = getDbStatus();
  if (status.isConnected) {
    await executeSQL(
      `UPDATE disease SET disease_name=?, disease_category=?, transmission_mode=?, alert_threshold_weekly=?, is_notifiable=?, description=? WHERE disease_id=?`,
      [item.disease_name, item.disease_category, item.transmission_mode, item.alert_threshold_weekly, item.is_notifiable, item.description, id]
    );
  }

  res.json(item);
});

app.delete('/api/diseases/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = memoryStore.diseases.findIndex(d => d.disease_id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const status = getDbStatus();
  if (status.isConnected) {
    await executeSQL(`DELETE FROM disease WHERE disease_id=?`, [id]);
  }

  memoryStore.diseases.splice(idx, 1);
  res.json({ success: true });
});

// ─── DISTRICTS ────────────────────────────────────────────────────────────────
app.get('/api/districts', (req, res) => res.json(memoryStore.districts));

app.post('/api/districts', async (req, res) => {
  const { district_code, district_name, state_name, population } = req.body;
  if (!district_name) return res.status(400).json({ error: 'district_name is required' });

  const newItem = {
    district_id: memoryStore.districts.length + 1,
    district_code: district_code || `DIST-${Date.now().toString().slice(-4)}`,
    district_name,
    state_name: state_name || '',
    population: parseInt(population, 10) || 0
  };

  const status = getDbStatus();
  if (status.isConnected) {
    const r = await executeSQL(
      `INSERT INTO district (district_code, district_name, state_name, population) VALUES (?,?,?,?)`,
      [newItem.district_code, newItem.district_name, newItem.state_name, newItem.population]
    );
    if (r.error) return res.status(500).json({ error: r.error });
    newItem.district_id = r.results?.insertId ?? newItem.district_id;
  }

  memoryStore.districts.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/districts/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = memoryStore.districts.find(d => d.district_id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  ['district_name', 'state_name', 'population'].forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });

  const status = getDbStatus();
  if (status.isConnected) {
    await executeSQL(
      `UPDATE district SET district_name=?, state_name=?, population=? WHERE district_id=?`,
      [item.district_name, item.state_name, item.population, id]
    );
  }

  res.json(item);
});

app.delete('/api/districts/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = memoryStore.districts.findIndex(d => d.district_id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const status = getDbStatus();
  if (status.isConnected) {
    await executeSQL(`DELETE FROM district WHERE district_id=?`, [id]);
  }

  memoryStore.districts.splice(idx, 1);
  res.json({ success: true });
});

// ─── FACILITIES ───────────────────────────────────────────────────────────────
app.get('/api/facilities', (req, res) => res.json(memoryStore.facilities));

app.post('/api/facilities', async (req, res) => {
  const { facility_code, facility_name, facility_type, district_id, contact_phone, address_line, is_active } = req.body;
  if (!facility_name) return res.status(400).json({ error: 'facility_name is required' });

  const newItem = {
    facility_id: memoryStore.facilities.length + 1,
    facility_code: facility_code || `FAC-${Date.now().toString().slice(-5)}`,
    facility_name,
    facility_type: facility_type || 'CLINIC',
    district_id: parseInt(district_id, 10) || 1,
    contact_phone: contact_phone || '',
    address_line: address_line || '',
    is_active: is_active ?? 1
  };

  const status = getDbStatus();
  if (status.isConnected) {
    const r = await executeSQL(
      `INSERT INTO health_facility (facility_code, facility_name, facility_type, district_id, contact_phone, address_line, is_active) VALUES (?,?,?,?,?,?,?)`,
      [newItem.facility_code, newItem.facility_name, newItem.facility_type, newItem.district_id, newItem.contact_phone, newItem.address_line, newItem.is_active]
    );
    if (r.error) return res.status(500).json({ error: r.error });
    newItem.facility_id = r.results?.insertId ?? newItem.facility_id;
  }

  memoryStore.facilities.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/facilities/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = memoryStore.facilities.find(f => f.facility_id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  ['facility_name', 'facility_type', 'district_id', 'contact_phone', 'address_line', 'is_active'].forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });

  const status = getDbStatus();
  if (status.isConnected) {
    await executeSQL(
      `UPDATE health_facility SET facility_name=?, facility_type=?, district_id=?, contact_phone=?, address_line=?, is_active=? WHERE facility_id=?`,
      [item.facility_name, item.facility_type, item.district_id, item.contact_phone, item.address_line, item.is_active, id]
    );
  }

  res.json(item);
});

app.delete('/api/facilities/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = memoryStore.facilities.findIndex(f => f.facility_id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const status = getDbStatus();
  if (status.isConnected) {
    await executeSQL(`DELETE FROM health_facility WHERE facility_id=?`, [id]);
  }

  memoryStore.facilities.splice(idx, 1);
  res.json({ success: true });
});

// ─── PATIENTS ─────────────────────────────────────────────────────────────────
app.get('/api/patients', (req, res) => res.json(memoryStore.patients));

app.post('/api/patients', async (req, res) => {
  const { patient_code, full_name_masked, date_of_birth, sex_at_birth, district_id } = req.body;
  if (!full_name_masked) return res.status(400).json({ error: 'full_name_masked is required' });

  const newItem = {
    patient_id: memoryStore.patients.length + 1,
    patient_code: patient_code || `PAT-${Date.now().toString().slice(-6)}`,
    full_name_masked,
    date_of_birth: date_of_birth || null,
    sex_at_birth: sex_at_birth || 'UNKNOWN',
    district_id: parseInt(district_id, 10) || 1
  };

  const status = getDbStatus();
  if (status.isConnected) {
    const r = await executeSQL(
      `INSERT INTO patient (patient_code, full_name_masked, date_of_birth, sex_at_birth, district_id) VALUES (?,?,?,?,?)`,
      [newItem.patient_code, newItem.full_name_masked, newItem.date_of_birth, newItem.sex_at_birth, newItem.district_id]
    );
    if (r.error) return res.status(500).json({ error: r.error });
    newItem.patient_id = r.results?.insertId ?? newItem.patient_id;
  }

  memoryStore.patients.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/patients/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = memoryStore.patients.find(p => p.patient_id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  ['full_name_masked', 'date_of_birth', 'sex_at_birth', 'district_id'].forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });

  const status = getDbStatus();
  if (status.isConnected) {
    await executeSQL(
      `UPDATE patient SET full_name_masked=?, date_of_birth=?, sex_at_birth=?, district_id=? WHERE patient_id=?`,
      [item.full_name_masked, item.date_of_birth, item.sex_at_birth, item.district_id, id]
    );
  }

  res.json(item);
});

app.delete('/api/patients/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = memoryStore.patients.findIndex(p => p.patient_id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });

  const status = getDbStatus();
  if (status.isConnected) {
    await executeSQL(`DELETE FROM patient WHERE patient_id=?`, [id]);
  }

  memoryStore.patients.splice(idx, 1);
  res.json({ success: true });
});

// ─── DISEASE CASES ────────────────────────────────────────────────────────────
app.get('/api/cases', (req, res) => {
  const { search, status, disease_id, severity } = req.query;
  let results = memoryStore.cases.map(c => {
    const p = memoryStore.patients.find(x => x.patient_id === c.patient_id);
    const d = memoryStore.diseases.find(x => x.disease_id === c.disease_id);
    const f = memoryStore.facilities.find(x => x.facility_id === c.reporting_facility_id);
    return {
      ...c,
      patient_code: p?.patient_code || 'N/A',
      patient_name: p?.full_name_masked || 'Unknown',
      disease_name: d?.disease_name || 'Unknown',
      disease_category: d?.disease_category || 'OTHER',
      facility_name: f?.facility_name || 'Unknown',
    };
  });

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c =>
      c.case_code?.toLowerCase().includes(q) ||
      c.patient_name?.toLowerCase().includes(q) ||
      c.disease_name?.toLowerCase().includes(q)
    );
  }
  if (status) results = results.filter(c => c.case_status === status);
  if (disease_id) results = results.filter(c => c.disease_id === parseInt(disease_id, 10));
  if (severity) results = results.filter(c => c.severity === severity);

  res.json(results);
});

app.post('/api/cases', (req, res) => {
  const { patient_id, disease_id, reporting_facility_id, onset_date, report_date, case_status, severity, outcome, hospitalized, notes } = req.body;
  if (!patient_id || !disease_id || !reporting_facility_id) {
    return res.status(400).json({ error: 'patient_id, disease_id, and reporting_facility_id are required' });
  }

  const nextId = Math.max(0, ...memoryStore.cases.map(c => c.case_id)) + 1;
  const newCase = {
    case_id: nextId,
    case_code: `CASE-${new Date().getFullYear()}-${String(nextId).padStart(4, '0')}`,
    patient_id: parseInt(patient_id, 10),
    disease_id: parseInt(disease_id, 10),
    reporting_facility_id: parseInt(reporting_facility_id, 10),
    reported_by_user_id: 1,
    onset_date: onset_date || new Date().toISOString().substring(0, 10),
    report_date: report_date || new Date().toISOString().substring(0, 10),
    case_status: case_status || 'SUSPECTED',
    severity: severity || 'MILD',
    outcome: outcome || 'ONGOING',
    hospitalized: hospitalized ?? (severity === 'SEVERE' || severity === 'CRITICAL' ? 1 : 0),
    notes: notes || '',
    created_at: new Date().toISOString()
  };

  memoryStore.cases.unshift(newCase);
  res.status(201).json(newCase);
});

app.put('/api/cases/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = memoryStore.cases.find(c => c.case_id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  ['patient_id', 'disease_id', 'reporting_facility_id', 'onset_date', 'report_date', 'case_status', 'severity', 'outcome', 'hospitalized', 'notes'].forEach(f => {
    if (req.body[f] !== undefined) item[f] = req.body[f];
  });

  res.json(item);
});

app.delete('/api/cases/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = memoryStore.cases.findIndex(c => c.case_id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  memoryStore.cases.splice(idx, 1);
  res.json({ success: true });
});

// ─── LAB TESTS ────────────────────────────────────────────────────────────────
app.get('/api/lab-tests', (req, res) => {
  const { case_id } = req.query;
  let tests = memoryStore.labTests.map(t => {
    const c = memoryStore.cases.find(x => x.case_id === t.case_id);
    const f = memoryStore.facilities.find(x => x.facility_id === t.facility_id);
    const d = memoryStore.diseases.find(x => x.disease_id === c?.disease_id);
    return {
      ...t,
      case_code: c?.case_code || 'N/A',
      disease_name: d?.disease_name || 'N/A',
      facility_name: f?.facility_name || 'N/A',
    };
  });
  if (case_id) tests = tests.filter(t => t.case_id === parseInt(case_id, 10));
  res.json(tests);
});

app.post('/api/lab-tests', (req, res) => {
  const { case_id, facility_id, test_name, test_result, remarks } = req.body;
  if (!case_id || !test_name) return res.status(400).json({ error: 'case_id and test_name are required' });

  const nextId = Math.max(0, ...memoryStore.labTests.map(t => t.lab_test_id)) + 1;
  const newTest = {
    lab_test_id: nextId,
    case_id: parseInt(case_id, 10),
    facility_id: parseInt(facility_id, 10) || 1,
    test_code: `TEST-${String(nextId).padStart(4, '0')}`,
    test_name,
    specimen_collected_at: new Date().toISOString().substring(0, 19).replace('T', ' '),
    result_reported_at: new Date().toISOString().substring(0, 19).replace('T', ' '),
    test_result: test_result || 'PENDING',
    performed_by_user_id: 1,
    remarks: remarks || ''
  };

  memoryStore.labTests.unshift(newTest);

  // Auto-confirm SUSPECTED case if test is POSITIVE
  if (newTest.test_result === 'POSITIVE') {
    const targetCase = memoryStore.cases.find(c => c.case_id === newTest.case_id);
    if (targetCase && targetCase.case_status === 'SUSPECTED') {
      targetCase.case_status = 'CONFIRMED';
    }
  }

  res.status(201).json(newTest);
});

app.put('/api/lab-tests/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = memoryStore.labTests.find(t => t.lab_test_id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });

  ['test_name', 'test_result', 'remarks', 'facility_id'].forEach(f => {
    if (req.body[f] !== undefined) item[f] = req.body[f];
  });

  res.json(item);
});

app.delete('/api/lab-tests/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = memoryStore.labTests.findIndex(t => t.lab_test_id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  memoryStore.labTests.splice(idx, 1);
  res.json({ success: true });
});

// ─── OUTBREAK ALERTS ──────────────────────────────────────────────────────────
app.get('/api/alerts', (req, res) => {
  const alerts = memoryStore.outbreakAlerts.map(a => {
    const dist = memoryStore.districts.find(d => d.district_id === a.district_id);
    const dis = memoryStore.diseases.find(d => d.disease_id === a.disease_id);
    return { ...a, district_name: dist?.district_name || 'N/A', disease_name: dis?.disease_name || 'N/A' };
  });
  res.json(alerts);
});

app.put('/api/alerts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = memoryStore.outbreakAlerts.find(a => a.alert_id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  ['alert_status', 'resolution_notes'].forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });
  res.json(item);
});

// ─── STATIC FRONTEND ──────────────────────────────────────────────────────────
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
  console.log(`  Disease Surveillance DBMS — CRUD API`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`=======================================================`);
  tryConnectMySQL().then(r => {
    if (r.connected) console.log('[Database] Connected to MySQL/MariaDB ✓');
    else console.log('[Database] Fallback: In-Memory Store active');
  });
});
