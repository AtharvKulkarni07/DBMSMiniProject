import { useState } from 'react';
import { useCrud, useFetchList } from './useCrud';
import { PageHeader, Btn, SearchInput, Modal, Field, Input, Select, Table, Spinner, ConfirmDelete } from './ui';

const SEX_OPTIONS = ['MALE', 'FEMALE', 'OTHER', 'UNKNOWN'];
const EMPTY = { patient_code: '', full_name_masked: '', date_of_birth: '', sex_at_birth: 'UNKNOWN', district_id: '' };

export default function PatientsPage() {
  const { data: patients, loading, create, update, remove } = useCrud('/patients');
  const { data: districts } = useFetchList('/districts');

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [delId, setDelId] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return !q || p.full_name_masked?.toLowerCase().includes(q) || p.patient_code?.toLowerCase().includes(q);
  });

  const openAdd = () => { setForm(EMPTY); setErr(''); setModal({ mode: 'add' }); };
  const openEdit = (row) => {
    setForm({
      patient_code: row.patient_code, full_name_masked: row.full_name_masked,
      date_of_birth: row.date_of_birth?.substring(0, 10) ?? '', sex_at_birth: row.sex_at_birth, district_id: row.district_id,
    });
    setErr(''); setModal({ mode: 'edit', row });
  };
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      if (modal.mode === 'add') await create(form);
      else await update(modal.row.patient_id, form);
      setModal(null);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const getDistrict = id => districts.find(d => d.district_id === id)?.district_name ?? '—';

  const columns = [
    { key: 'patient_code', label: 'Code' },
    { key: 'full_name_masked', label: 'Name (Masked)' },
    { key: 'date_of_birth', label: 'DOB', render: r => r.date_of_birth?.substring(0, 10) ?? '—' },
    { key: 'sex_at_birth', label: 'Sex' },
    { key: 'district_id', label: 'District', render: r => getDistrict(r.district_id) },
  ];

  return (
    <div>
      <PageHeader title="Patients" subtitle={`${filtered.length} records`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search patients…" />
        <Btn onClick={openAdd}>+ Add Patient</Btn>
      </PageHeader>

      <div className="px-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <Spinner /> : <Table columns={columns} rows={filtered} keyField="patient_id" onEdit={openEdit} onDelete={setDelId} />}
        </div>
      </div>

      {delId && (
        <ConfirmDelete
          label={patients.find(p => p.patient_id === delId)?.full_name_masked ?? delId}
          onConfirm={async () => { try { await remove(delId); } catch (e) { alert(e.message); } setDelId(null); }}
          onCancel={() => setDelId(null)}
        />
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Patient' : 'Edit Patient'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
            {err && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{err}</p>}
            <Field label="Code">
              <Input value={form.patient_code} onChange={set('patient_code')} placeholder="PAT-XXXXXX (auto if blank)" />
            </Field>
            <Field label="Name (Masked)" required>
              <Input value={form.full_name_masked} onChange={set('full_name_masked')} placeholder="e.g. R*** K***" required />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date of Birth">
                <Input type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
              </Field>
              <Field label="Sex">
                <Select value={form.sex_at_birth} onChange={set('sex_at_birth')}>
                  {SEX_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </Select>
              </Field>
            </div>
            <Field label="District" required>
              <Select value={form.district_id} onChange={set('district_id')} required>
                <option value="">Select district…</option>
                {districts.map(d => <option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}
              </Select>
            </Field>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Patient'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
