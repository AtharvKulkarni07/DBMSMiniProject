import { useState } from 'react';
import { useCrud } from './useCrud';
import { PageHeader, Badge, SearchInput, Modal, Field, Select, Textarea, Table, Spinner } from './ui';

const LEVEL_COLORS = { LOW: 'green', MODERATE: 'yellow', HIGH: 'orange', CRITICAL: 'red' };
const STATUS_COLORS = { OPEN: 'red', INVESTIGATING: 'orange', ACKNOWLEDGED: 'yellow', RESOLVED: 'green', CLOSED: 'gray' };
const STATUS_OPTIONS = ['OPEN', 'INVESTIGATING', 'ACKNOWLEDGED', 'RESOLVED', 'CLOSED'];

export default function AlertsPage() {
  const { data: alerts, loading, update } = useCrud('/alerts');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // { row }
  const [form, setForm] = useState({ alert_status: '', resolution_notes: '' });
  const [saving, setSaving] = useState(false);

  const filtered = alerts.filter(a => {
    const q = search.toLowerCase();
    return !q || a.disease_name?.toLowerCase().includes(q) || a.district_name?.toLowerCase().includes(q);
  });

  const openEdit = (row) => {
    setForm({ alert_status: row.alert_status, resolution_notes: row.resolution_notes ?? '' });
    setModal({ row });
  };
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await update(modal.row.alert_id, form); setModal(null); } catch (e) { alert(e.message); }
    setSaving(false);
  };

  const columns = [
    { key: 'alert_code', label: 'Alert Code' },
    { key: 'disease_name', label: 'Disease' },
    { key: 'district_name', label: 'District' },
    { key: 'alert_level', label: 'Level', render: r => <Badge label={r.alert_level} color={LEVEL_COLORS[r.alert_level] ?? 'gray'} /> },
    { key: 'alert_status', label: 'Status', render: r => <Badge label={r.alert_status} color={STATUS_COLORS[r.alert_status] ?? 'gray'} /> },
    { key: 'observed_case_count', label: 'Cases' },
    { key: 'threshold_case_count', label: 'Threshold' },
    { key: 'generated_at', label: 'Generated', render: r => r.generated_at?.substring(0, 10) ?? '—' },
  ];

  return (
    <div>
      <PageHeader title="Outbreak Alerts" subtitle={`${filtered.length} alerts`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search alerts…" />
      </PageHeader>

      <div className="px-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <Spinner /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {columns.map(col => (
                      <th key={col.key} className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">{col.label}</th>
                    ))}
                    <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={columns.length + 1} className="text-center py-12 text-sm text-gray-400">No alerts found.</td></tr>
                  )}
                  {filtered.map(row => (
                    <tr key={row.alert_id} className="border-b border-gray-50 hover:bg-gray-50">
                      {columns.map(col => (
                        <td key={col.key} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {col.render ? col.render(row) : row[col.key] ?? '—'}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openEdit(row)}
                          className="px-2.5 py-1 text-xs rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-all"
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal title="Update Alert Status" onClose={() => setModal(null)} size="sm">
          <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
            <p className="text-xs text-gray-500 bg-gray-50 rounded px-3 py-2">{modal.row.alert_code} — {modal.row.disease_name} / {modal.row.district_name}</p>
            <Field label="Status">
              <Select value={form.alert_status} onChange={set('alert_status')}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Resolution Notes">
              <Textarea value={form.resolution_notes} onChange={set('resolution_notes')} placeholder="Notes on resolution or investigation…" />
            </Field>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setModal(null)} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700">Cancel</button>
              <button type="submit" disabled={saving} className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
