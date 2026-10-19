import React, { useState } from 'react';
import {
  SearchIcon,
  FilterIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  VirusIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  HospitalIcon
} from './Icons';

export const CasesTab = ({ cases, diseases, districts, facilities, onAddCase, onEditCase, onDeleteCase }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDisease, setSelectedDisease] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [expandedCaseId, setExpandedCaseId] = useState(null);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.case_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.patient_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.disease_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.facility_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || c.case_status === selectedStatus;
    const matchesDisease = !selectedDisease || c.disease_id === parseInt(selectedDisease, 10);
    const matchesSeverity = !selectedSeverity || c.severity === selectedSeverity;
    const matchesDistrict = !selectedDistrict || c.district_id === parseInt(selectedDistrict, 10);

    return matchesSearch && matchesStatus && matchesDisease && matchesSeverity && matchesDistrict;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header & Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <VirusIcon className="w-5 h-5 text-teal-600" />
              <span>Epidemiological Cases Registry</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Primary operational relation <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-teal-800">disease_case</code> (Normalized to BCNF)
            </p>
          </div>

          <button
            onClick={onAddCase}
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Register New Case</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-5">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by code, patient, disease, hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          >
            <option value="">All Statuses</option>
            <option value="SUSPECTED">SUSPECTED</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="RECOVERED">RECOVERED</option>
            <option value="FATAL">FATAL</option>
          </select>

          {/* Disease Filter */}
          <select
            value={selectedDisease}
            onChange={(e) => setSelectedDisease(e.target.value)}
            className="bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          >
            <option value="">All Pathogens</option>
            {diseases.map((d) => (
              <option key={d.disease_id} value={d.disease_id}>
                {d.disease_name}
              </option>
            ))}
          </select>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          >
            <option value="">All Districts</option>
            {districts.map((di) => (
              <option key={di.district_id} value={di.district_id}>
                {di.district_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200/80 flex justify-between items-center text-xs text-slate-500 font-medium">
          <span>Showing {filteredCases.length} registered epidemiological records</span>
          <span className="text-[11px] text-slate-400">Trigger active: trg_case_status_history & trg_case_audit_update</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/90 text-slate-500 uppercase tracking-wider text-[11px] font-semibold bg-slate-50/70">
                <th className="py-3 px-4">Case Code</th>
                <th className="py-3 px-4">Patient Demographics</th>
                <th className="py-3 px-4">Diagnosed Pathogen</th>
                <th className="py-3 px-4">Reporting Facility</th>
                <th className="py-3 px-4">Report Date</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Diagnostic Tests</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => {
                const isExpanded = expandedCaseId === c.case_id;
                return (
                  <React.Fragment key={c.case_id}>
                    <tr
                      className={`hover:bg-slate-50/80 transition cursor-pointer ${
                        isExpanded ? 'bg-teal-50/30' : ''
                      }`}
                      onClick={() => setExpandedCaseId(isExpanded ? null : c.case_id)}
                    >
                      {/* Case Code */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {c.case_code}
                      </td>

                      {/* Patient */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{c.patient_masked_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.patient_code}</div>
                      </td>

                      {/* Pathogen */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{c.disease_name}</div>
                        <span className="text-[10px] text-slate-500 font-medium">{c.disease_category}</span>
                      </td>

                      {/* Facility */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-medium truncate max-w-[180px]" title={c.facility_name}>
                          {c.facility_name}
                        </div>
                        <div className="text-[10px] text-teal-700 font-semibold">{c.district_name}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {c.report_date}
                      </td>

                      {/* Severity Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                            c.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                            c.severity === 'SEVERE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            c.severity === 'MODERATE' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {c.severity}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                            c.case_status === 'CONFIRMED' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                            c.case_status === 'SUSPECTED' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            c.case_status === 'RECOVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {c.case_status}
                        </span>
                      </td>

                      {/* Test Summary */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium font-mono">
                          {c.lab_tests_count} test(s)
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onEditCase(c)}
                            title="Edit Status (Triggers status history & audit log)"
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteCase(c.case_id)}
                            title="Delete case record"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Case Details Accordion */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan="9" className="p-4 text-xs text-slate-700 border-b border-slate-200/80">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Epidemiological Notes</span>
                              <p className="mt-1 text-slate-800 italic">{c.notes || 'No supplementary clinical notes recorded.'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Surveillance Timeline</span>
                              <div className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                                <div>Symptom Onset: <span className="font-mono font-medium text-slate-800">{c.onset_date || 'Unspecified'}</span></div>
                                <div>Official Report: <span className="font-mono font-medium text-slate-800">{c.report_date}</span></div>
                                <div>Hospitalized: <span className="font-medium">{c.hospitalized ? 'Yes (Isolation Bed)' : 'No (Home Isolation)'}</span></div>
                              </div>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Database Relationships</span>
                              <div className="mt-1 space-y-0.5 text-[11px] font-mono text-slate-600">
                                <div>PK: <code className="text-teal-700">case_id={c.case_id}</code></div>
                                <div>FK: <code className="text-teal-700">patient_id={c.patient_id}</code></div>
                                <div>FK: <code className="text-teal-700">disease_id={c.disease_id}</code></div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
