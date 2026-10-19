import React, { useState } from 'react';
import {
  TableIcon,
  PlayIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PlusIcon,
  ShieldCheckIcon,
  RefreshCwIcon
} from './Icons';

export const LabTestsTab = ({ labTests, rawFeeds, onRunBatchCursor, onAddLabTest, isRunningBatch }) => {
  const [filterResult, setFilterResult] = useState('');
  const [searchTest, setSearchTest] = useState('');

  const pendingFeeds = rawFeeds.filter((f) => !f.is_processed);

  const filteredTests = labTests.filter((t) => {
    const matchesSearch =
      t.test_code.toLowerCase().includes(searchTest.toLowerCase()) ||
      t.case_code.toLowerCase().includes(searchTest.toLowerCase()) ||
      t.test_name.toLowerCase().includes(searchTest.toLowerCase()) ||
      t.facility_name.toLowerCase().includes(searchTest.toLowerCase());

    const matchesResult = !filterResult || t.test_result === filterResult;
    return matchesSearch && matchesResult;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ==================================================================== */}
      {/* PRACTICAL 6: EXPLICIT CURSOR BATCH INGESTION SHOWCASE */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-br from-white via-slate-50 to-teal-50/50 rounded-2xl border border-teal-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-teal-100">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[11px] font-semibold mb-2">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-teal-700" />
              <span>Practical 6 & Coursework Module II: Database Cursors</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Staging Ingestion via MySQL Explicit Cursor (<code className="font-mono text-teal-800">sp_ingest_lab_feed_cursor</code>)
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Demonstrates row-by-row batch processing from staging table <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">raw_lab_feed</code>.
              The explicit cursor loops through pending diagnostic feeds, validates foreign keys, checks for duplicate test records,
              inserts clean tests into <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">lab_test</code>,
              and fires the auto-confirmation trigger.
            </p>
          </div>

          <button
            onClick={onRunBatchCursor}
            disabled={isRunningBatch || pendingFeeds.length === 0}
            className={`whitespace-nowrap text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-2 ${
              pendingFeeds.length > 0 && !isRunningBatch
                ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isRunningBatch ? (
              <>
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                <span>Running Cursor Loop...</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Execute Cursor Batch ({pendingFeeds.length} Pending)</span>
              </>
            )}
          </button>
        </div>

        {/* Incoming Staging Feed Records */}
        <div className="mt-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              External Staging Feed Queue ({rawFeeds.length} items)
            </span>
            <span className="text-[11px] font-mono text-teal-800">
              OPEN cur_feed &rarr; FETCH &rarr; NOT FOUND HANDLER &rarr; CLOSE
            </span>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-semibold bg-slate-50/80">
                  <th className="py-2.5 px-3">Feed ID</th>
                  <th className="py-2.5 px-3">Target Case</th>
                  <th className="py-2.5 px-3">Facility</th>
                  <th className="py-2.5 px-3">Test Code</th>
                  <th className="py-2.5 px-3">Diagnostic Result</th>
                  <th className="py-2.5 px-3 text-right">Cursor Ingestion Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {rawFeeds.map((feed) => (
                  <tr key={feed.feed_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 text-slate-500 font-medium">#{feed.feed_id}</td>
                    <td className="py-2.5 px-3 text-slate-900 font-semibold">{feed.case_code}</td>
                    <td className="py-2.5 px-3 text-slate-600">{feed.facility_code}</td>
                    <td className="py-2.5 px-3 text-slate-700">{feed.test_code}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          feed.test_result === 'POSITIVE' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {feed.test_result}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          feed.process_status === 'SUCCESS_INGESTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          feed.process_status === 'SKIPPED_DUPLICATE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {feed.process_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MASTER DIAGNOSTIC TESTS REGISTRY */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <TableIcon className="w-5 h-5 text-teal-600" />
              <span>Laboratory Diagnostic Tests Master Table (<code className="font-mono text-teal-800">lab_test</code>)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical test results linked to individual disease cases.
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onAddLabTest}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Test Result</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 pb-4">
          <input
            type="text"
            placeholder="Search test code, case, facility, pathogen..."
            value={searchTest}
            onChange={(e) => setSearchTest(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition sm:col-span-2"
          />

          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          >
            <option value="">All Test Results</option>
            <option value="POSITIVE">POSITIVE</option>
            <option value="NEGATIVE">NEGATIVE</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>

        {/* Lab Tests Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200/90 shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/90 text-slate-500 uppercase tracking-wider text-[11px] font-semibold bg-slate-50/70">
                <th className="py-3 px-3.5">Test Code</th>
                <th className="py-3 px-3.5">Case Reference</th>
                <th className="py-3 px-3.5">Diagnostic Test Name</th>
                <th className="py-3 px-3.5">Laboratory Facility</th>
                <th className="py-3 px-3.5">Specimen Collected</th>
                <th className="py-3 px-3.5">Result Reported</th>
                <th className="py-3 px-3.5 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTests.map((test) => (
                <tr key={test.lab_test_id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3 px-3.5 font-mono font-semibold text-slate-900">
                    {test.test_code}
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="font-mono font-medium text-teal-800">{test.case_code}</span>
                    <div className="text-[10px] text-slate-400 font-sans">{test.disease_name}</div>
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="font-medium text-slate-800">{test.test_name}</div>
                    <div className="text-[10px] text-slate-400 italic truncate max-w-[200px]" title={test.remarks}>
                      {test.remarks || 'Standard diagnostic panel'}
                    </div>
                  </td>
                  <td className="py-3 px-3.5 text-slate-600 truncate max-w-[160px]" title={test.facility_name}>
                    {test.facility_name}
                  </td>
                  <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                    {test.specimen_collected_at?.substring(0, 16)}
                  </td>
                  <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                    {test.result_reported_at ? test.result_reported_at.substring(0, 16) : 'Awaiting Result'}
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                        test.test_result === 'POSITIVE' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        test.test_result === 'NEGATIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {test.test_result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
