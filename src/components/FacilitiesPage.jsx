import { useState } from 'react';
import { useCrud, useFetchList } from './useCrud';
import { PageHeader, Btn, SearchInput, Badge, Modal, Field, Input, Select, Table, Spinner, ConfirmDelete } from './ui';

const TYPE_OPTIONS = ['HOSPITAL', 'CLINIC', 'PHC', 'CHC', 'DISTRICT_HOSPITAL', 'REFERRAL_HOSPITAL', 'LAB'];
const EMPTY = { facility_code: '', facility_name: '', facility_type: 'CLINIC', district_id: '', contact_phone: '', address_line: '', is_active: 1 };

export default function FacilitiesPage() {
  const { data: facilities, loading, create, update, remove } = useCrud('/facilities');
  const { data: districts } = useFetchList('/districts');

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [delId, setDelId] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = facilities.filter(f => {
    const q = search.toLowerCase();
    return !q || f.facility_name?.toLowerCase().includes(q) || f.facility_code?.toLowerCase().includes(q);
  });

  const openAdd = () => { setForm(EMPTY); setErr(''); setModal({ mode: 'add' }); };
  const openEdit = (row) => {
    setForm({ facility_code: row.facility_code, facility_name: row.facility_name, facility_type: row.facility_type, district_id: row.district_id, contact_phone: row.contact_phone ?? '', address_line: row.address_line ?? '', is_active: row.is_active });
    setErr(''); setModal({ mode: 'edit', row });
  };
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      if (modal.mode === 'add') await create(form);
      else await update(modal.row.facility_id, form);
      setModal(null);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const getDistrict = id => districts.find(d => d.district_id === id)?.district_name ?? '—';

  const columns = [
    { key: 'facility_code', label: 'Code' },
    { key: 'facility_name', label: 'Facility Name' },
    { key: 'facility_type', label: 'Type' },
    { key: 'district_id', label: 'District', render: r => getDistrict(r.district_id) },
    { key: 'contact_phone', label: 'Phone' },
    { key: 'is_active', label: 'Status', render: r => <Badge label={r.is_active ? 'Active' : 'Inactive'} color={r.is_active ? 'green' : 'gray'} /> },
  ];

  return (
    <div>
      <PageHeader title="Health Facilities" subtitle={`${filtered.length} records`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search facilities…" />
        <Btn onClick={openAdd}>+ Add Facility</Btn>
      </PageHeader>

      <div className="px-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <Spinner /> : <Table columns={columns} rows={filtered} keyField="facility_id" onEdit={openEdit} onDelete={setDelId} />}
        </div>
      </div>

      {delId && (
        <ConfirmDelete
          label={facilities.find(f => f.facility_id === delId)?.facility_name ?? delId}
          onConfirm={async () => { try { await remove(delId); } catch (e) { alert(e.message); } setDelId(null); }}
          onCancel={() => setDelId(null)}
        />
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Facility' : 'Edit Facility'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
            {err && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{err}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Code">
                <Input value={form.facility_code} onChange={set('facility_code')} placeholder="FAC-XXXXX (auto if blank)" />
              </Field>
              <Field label="Facility Name" required>
                <Input value={form.facility_name} onChange={set('facility_name')} required placeholder="e.g. City General Hospital" />
              </Field>
              <Field label="Type">
                <Select value={form.facility_type} onChange={set('facility_type')}>
                  {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="District" required>
                <Select value={form.district_id} onChange={set('district_id')} required>
                  <option value="">Select district…</option>
                  {districts.map(d => <option key={d.district_id} value={d.district_id}>{d.district_name}</option>)}
                </Select>
              </Field>
              <Field label="Contact Phone">
                <Input value={form.contact_phone} onChange={set('contact_phone')} placeholder="+91-XXXXXXXXXX" />
              </Field>
              <Field label="Active">
                <Select value={form.is_active} onChange={v => set('is_active')(parseInt(v, 10))}>
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </Select>
              </Field>
            </div>
            <Field label="Address">
              <Input value={form.address_line} onChange={set('address_line')} placeholder="Street address…" />
            </Field>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Facility'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
