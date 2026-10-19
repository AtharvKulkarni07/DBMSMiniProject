import { useState } from 'react';
import { useCrud, useFetchList } from './useCrud';
import { PageHeader, Btn, SearchInput, Badge, Modal, Field, Input, Select, Textarea, Table, Spinner, ConfirmDelete } from './ui';

const STATUS_COLORS = { SUSPECTED: 'yellow', CONFIRMED: 'red', RECOVERED: 'green', FATAL: 'gray', UNDER_INVESTIGATION: 'purple', CLOSED: 'gray' };
const SEV_COLORS = { MILD: 'green', MODERATE: 'yellow', SEVERE: 'orange', CRITICAL: 'red' };
const STATUS_OPTIONS = ['SUSPECTED', 'CONFIRMED', 'UNDER_INVESTIGATION', 'RECOVERED', 'FATAL', 'CLOSED'];
const SEV_OPTIONS = ['MILD', 'MODERATE', 'SEVERE', 'CRITICAL'];
const OUTCOME_OPTIONS = ['ONGOING', 'RECOVERED', 'DECEASED', 'REFERRED'];

const EMPTY = { patient_id: '', disease_id: '', reporting_facility_id: '', onset_date: '', report_date: '', case_status: 'SUSPECTED', severity: 'MILD', outcome: 'ONGOING', hospitalized: 0, notes: '' };

export default function CasesPage() {
  const { data: cases, loading, create, update, remove } = useCrud('/cases');
  const { data: patients } = useFetchList('/patients');
  const { data: diseases } = useFetchList('/diseases');
  const { data: facilities } = useFetchList('/facilities');

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null); // null | { mode: 'add'|'edit', row? }
  const [form, setForm] = useState(EMPTY);
  const [delId, setDelId] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = cases.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.case_code?.toLowerCase().includes(q) || c.patient_name?.toLowerCase().includes(q) || c.disease_name?.toLowerCase().includes(q);
    const matchS = !filterStatus || c.case_status === filterStatus;
    return matchQ && matchS;
  });

  const openAdd = () => { setForm(EMPTY); setErr(''); setModal({ mode: 'add' }); };
  const openEdit = (row) => {
    setForm({
      patient_id: row.patient_id, disease_id: row.disease_id, reporting_facility_id: row.reporting_facility_id,
      onset_date: row.onset_date?.substring(0, 10) ?? '', report_date: row.report_date?.substring(0, 10) ?? '',
      case_status: row.case_status, severity: row.severity, outcome: row.outcome,
      hospitalized: row.hospitalized, notes: row.notes ?? '',
    });
    setErr(''); setModal({ mode: 'edit', row });
  };

  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setErr(''); setSaving(true);
    try {
      if (modal.mode === 'add') await create(form);
      else await update(modal.row.case_id, form);
      setModal(null);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const handleDelete = async () => {
    try { await remove(delId); } catch (e) { alert(e.message); }
    setDelId(null);
  };

  const columns = [
    { key: 'case_code', label: 'Case Code' },
    { key: 'patient_name', label: 'Patient' },
    { key: 'disease_name', label: 'Disease' },
    { key: 'facility_name', label: 'Facility' },
    { key: 'onset_date', label: 'Onset', render: r => r.onset_date?.substring(0, 10) ?? '—' },
    { key: 'case_status', label: 'Status', render: r => <Badge label={r.case_status} color={STATUS_COLORS[r.case_status] ?? 'gray'} /> },
    { key: 'severity', label: 'Severity', render: r => <Badge label={r.severity} color={SEV_COLORS[r.severity] ?? 'gray'} /> },
  ];

  return (
    <div>
      <PageHeader title="Disease Cases" subtitle={`${filtered.length} records`}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
        <SearchInput value={search} onChange={setSearch} placeholder="Search cases…" />
        <Btn onClick={openAdd}>+ Add Case</Btn>
      </PageHeader>

      <div className="px-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <Spinner /> : <Table columns={columns} rows={filtered} keyField="case_id" onEdit={openEdit} onDelete={setDelId} />}
        </div>
      </div>

      {delId && (
        <ConfirmDelete label={cases.find(c => c.case_id === delId)?.case_code ?? delId} onConfirm={handleDelete} onCancel={() => setDelId(null)} />
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Disease Case' : 'Edit Case'} onClose={() => setModal(null)} size="lg">
          <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
            {err && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{err}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Patient" required>
                <Select value={form.patient_id} onChange={set('patient_id')} required>
                  <option value="">Select patient…</option>
                  {patients.map(p => <option key={p.patient_id} value={p.patient_id}>{p.full_name_masked} ({p.patient_code})</option>)}
                </Select>
              </Field>
              <Field label="Disease" required>
                <Select value={form.disease_id} onChange={set('disease_id')} required>
                  <option value="">Select disease…</option>
                  {diseases.map(d => <option key={d.disease_id} value={d.disease_id}>{d.disease_name}</option>)}
                </Select>
              </Field>
              <Field label="Reporting Facility" required>
                <Select value={form.reporting_facility_id} onChange={set('reporting_facility_id')} required>
                  <option value="">Select facility…</option>
                  {facilities.map(f => <option key={f.facility_id} value={f.facility_id}>{f.facility_name}</option>)}
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.case_status} onChange={set('case_status')}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Onset Date">
                <Input type="date" value={form.onset_date} onChange={set('onset_date')} />
              </Field>
              <Field label="Report Date">
                <Input type="date" value={form.report_date} onChange={set('report_date')} />
              </Field>
              <Field label="Severity">
                <Select value={form.severity} onChange={set('severity')}>
                  {SEV_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Outcome">
                <Select value={form.outcome} onChange={set('outcome')}>
                  {OUTCOME_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="Notes">
              <Textarea value={form.notes} onChange={set('notes')} placeholder="Additional notes…" rows={2} />
            </Field>
            <div className="flex items-center gap-2 pt-1">
              <input type="checkbox" id="hosp" checked={!!form.hospitalized} onChange={e => set('hospitalized')(e.target.checked ? 1 : 0)} className="rounded" />
              <label htmlFor="hosp" className="text-sm text-gray-700">Hospitalized</label>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Case'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
