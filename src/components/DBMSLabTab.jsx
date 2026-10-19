import React, { useState } from 'react';
import {
  CodeIcon,
  PlayIcon,
  TableIcon,
  ShieldCheckIcon,
  ActivityIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  DatabaseIcon
} from './Icons';

export const DBMSLabTab = ({ onExecuteSql, auditLogs, statusHistory, diseases, districts }) => {
  const [subTab, setSubTab] = useState('queries'); // 'queries' | 'explain' | 'routines' | 'triggers' | 'transactions' | 'dcl'

  // SQL Query Runner State
  const [activeQueryKey, setActiveQueryKey] = useState('q1');
  const [customSql, setCustomSql] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Stored Routines Demo State
  const [selectedDistrictId, setSelectedDistrictId] = useState(1);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState(1);
  const [routineResult, setRoutineResult] = useState(null);

  const predefinedQueries = {
    q1: {
      title: '1. 5-Way Multi-Table INNER & LEFT JOIN',
      category: 'Practical 3: Joins',
      description: 'Comprehensive epidemiological case dossier joining disease_case, patient, disease, health_facility, and lab_test.',
      sql: `SELECT
    c.case_code,
    p.patient_code,
    p.sex_at_birth,
    d.disease_name,
    f.facility_name,
    di.district_name,
    c.report_date,
    c.case_status,
    c.severity,
    COALESCE(lt.test_name, 'No Lab Test') AS lab_test_name,
    COALESCE(lt.test_result, 'N/A') AS lab_result
FROM disease_case c
JOIN patient p ON p.patient_id = c.patient_id
JOIN disease d ON d.disease_id = c.disease_id
JOIN health_facility f ON f.facility_id = c.reporting_facility_id
JOIN district di ON di.district_id = f.district_id
LEFT JOIN lab_test lt ON lt.case_id = c.case_id
ORDER BY c.report_date DESC;`
    },
    q2: {
      title: '2. Window Function: DENSE_RANK & Running Cumulative Sum',
      category: 'Practical 3: Window Functions',
      description: 'Computes epidemiological rank and running cumulative caseload partitioned by disease category using DENSE_RANK() and SUM() OVER().',
      sql: `SELECT
    d.disease_category,
    d.disease_name,
    COUNT(c.case_id) AS total_cases,
    DENSE_RANK() OVER (
        PARTITION BY d.disease_category
        ORDER BY COUNT(c.case_id) DESC
    ) AS category_rank,
    SUM(COUNT(c.case_id)) OVER (
        PARTITION BY d.disease_category
        ORDER BY COUNT(c.case_id) DESC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_cumulative_cases
FROM disease d
LEFT JOIN disease_case c ON c.disease_id = d.disease_id
GROUP BY d.disease_category, d.disease_id, d.disease_name
ORDER BY d.disease_category, category_rank;`
    },
    q3: {
      title: '3. Window Function: LAG() for Epidemic Progression Trend',
      category: 'Practical 3: Window Functions',
      description: 'Tracks day-over-day surveillance trends by comparing each day with the previous day using LAG().',
      sql: `WITH daily_trend AS (
    SELECT report_date, COUNT(*) AS daily_cases
    FROM disease_case
    GROUP BY report_date
)
SELECT
    report_date,
    daily_cases,
    LAG(daily_cases, 1, 0) OVER (ORDER BY report_date) AS prev_day_cases,
    daily_cases - LAG(daily_cases, 1, 0) OVER (ORDER BY report_date) AS day_over_day_change
FROM daily_trend
ORDER BY report_date;`
    },
    q4: {
      title: '4. Correlated Subquery: Delay Exceeding Disease Average',
      category: 'Practical 3: Subqueries',
      description: 'Retrieves patient cases where symptom onset-to-report delay is strictly greater than the calculated mean delay for that specific disease.',
      sql: `SELECT
    c.case_code,
    d.disease_name,
    c.onset_date,
    c.report_date,
    DATEDIFF(c.report_date, c.onset_date) AS delay_days
FROM disease_case c
JOIN disease d ON d.disease_id = c.disease_id
WHERE c.onset_date IS NOT NULL
  AND DATEDIFF(c.report_date, c.onset_date) > (
      SELECT AVG(DATEDIFF(c2.report_date, c2.onset_date))
      FROM disease_case c2
      WHERE c2.disease_id = c.disease_id
        AND c2.onset_date IS NOT NULL
  )
ORDER BY delay_days DESC;`
    },
    q5: {
      title: '5. Set Operator: UNION for Critical Intervention Cohort',
      category: 'Practical 3: Set Operations',
      description: 'Combines two distinct risk subsets: Patients presenting with SEVERE/CRITICAL condition UNION patients with positive Cholera test.',
      sql: `SELECT p.patient_code, p.full_name_masked, di.district_name, 'CRITICAL_SEVERITY' AS trigger_reason
FROM disease_case c
JOIN patient p ON p.patient_id = c.patient_id
JOIN health_facility f ON f.facility_id = c.reporting_facility_id
JOIN district di ON di.district_id = f.district_id
WHERE c.severity IN ('SEVERE', 'CRITICAL')
UNION
SELECT p.patient_code, p.full_name_masked, di.district_name, 'CONFIRMED_CHOLERA' AS trigger_reason
FROM disease_case c
JOIN patient p ON p.patient_id = c.patient_id
JOIN health_facility f ON f.facility_id = c.reporting_facility_id
JOIN district di ON di.district_id = f.district_id
JOIN lab_test lt ON lt.case_id = c.case_id
WHERE lt.test_result = 'POSITIVE' AND lt.test_name LIKE '%Cholera%'
ORDER BY patient_code;`
    },
    q6: {
      title: '6. Grouping with HAVING: High Disease Diversity Districts',
      category: 'Practical 3: Grouping & HAVING',
      description: 'Aggregates case counts by district and filters only districts that have at least 2 distinct pathogens circulating.',
      sql: `SELECT
    di.district_name,
    COUNT(c.case_id) AS total_cases,
    COUNT(DISTINCT c.disease_id) AS distinct_pathogens,
    SUM(c.case_status = 'CONFIRMED') AS confirmed_cases,
    ROUND(SUM(c.case_status = 'CONFIRMED') * 100.0 / COUNT(c.case_id), 1) AS confirmation_pct
FROM disease_case c
JOIN health_facility f ON f.facility_id = c.reporting_facility_id
JOIN district di ON di.district_id = f.district_id
GROUP BY di.district_id, di.district_name
HAVING COUNT(c.case_id) >= 2
ORDER BY total_cases DESC;`
    },
    q7: {
      title: '7. Database View: v_case_lab_summary',
      category: 'Practical 2: Views',
      description: 'Restricted reporting view aggregating total lab diagnostic counts and positivity per case.',
      sql: `SELECT * FROM v_case_lab_summary ORDER BY report_date DESC LIMIT 10;`
    }
  };

  const handleSelectQuery = (key) => {
    setActiveQueryKey(key);
    setCustomSql(predefinedQueries[key].sql);
  };

  const handleExecute = async (sqlToRun) => {
    setIsExecuting(true);
    const sql = sqlToRun || customSql || predefinedQueries[activeQueryKey].sql;
    const res = await onExecuteSql(sql);
    setQueryResult(res);
    setIsExecuting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Sub-navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap gap-1">
        {[
          { id: 'queries', label: '1. Complex SQL Queries (Prac 3)' },
          { id: 'explain', label: '2. Query Processing & EXPLAIN (Prac 7)' },
          { id: 'routines', label: '3. Stored Procedures & Functions (Prac 4-5)' },
          { id: 'triggers', label: '4. Database Triggers & Audit Log (Prac 6)' },
          { id: 'transactions', label: '5. Transactions & ACID (TCL)' },
          { id: 'dcl', label: '6. DCL (GRANT & REVOKE)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              subTab === tab.id
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================================================================== */}
      {/* SUB-TAB 1: COMPLEX SQL QUERIES */}
      {/* ==================================================================== */}
      {subTab === 'queries' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Query Selector List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                Syllabus Query Catalog
              </span>
              {Object.entries(predefinedQueries).map(([key, q]) => (
                <button
                  key={key}
                  onClick={() => handleSelectQuery(key)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition ${
                    activeQueryKey === key
                      ? 'border-teal-500 bg-teal-50/50 text-teal-900 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-teal-700 mb-0.5">{q.category}</div>
                  <div className="font-semibold text-slate-900 line-clamp-1">{q.title}</div>
                  <div className="text-[11px] text-slate-500 font-normal line-clamp-2 mt-1">{q.description}</div>
                </button>
              ))}
            </div>

            {/* SQL Code Editor & Runner */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {predefinedQueries[activeQueryKey]?.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {predefinedQueries[activeQueryKey]?.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleExecute()}
                    disabled={isExecuting}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    {isExecuting ? (
                      <RefreshCwIcon className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <PlayIcon className="w-3.5 h-3.5" />
                    )}
                    <span>Run Query</span>
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4">
                  <div className="text-[11px] font-mono text-slate-400 mb-2 flex justify-between">
                    <span>MySQL 8.0 SQL Syntax</span>
                    <span>Ready</span>
                  </div>
                  <textarea
                    rows="9"
                    value={customSql || predefinedQueries[activeQueryKey].sql}
                    onChange={(e) => setCustomSql(e.target.value)}
                    className="w-full bg-transparent font-mono text-xs text-teal-300 focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Execution Status / Timing */}
              {queryResult && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>Execution Status: <strong>{queryResult.success ? 'SUCCESS' : 'FAILED'}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-teal-700 font-semibold">{queryResult.executionTimeMs} ms</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Source: {queryResult.source}</span>
                </div>
              )}
            </div>
          </div>

          {/* Results Table */}
          {queryResult?.data && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs overflow-hidden">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-slate-900">
                  Query Output ({queryResult.data.length} row(s))
                </h4>
                <span className="text-xs text-slate-500 font-mono">Rendered dynamically</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs max-h-96">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                    <tr className="text-slate-600 uppercase tracking-wider text-[10px] font-bold">
                      {Object.keys(queryResult.data[0] || {}).map((col) => (
                        <th key={col} className="py-2.5 px-3 whitespace-nowrap">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {queryResult.data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition">
                        {Object.values(row).map((val, cIdx) => (
                          <td key={cIdx} className="py-2.5 px-3 text-slate-800 whitespace-nowrap">
                            {typeof val === 'boolean' ? (val ? 'TRUE' : 'FALSE') : String(val ?? 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 2: QUERY PROCESSING & EXPLAIN (Practical 7) */}
      {/* ==================================================================== */}
      {subTab === 'explain' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[11px] font-semibold mb-2">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-teal-700" />
              <span>Module III & Practical 7: Query Cost & B-Tree Indexing</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Query Optimization & Execution Plan Analysis (EXPLAIN)
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              In this database, composite B-Tree index <code className="font-mono bg-slate-100 text-teal-800 px-1 py-0.5 rounded">idx_case_disease_date (disease_id, report_date)</code> was
              designed on <code className="font-mono bg-slate-100 text-teal-800 px-1 py-0.5 rounded">disease_case</code> to convert sequential Table Scans (<code className="font-mono text-rose-700">type: ALL</code>)
              into efficient index ref lookups (<code className="font-mono text-emerald-700">type: ref</code>).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-xs font-bold text-slate-800 uppercase block mb-1">Target Optimized SQL Statement:</span>
              <pre className="font-mono text-xs text-slate-800 bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto">
{`EXPLAIN
SELECT case_id, case_code, severity, outcome
FROM disease_case
WHERE disease_id = 1
  AND report_date BETWEEN '2026-10-01' AND '2026-10-31';`}
              </pre>
              <button
                onClick={() => handleExecute(`EXPLAIN SELECT case_id, case_code, severity, outcome FROM disease_case WHERE disease_id = 1 AND report_date BETWEEN '2026-10-01' AND '2026-10-31';`)}
                className="mt-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <PlayIcon className="w-3.5 h-3.5" />
                <span>Run EXPLAIN Analyzer</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/30">
              <span className="text-xs font-bold text-teal-900 uppercase block mb-1">Index Plan Highlights:</span>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside mt-2 leading-relaxed">
                <li><strong>type = ref / range:</strong> Uses index instead of full table scan.</li>
                <li><strong>possible_keys:</strong> <code className="font-mono text-teal-800">idx_case_disease_date</code></li>
                <li><strong>key_len:</strong> 7 bytes (4 bytes for INT disease_id + 3 bytes for DATE)</li>
                <li><strong>rows examined:</strong> Dramatically reduced compared to total rows.</li>
                <li><strong>Extra:</strong> <code className="font-mono text-teal-800">Using index condition; Using where</code></li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 3: STORED PROCEDURES & FUNCTIONS (Practicals 4 & 5) */}
      {/* ==================================================================== */}
      {subTab === 'routines' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[11px] font-semibold mb-2">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-teal-700" />
              <span>Practical 4 & 5: Procedural SQL, Procedures & Functions</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Interactive Stored Procedures & User-Defined Functions Runner
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Test procedural routines with IN/OUT parameter passing and exception handling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Procedure Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                1. Procedure: <code className="text-teal-800 font-mono">sp_district_disease_counts()</code>
              </h4>
              <p className="text-xs text-slate-600">
                Accepts <code className="font-mono">p_district_id</code>, <code className="font-mono">p_start_date</code>, and <code className="font-mono">p_end_date</code> to return grouped surveillance counts.
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Select District:</label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(parseInt(e.target.value, 10))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  {districts.map((d) => (
                    <option key={d.district_id} value={d.district_id}>{d.district_name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleExecute(`CALL sp_district_disease_counts(${selectedDistrictId}, '2026-10-01', '2026-10-31');`)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition"
              >
                Execute CALL sp_district_disease_counts()
              </button>
            </div>

            {/* Function Card */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">
                2. Stored Function: <code className="text-teal-800 font-mono">fn_confirmation_rate()</code>
              </h4>
              <p className="text-xs text-slate-600">
                Computes laboratory confirmation percentage for a given disease ID.
              </p>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Select Pathogen:</label>
                <select
                  value={selectedDiseaseId}
                  onChange={(e) => setSelectedDiseaseId(parseInt(e.target.value, 10))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  {diseases.map((d) => (
                    <option key={d.disease_id} value={d.disease_id}>{d.disease_name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleExecute(`SELECT fn_confirmation_rate(${selectedDiseaseId}, '2026-10-01', '2026-10-31') AS confirmation_pct;`)}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold py-2.5 rounded-xl shadow-xs transition"
              >
                Execute SELECT fn_confirmation_rate()
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 4: DATABASE TRIGGERS & AUDIT LOG (Practical 6) */}
      {/* ==================================================================== */}
      {subTab === 'triggers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900">
              Row-Level Triggers & Real-Time Audit Log Feed (<code className="font-mono text-teal-800">audit_log</code>)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Every insert and update on <code className="font-mono">disease_case</code> automatically triggers an entry into <code className="font-mono">audit_log</code> and <code className="font-mono">case_status_history</code>.
            </p>

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold bg-slate-50/70">
                    <th className="py-2.5 px-3">Audit ID</th>
                    <th className="py-2.5 px-3">Target Table</th>
                    <th className="py-2.5 px-3">Record Key</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Actor / Trigger</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Payload Diffs (JSON)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.audit_id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-600">#{log.audit_id}</td>
                      <td className="py-2.5 px-3 text-slate-900">{log.table_name}</td>
                      <td className="py-2.5 px-3 text-teal-800">case_id={log.record_key}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action_type === 'INSERT' ? 'bg-emerald-100 text-emerald-800' :
                            log.action_type === 'UPDATE' ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {log.action_type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">{log.actor}</td>
                      <td className="py-2.5 px-3 text-slate-500">{log.changed_at}</td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate" title={JSON.stringify(log.new_values)}>
                        {JSON.stringify(log.new_values)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status Transitions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h4 className="text-base font-bold text-slate-900 mb-1">
              Trigger-Captured Status Transitions (<code className="font-mono text-teal-800">case_status_history</code>)
            </h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold bg-slate-50/70">
                    <th className="py-2 px-3">History ID</th>
                    <th className="py-2 px-3">Case ID</th>
                    <th className="py-2 px-3">Old Status</th>
                    <th className="py-2 px-3">New Status</th>
                    <th className="py-2 px-3">Change Reason</th>
                    <th className="py-2 px-3 text-right">Transition Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {statusHistory.map((h) => (
                    <tr key={h.history_id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-600">#{h.history_id}</td>
                      <td className="py-2.5 px-3 text-teal-800">case_id={h.case_id}</td>
                      <td className="py-2.5 px-3 text-slate-500">{h.old_status || 'N/A'}</td>
                      <td className="py-2.5 px-3 font-semibold text-teal-700">{h.new_status}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-700">{h.change_reason}</td>
                      <td className="py-2.5 px-3 text-slate-500 text-right">{h.changed_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 5: TRANSACTIONS & ACID / TCL */}
      {/* ==================================================================== */}
      {subTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-slate-900">
            Transaction Control Language (TCL) & ACID Properties
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
            In clinical disease surveillance, partial updates could corrupt infection registers.
            TCL ensures <strong>Atomicity</strong> and <strong>Consistency</strong> through Savepoints.
          </p>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 font-mono text-xs space-y-3">
            <div className="text-slate-400">// Demonstration of SAVEPOINT & Partial Rollback</div>
            <div><span className="text-teal-400 font-bold">START TRANSACTION;</span></div>
            <div className="pl-4">
              <span className="text-slate-400">-- Step 1: Valid clinical update</span><br/>
              UPDATE disease_case SET severity = 'SEVERE' WHERE case_code = 'CASE-2026-PUN-001';
            </div>
            <div className="pl-4">
              <span className="text-teal-400 font-bold">SAVEPOINT</span> sp_severity_updated;
            </div>
            <div className="pl-4">
              <span className="text-slate-400">-- Step 2: Mistaken diagnosis to be undone</span><br/>
              UPDATE disease_case SET case_status = 'FATAL' WHERE case_code = 'CASE-2026-PUN-001';
            </div>
            <div className="pl-4">
              <span className="text-amber-400 font-bold">ROLLBACK TO SAVEPOINT</span> sp_severity_updated;
            </div>
            <div><span className="text-teal-400 font-bold">COMMIT;</span></div>
            <div className="text-slate-400">// Result: Severity is saved as SEVERE; FATAL status change is safely discarded!</div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-TAB 6: DCL (GRANT & REVOKE) */}
      {/* ==================================================================== */}
      {subTab === 'dcl' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-slate-900">
            Data Control Language (DCL): Role-Based Security
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
            Enforces the principle of least privilege by granting access only to reporting views (<code className="font-mono">v_case_lab_summary</code>)
            rather than granting raw underlying table access.
          </p>

          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 font-mono text-xs space-y-3">
            <div className="text-slate-400">// 1. Surveillance Data Analyst (Read-Only Views)</div>
            <div>CREATE USER 'surveillance_analyst'@'localhost' IDENTIFIED BY 'EpidemiologySafe2026!';</div>
            <div>GRANT SELECT ON disease_surveillance.v_case_lab_summary TO 'surveillance_analyst'@'localhost';</div>
            <div>GRANT SELECT ON disease_surveillance.v_district_daily_cases TO 'surveillance_analyst'@'localhost';</div>
            <div>REVOKE SELECT ON disease_surveillance.v_district_daily_cases FROM 'surveillance_analyst'@'localhost';</div>
            <br/>
            <div className="text-slate-400">// 2. Facility Clerk (Limited DML on disease_case only)</div>
            <div>CREATE USER 'facility_clerk'@'localhost' IDENTIFIED BY 'ClerkSecure2026!';</div>
            <div>GRANT SELECT, INSERT, UPDATE ON disease_surveillance.disease_case TO 'facility_clerk'@'localhost';</div>
            <div>FLUSH PRIVILEGES;</div>
          </div>
        </div>
      )}
    </div>
  );
};
