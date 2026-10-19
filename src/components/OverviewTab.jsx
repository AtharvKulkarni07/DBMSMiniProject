import React from 'react';
import {
  ActivityIcon,
  VirusIcon,
  AlertTriangleIcon,
  HospitalIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon
} from './Icons';

export const OverviewTab = ({ stats, onNavigate, onTriggerAlgorithm }) => {
  if (!stats) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { kpis, diseaseBreakdown, districtRisk, recentAlerts } = stats;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Welcome / Context Banner */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-teal-50/40 rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-3">
              <SparklesIcon className="w-3.5 h-3.5 text-teal-600" />
              <span>Biomedical & Epidemiological Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Statewide Public Health Surveillance Bureau
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-3xl leading-relaxed">
              Real-time epidemiological monitoring demonstrating relational database design up to BCNF,
              complex SQL analytics, ACID transactions, row-level triggers, explicit cursors, and query optimization.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('cases')}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-1.5"
            >
              <span>View Active Cases</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('dbms-lab')}
              className="bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs transition"
            >
              Open DBMS Workbench
            </button>
          </div>
        </div>
      </div>

      {/* Top Organizational KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Cases</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <VirusIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">{kpis.activeCases}</div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <span className="text-teal-700 font-medium">{kpis.confirmedCases} Confirmed</span>
              <span>•</span>
              <span className="text-amber-600 font-medium">{kpis.suspectedCases} Suspected</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Total Encounters: {kpis.totalCases}</span>
            <span className="text-emerald-600 font-medium">{kpis.recoveredCases} Recovered</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Positivity Rate</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ActivityIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">{kpis.positivityRate}</div>
            <div className="text-xs text-slate-500 mt-1">
              Diagnostic Diagnostic Yield
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Conducted Tests: {kpis.totalTests}</span>
            <span className="text-indigo-600 font-medium">ELISA / RT-PCR</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outbreak Warnings</span>
            <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <AlertTriangleIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">{kpis.openAlerts}</div>
            <div className="text-xs text-rose-600 font-medium mt-1">
              Automated Surveillance Signals
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Threshold: 7-14 Day Surge</span>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-rose-700 font-semibold hover:underline"
            >
              Review Alerts &rarr;
            </button>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Jurisdictions</span>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
              <HospitalIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">{kpis.totalDistricts}</div>
            <div className="text-xs text-slate-500 mt-1">
              Monitored Public Health Districts
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{kpis.totalFacilities} Health Facilities</span>
            <span className="text-sky-600 font-medium">Maharashtra</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: District Risk Matrix (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                District Risk Index Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Computed via MySQL Stored Function <code className="bg-slate-100 text-teal-800 px-1 py-0.5 rounded font-mono">fn_calculate_risk_index(district_id, disease_id)</code>
              </p>
            </div>
            <span className="text-[11px] bg-slate-50 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-full font-medium">
              30-Day Moving Window
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 text-slate-500 uppercase tracking-wider text-[11px] font-semibold bg-slate-50/50">
                  <th className="py-2.5 px-3">District</th>
                  <th className="py-2.5 px-3">Population</th>
                  <th className="py-2.5 px-3">Active Cases</th>
                  <th className="py-2.5 px-3">Confirmed</th>
                  <th className="py-2.5 px-3">Dynamic Risk Score</th>
                  <th className="py-2.5 px-3 text-right">Surveillance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {districtRisk.map((dist) => (
                  <tr key={dist.district_id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div className="flex items-center space-x-2">
                        <span>{dist.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({dist.code})</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono">
                      {dist.population.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      {dist.activeCases}
                    </td>
                    <td className="py-3 px-3 text-teal-700 font-semibold">
                      {dist.confirmedCases}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${
                              dist.riskLevel === 'CRITICAL' ? 'bg-rose-500' :
                              dist.riskLevel === 'HIGH' ? 'bg-amber-500' :
                              dist.riskLevel === 'MODERATE' ? 'bg-indigo-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${dist.riskScore}%` }}
                          />
                        </div>
                        <span className="font-mono font-medium text-slate-700">{dist.riskScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                          dist.riskLevel === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          dist.riskLevel === 'HIGH' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                          dist.riskLevel === 'MODERATE' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {dist.riskLevel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Disease Thresholds & Outbreak Ticker */}
        <div className="space-y-6">
          {/* Disease Caseload vs Alert Threshold */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-semibold text-slate-900">
              Pathogen Caseload vs Threshold
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Weekly threshold monitoring (<code className="font-mono">alert_threshold_weekly</code>)
            </p>

            <div className="mt-4 space-y-4">
              {diseaseBreakdown.map((dis) => {
                const pct = Math.min(100, Math.round((dis.casesCount / dis.threshold) * 100));
                const isBreached = dis.casesCount >= dis.threshold;
                return (
                  <div key={dis.disease_id} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-800">{dis.name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {dis.casesCount} / {dis.threshold} weekly limit
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isBreached ? 'bg-rose-500' : 'bg-teal-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Outbreak Alerts Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-slate-900">
                Surveillance Signals
              </h3>
              <button
                onClick={() => onNavigate('alerts')}
                className="text-xs text-teal-700 font-semibold hover:underline"
              >
                All Alerts
              </button>
            </div>

            <div className="space-y-3">
              {recentAlerts.map((alt) => (
                <div
                  key={alt.alert_id}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-slate-900">
                      {alt.disease_name} — {alt.district_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        alt.alert_level === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        alt.alert_level === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {alt.alert_level}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {alt.resolution_notes}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Observed: {alt.observed_case_count} (Limit: {alt.threshold_case_count})</span>
                    <span className="uppercase font-semibold text-teal-700">{alt.alert_status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Educational Callout: Academic Mapping */}
      <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>DBMS Curriculum Mapping (Modules I to IV & Group B Practicals)</span>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl">
              This system fully implements: <strong>BCNF Normalization</strong>, <strong>Foreign Key integrity with CASCADE</strong>,
              <strong>Database Views</strong> (<code className="text-teal-300 font-mono text-xs">v_case_lab_summary</code>),
              <strong>Row-level Triggers</strong> (<code className="text-teal-300 font-mono text-xs">trg_case_audit_insert</code>,
              <code className="text-teal-300 font-mono text-xs">trg_lab_test_auto_confirm</code>),
              <strong>Explicit Cursors</strong> (<code className="text-teal-300 font-mono text-xs">sp_ingest_lab_feed_cursor</code>), and
              <strong>Query Execution Plans (EXPLAIN)</strong>.
            </p>
          </div>
          <button
            onClick={() => onNavigate('schema')}
            className="whitespace-nowrap bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shadow-xs"
          >
            Review BCNF & Schema Proofs
          </button>
        </div>
      </div>
    </div>
  );
};
