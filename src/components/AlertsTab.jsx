import React, { useState } from 'react';
import {
  AlertTriangleIcon,
  PlayIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ActivityIcon,
  ShieldCheckIcon,
  RefreshCwIcon
} from './Icons';

export const AlertsTab = ({ alerts, onUpdateAlertStatus, onRunEvaluation, isEvaluating }) => {
  const [filterLevel, setFilterLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredAlerts = alerts.filter((a) => {
    const matchesLevel = !filterLevel || a.alert_level === filterLevel;
    const matchesStatus = !filterStatus || a.alert_status === filterStatus;
    return matchesLevel && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ==================================================================== */}
      {/* AUTOMATED OUTBREAK EVALUATION ALGORITHM BANNER */}
      {/* ==================================================================== */}
      <div className="bg-gradient-to-r from-rose-50/60 via-white to-amber-50/40 rounded-2xl border border-rose-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[11px] font-semibold mb-2">
              <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-700" />
              <span>Module II & IV: Procedural SQL & Surveillance Signals</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Automated Outbreak Evaluation Routine (<code className="font-mono text-rose-800">sp_evaluate_outbreak_thresholds</code>)
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Executes a procedural algorithm scanning recent 14-day surveillance encounters.
              When observed cases in any district cross the pathogen's statutory alert threshold,
              the stored procedure automatically computes alert severity (<code className="font-mono text-slate-800">CRITICAL</code>,
              <code className="font-mono text-slate-800">HIGH</code>, or <code className="font-mono text-slate-800">MEDIUM</code>)
              and spawns a new record in relation <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">outbreak_alert</code>.
            </p>
          </div>

          <button
            onClick={onRunEvaluation}
            disabled={isEvaluating}
            className={`whitespace-nowrap text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-2 ${
              !isEvaluating
                ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isEvaluating ? (
              <>
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                <span>Evaluating Thresholds...</span>
              </>
            ) : (
              <>
                <PlayIcon className="w-4 h-4" />
                <span>Run Outbreak Algorithm (14-Day Scan)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* ACTIVE OUTBREAK ALERTS CARDS */}
      {/* ==================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <ActivityIcon className="w-5 h-5 text-rose-600" />
              <span>Active Epidemiological Alerts ({filteredAlerts.length})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live alert snapshot from view <code className="font-mono text-teal-800">v_open_outbreak_alerts</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="">All Alert Levels</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="">All Lifecycle Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-6">
          {filteredAlerts.map((alert) => {
            const isCritical = alert.alert_level === 'CRITICAL';
            const isHigh = alert.alert_level === 'HIGH';
            const surgePct = Math.round(
              ((alert.observed_case_count - alert.threshold_case_count) / alert.threshold_case_count) * 100
            );

            return (
              <div
                key={alert.alert_id}
                className={`rounded-2xl border p-5 transition flex flex-col justify-between shadow-2xs ${
                  isCritical
                    ? 'border-rose-200 bg-rose-50/30'
                    : isHigh
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {alert.alert_code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                        isCritical
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isHigh
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {alert.alert_level}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {alert.disease_name}
                  </h4>
                  <p className="text-xs font-medium text-teal-800 mt-0.5">
                    District: {alert.district_name}
                  </p>

                  {/* Threshold Surge Visualizer */}
                  <div className="mt-4 p-3 bg-white/80 rounded-xl border border-slate-200/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium">Surge Level:</span>
                      <span className="font-bold text-rose-700">+{surgePct}% over baseline</span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${isCritical ? 'bg-rose-500' : 'bg-amber-500'}`}
                        style={{ width: `${Math.min(100, Math.max(10, surgePct))}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                      <span>Observed: {alert.observed_case_count} cases</span>
                      <span>Threshold: {alert.threshold_case_count} cases</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                    {alert.resolution_notes}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase">
                    Status: <strong className="text-slate-800">{alert.alert_status}</strong>
                  </span>

                  <div className="flex space-x-1.5">
                    {alert.alert_status === 'OPEN' && (
                      <button
                        onClick={() => onUpdateAlertStatus(alert.alert_id, 'INVESTIGATING')}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold transition"
                      >
                        Investigate
                      </button>
                    )}
                    {alert.alert_status === 'INVESTIGATING' && (
                      <button
                        onClick={() => onUpdateAlertStatus(alert.alert_id, 'RESOLVED')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                    {alert.alert_status === 'RESOLVED' && (
                      <span className="text-emerald-700 font-medium text-[11px] flex items-center space-x-1">
                        <CheckCircleIcon className="w-3.5 h-3.5" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
