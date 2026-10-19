import React, { useState, useEffect } from 'react';
import { CloseIcon, VirusIcon, ShieldCheckIcon } from './Icons';

export const CaseModal = ({ isOpen, onClose, onSave, caseToEdit, patients, diseases, facilities }) => {
  const [formData, setFormData] = useState({
    patient_id: '',
    disease_id: '',
    reporting_facility_id: '',
    onset_date: '',
    report_date: '',
    case_status: 'SUSPECTED',
    severity: 'MODERATE',
    outcome: 'ONGOING',
    notes: '',
  });

  useEffect(() => {
    if (caseToEdit) {
      setFormData({
        patient_id: caseToEdit.patient_id,
        disease_id: caseToEdit.disease_id,
        reporting_facility_id: caseToEdit.reporting_facility_id,
        onset_date: caseToEdit.onset_date || '',
        report_date: caseToEdit.report_date || '',
        case_status: caseToEdit.case_status || 'SUSPECTED',
        severity: caseToEdit.severity || 'MODERATE',
        outcome: caseToEdit.outcome || 'ONGOING',
        notes: caseToEdit.notes || '',
      });
    } else {
      setFormData({
        patient_id: patients[0]?.patient_id || '1',
        disease_id: diseases[0]?.disease_id || '1',
        reporting_facility_id: facilities[0]?.facility_id || '1',
        onset_date: new Date(Date.now() - 2 * 86400000).toISOString().substring(0, 10),
        report_date: new Date().toISOString().substring(0, 10),
        case_status: 'SUSPECTED',
        severity: 'MODERATE',
        outcome: 'ONGOING',
        notes: '',
      });
    }
  }, [caseToEdit, isOpen, patients, diseases, facilities]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, caseToEdit?.case_id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-xl relative animate-scale-in">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <VirusIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {caseToEdit ? `Update Case ${caseToEdit.case_code}` : 'Register Epidemiological Case'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {caseToEdit ? 'Triggers trg_case_status_history & audit log' : 'Calls Stored Procedure sp_register_disease_case'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {!caseToEdit ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Select Patient *</label>
                  <select
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    {patients.map((p) => (
                      <option key={p.patient_id} value={p.patient_id}>
                        {p.patient_code} — {p.full_name_masked}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Pathogen / Disease *</label>
                  <select
                    value={formData.disease_id}
                    onChange={(e) => setFormData({ ...formData, disease_id: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  >
                    {diseases.map((d) => (
                      <option key={d.disease_id} value={d.disease_id}>
                        {d.disease_name} ({d.disease_code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Reporting Facility *</label>
                <select
                  value={formData.reporting_facility_id}
                  onChange={(e) => setFormData({ ...formData, reporting_facility_id: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                >
                  {facilities.map((f) => (
                    <option key={f.facility_id} value={f.facility_id}>
                      {f.facility_name} ({f.facility_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Symptom Onset Date</label>
                  <input
                    type="date"
                    value={formData.onset_date}
                    onChange={(e) => setFormData({ ...formData, onset_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Official Report Date *</label>
                  <input
                    type="date"
                    value={formData.report_date}
                    onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                  />
                </div>
              </div>
            </>
          ) : null}

          {/* Status & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Case Status *</label>
              <select
                value={formData.case_status}
                onChange={(e) => setFormData({ ...formData, case_status: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
              >
                <option value="SUSPECTED">SUSPECTED</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="RECOVERED">RECOVERED</option>
                <option value="FATAL">FATAL</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Clinical Severity *</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
              >
                <option value="MILD">MILD</option>
                <option value="MODERATE">MODERATE</option>
                <option value="SEVERE">SEVERE</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Clinical Surveillance Notes</label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Presenting symptoms, lab orders, travel history..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
            >
              {caseToEdit ? 'Save Changes' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
