import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewTab } from './components/OverviewTab';
import { CasesTab } from './components/CasesTab';
import { LabTestsTab } from './components/LabTestsTab';
import { AlertsTab } from './components/AlertsTab';
import { DBMSLabTab } from './components/DBMSLabTab';
import { SchemaTab } from './components/SchemaTab';
import { CaseModal } from './components/CaseModal';
import { LabTestModal } from './components/LabTestModal';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [dbStatus, setDbStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [cases, setCases] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [rawFeeds, setRawFeeds] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);

  // Modals & Operation State
  const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState(null);
  const [isRunningBatch, setIsRunningBatch] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const loadAllData = async () => {
    try {
      const [
        statusRes,
        statsRes,
        casesRes,
        testsRes,
        feedsRes,
        alertsRes,
        patientsRes,
        diseasesRes,
        facilitiesRes,
        districtsRes,
        auditsRes,
        historyRes
      ] = await Promise.all([
        fetch('/api/status').then(r => r.json()),
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/cases').then(r => r.json()),
        fetch('/api/lab-tests').then(r => r.json()),
        fetch('/api/cursor-feed').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json()),
        fetch('/api/patients').then(r => r.json()),
        fetch('/api/diseases').then(r => r.json()),
        fetch('/api/facilities').then(r => r.json()),
        fetch('/api/districts').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
        fetch('/api/status-history').then(r => r.json()),
      ]);

      setDbStatus(statusRes);
      setStats(statsRes);
      setCases(casesRes);
      setLabTests(testsRes);
      setRawFeeds(feedsRes.feeds || []);
      setAlerts(alertsRes);
      setPatients(patientsRes);
      setDiseases(diseasesRes);
      setFacilities(facilitiesRes);
      setDistricts(districtsRes);
      setAuditLogs(auditsRes);
      setStatusHistory(historyRes);
    } catch (err) {
      console.error('Failed to load surveillance data:', err);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleReconnect = async () => {
    showToast('Probing local MySQL daemon on port 3306...', 'info');
    try {
      const res = await fetch('/api/connect', { method: 'POST' }).then(r => r.json());
      setDbStatus(res.status);
      if (res.success) {
        showToast(`Connected to MySQL (${res.version})!`, 'success');
      } else {
        showToast('MySQL server not active on port 3306. Active in-memory fallback store is running.', 'info');
      }
    } catch (err) {
      showToast('Connection attempt failed.', 'error');
    }
  };

  const handleResetDb = async () => {
    try {
      const res = await fetch('/api/init-db', { method: 'POST' }).then(r => r.json());
      await loadAllData();
      showToast(res.message || 'Database reset successfully!', 'success');
    } catch (err) {
      showToast('Error resetting database.', 'error');
    }
  };

  const handleSaveCase = async (formData, caseId) => {
    try {
      if (caseId) {
        await fetch(`/api/cases/${caseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        showToast(`Case updated! Row-level trigger trg_case_status_history captured the audit transition.`, 'success');
      } else {
        await fetch('/api/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        showToast(`Case registered via sp_register_disease_case() with ACID transaction commit!`, 'success');
      }
      setIsCaseModalOpen(false);
      setCaseToEdit(null);
      await loadAllData();
    } catch (err) {
      showToast('Failed to save case.', 'error');
    }
  };

  const handleDeleteCase = async (caseId) => {
    if (!window.confirm(`Delete case #${caseId} from surveillance records?`)) return;
    try {
      await fetch(`/api/cases/${caseId}`, { method: 'DELETE' });
      showToast(`Case #${caseId} removed from registry. Audit log updated.`, 'info');
      await loadAllData();
    } catch (err) {
      showToast('Failed to delete case.', 'error');
    }
  };

  const handleSaveLabTest = async (formData) => {
    try {
      await fetch('/api/lab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      showToast(`Diagnostic test logged. If POSITIVE, trigger trg_lab_test_auto_confirm updated case status!`, 'success');
      setIsLabModalOpen(false);
      await loadAllData();
    } catch (err) {
      showToast('Failed to add diagnostic test.', 'error');
    }
  };

  const handleRunBatchCursor = async () => {
    setIsRunningBatch(true);
    try {
      const res = await fetch('/api/cursor-feed/run-batch', { method: 'POST' }).then(r => r.json());
      await loadAllData();
      const s = res.summary;
      showToast(
        `Batch Cursor Processed: ${s.processed} ingested, ${s.duplicatesSkipped} duplicates skipped, ${s.errors} errors.`,
        'success'
      );
    } catch (err) {
      showToast('Failed to execute batch cursor.', 'error');
    } finally {
      setIsRunningBatch(false);
    }
  };

  const handleUpdateAlertStatus = async (alertId, newStatus) => {
    try {
      await fetch(`/api/alerts/${alertId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_status: newStatus }),
      });
      showToast(`Alert #${alertId} updated to ${newStatus}.`, 'success');
      await loadAllData();
    } catch (err) {
      showToast('Failed to update alert.', 'error');
    }
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/alerts/evaluate-procedure', { method: 'POST' }).then(r => r.json());
      await loadAllData();
      showToast(res.message, res.alertsCreated > 0 ? 'success' : 'info');
    } catch (err) {
      showToast('Error evaluating outbreak thresholds.', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleExecuteSql = async (sql) => {
    try {
      return await fetch('/api/sql/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      }).then(r => r.json());
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const pendingFeedCount = rawFeeds.filter(f => !f.is_processed).length;
  const openAlertCount = alerts.filter(a => ['OPEN', 'INVESTIGATING'].includes(a.alert_status)).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-slide-down">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center space-x-2 ${
            toastMessage.type === 'success' ? 'bg-emerald-900 text-white border-emerald-700' :
            toastMessage.type === 'error' ? 'bg-rose-900 text-white border-rose-700' :
            'bg-slate-900 text-white border-slate-700'
          }`}>
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dbStatus={dbStatus}
        onReconnect={handleReconnect}
        onResetDb={handleResetDb}
        pendingFeedCount={pendingFeedCount}
        openAlertCount={openAlertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'overview' && (
          <OverviewTab
            stats={stats}
            onNavigate={setActiveTab}
            onTriggerAlgorithm={handleRunEvaluation}
          />
        )}

        {activeTab === 'cases' && (
          <CasesTab
            cases={cases}
            diseases={diseases}
            districts={districts}
            facilities={facilities}
            onAddCase={() => { setCaseToEdit(null); setIsCaseModalOpen(true); }}
            onEditCase={(c) => { setCaseToEdit(c); setIsCaseModalOpen(true); }}
            onDeleteCase={handleDeleteCase}
          />
        )}

        {activeTab === 'labs' && (
          <LabTestsTab
            labTests={labTests}
            rawFeeds={rawFeeds}
            onRunBatchCursor={handleRunBatchCursor}
            onAddLabTest={() => setIsLabModalOpen(true)}
            isRunningBatch={isRunningBatch}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsTab
            alerts={alerts}
            onUpdateAlertStatus={handleUpdateAlertStatus}
            onRunEvaluation={handleRunEvaluation}
            isEvaluating={isEvaluating}
          />
        )}

        {activeTab === 'dbms-lab' && (
          <DBMSLabTab
            onExecuteSql={handleExecuteSql}
            auditLogs={auditLogs}
            statusHistory={statusHistory}
            diseases={diseases}
            districts={districts}
          />
        )}

        {activeTab === 'schema' && (
          <SchemaTab />
        )}
      </main>

      {/* Modals */}
      <CaseModal
        isOpen={isCaseModalOpen}
        onClose={() => { setIsCaseModalOpen(false); setCaseToEdit(null); }}
        onSave={handleSaveCase}
        caseToEdit={caseToEdit}
        patients={patients}
        diseases={diseases}
        facilities={facilities}
      />

      <LabTestModal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        onSave={handleSaveLabTest}
        cases={cases}
        facilities={facilities}
      />

      {/* Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-2">
          <div>
            <strong>Disease Surveillance & Epidemiology Database</strong> — DBMS Mini Project
          </div>
          <div className="flex items-center space-x-3">
            <span>MySQL 8.x • BCNF Design • Poppins • Icons8</span>
            <span>•</span>
            <a
              href="https://github.com/AtharvKulkarni07/DBMSMiniProject"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 font-semibold hover:underline"
            >
              GitHub / AtharvKulkarni07
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
