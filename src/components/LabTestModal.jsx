import React, { useState } from 'react';
import { CloseIcon, TableIcon } from './Icons';

export const LabTestModal = ({ isOpen, onClose, onSave, cases, facilities }) => {
  const [formData, setFormData] = useState({
    case_id: '',
    facility_id: '',
    test_name: 'Dengue NS1 Antigen ELISA',
    test_result: 'POSITIVE',
    remarks: 'Rapid chromatographic immunoassay result verified',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      case_id: formData.case_id || cases[0]?.case_id,
      facility_id: formData.facility_id || facilities[0]?.facility_id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl relative animate-scale-in">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <TableIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Record Diagnostic Laboratory Result
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Trigger Notice: POSITIVE test auto-promotes case status to CONFIRMED
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Target Case Episode *</label>
            <select
              value={formData.case_id}
              onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
            >
              {cases.map((c) => (
                <option key={c.case_id} value={c.case_id}>
                  {c.case_code} — {c.disease_name} ({c.case_status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Testing Facility *</label>
            <select
              value={formData.facility_id}
              onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
            >
              {facilities.map((f) => (
                <option key={f.facility_id} value={f.facility_id}>
                  {f.facility_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Diagnostic Test Name *</label>
            <input
              type="text"
              value={formData.test_name}
              onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Diagnostic Result *</label>
            <select
              value={formData.test_result}
              onChange={(e) => setFormData({ ...formData, test_result: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold"
            >
              <option value="POSITIVE">POSITIVE (Fires auto-confirm trigger)</option>
              <option value="NEGATIVE">NEGATIVE</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">Laboratory Remarks</label>
            <textarea
              rows="2"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
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
              Save Lab Result
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
