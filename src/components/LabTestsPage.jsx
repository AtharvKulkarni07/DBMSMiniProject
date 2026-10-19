import { useState } from 'react';
import { useCrud, useFetchList } from './useCrud';
import { PageHeader, Btn, SearchInput, Badge, Modal, Field, Input, Select, Textarea, Table, Spinner, ConfirmDelete } from './ui';

const RESULT_COLORS = { POSITIVE: 'red', NEGATIVE: 'green', PENDING: 'yellow', INCONCLUSIVE: 'gray' };
const RESULT_OPTIONS = ['PENDING', 'POSITIVE', 'NEGATIVE', 'INCONCLUSIVE'];
const EMPTY = { case_id: '', facility_id: '', test_name: '', test_result: 'PENDING', remarks: '' };

export default function LabTestsPage() {
  const { data: tests, loading, create, update, remove } = useCrud('/lab-tests');
  const { data: cases } = useFetchList('/cases');
  const { data: facilities } = useFetchList('/facilities');

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [delId, setDelId] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = tests.filter(t => {
    const q = search.toLowerCase();
    return !q || t.test_name?.toLowerCase().includes(q) || t.case_code?.toLowerCase().includes(q) || t.test_code?.toLowerCase().includes(q);
  });

  const openAdd = () => { setForm(EMPTY); setErr(''); setModal({ mode: 'add' }); };
  const openEdit = (row) => {
    setForm({ case_id: row.case_id, facility_id: row.facility_id, test_name: row.test_name, test_result: row.test_result, remarks: row.remarks ?? '' });
    setErr(''); setModal({ mode: 'edit', row });
  };
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      if (modal.mode === 'add') await create(form);
      else await update(modal.row.lab_test_id, form);
      setModal(null);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const columns = [
    { key: 'test_code', label: 'Test Code' },
    { key: 'case_code', label: 'Case' },
    { key: 'test_name', label: 'Test Name' },
    { key: 'facility_name', label: 'Facility' },
    { key: 'specimen_collected_at', label: 'Collected', render: r => r.specimen_collected_at?.substring(0, 10) ?? '—' },
    { key: 'test_result', label: 'Result', render: r => <Badge label={r.test_result} color={RESULT_COLORS[r.test_result] ?? 'gray'} /> },
  ];

  return (
    <div>
      <PageHeader title="Lab Tests" subtitle={`${filtered.length} records`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search tests…" />
        <Btn onClick={openAdd}>+ Add Lab Test</Btn>
      </PageHeader>

      <div className="px-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <Spinner /> : <Table columns={columns} rows={filtered} keyField="lab_test_id" onEdit={openEdit} onDelete={setDelId} />}
        </div>
      </div>

      {delId && (
        <ConfirmDelete
          label={tests.find(t => t.lab_test_id === delId)?.test_code ?? delId}
          onConfirm={async () => { try { await remove(delId); } catch (e) { alert(e.message); } setDelId(null); }}
          onCancel={() => setDelId(null)}
        />
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Lab Test' : 'Edit Lab Test'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
            {err && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{err}</p>}
            <Field label="Case" required>
              <Select value={form.case_id} onChange={set('case_id')} required>
                <option value="">Select case…</option>
                {cases.map(c => <option key={c.case_id} value={c.case_id}>{c.case_code} — {c.patient_name}</option>)}
              </Select>
            </Field>
            <Field label="Facility">
              <Select value={form.facility_id} onChange={set('facility_id')}>
                <option value="">Select facility…</option>
                {facilities.map(f => <option key={f.facility_id} value={f.facility_id}>{f.facility_name}</option>)}
              </Select>
            </Field>
            <Field label="Test Name" required>
              <Input value={form.test_name} onChange={set('test_name')} placeholder="e.g. PCR, Serology, CBC…" required />
            </Field>
            <Field label="Result">
              <Select value={form.test_result} onChange={set('test_result')}>
                {RESULT_OPTIONS.map(r => <option key={r}>{r}</option>)}
              </Select>
            </Field>
            <Field label="Remarks">
              <Textarea value={form.remarks} onChange={set('remarks')} placeholder="Any observations…" />
            </Field>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Test'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
