import { useState } from 'react';
import { useCrud } from './useCrud';
import { PageHeader, Btn, SearchInput, Badge, Modal, Field, Input, Select, Textarea, Table, Spinner, ConfirmDelete } from './ui';

const CAT_OPTIONS = ['VECTOR_BORNE', 'WATERBORNE', 'AIRBORNE', 'ZOONOTIC', 'SEXUALLY_TRANSMITTED', 'FOOD_BORNE', 'CONTACT', 'OTHER'];
const TRANS_OPTIONS = ['MOSQUITO', 'WATER', 'DROPLET', 'AEROSOL', 'CONTACT', 'SEXUAL', 'FECAL_ORAL', 'RODENT', 'UNKNOWN'];
const CAT_COLORS = { VECTOR_BORNE: 'orange', WATERBORNE: 'blue', AIRBORNE: 'purple', ZOONOTIC: 'yellow', OTHER: 'gray' };

const EMPTY = { disease_code: '', disease_name: '', disease_category: 'OTHER', transmission_mode: 'UNKNOWN', alert_threshold_weekly: 5, is_notifiable: 1, description: '' };

export default function DiseasesPage() {
  const { data: diseases, loading, create, update, remove } = useCrud('/diseases');

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [delId, setDelId] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = diseases.filter(d => {
    const q = search.toLowerCase();
    return !q || d.disease_name?.toLowerCase().includes(q) || d.disease_code?.toLowerCase().includes(q);
  });

  const openAdd = () => { setForm(EMPTY); setErr(''); setModal({ mode: 'add' }); };
  const openEdit = (row) => {
    setForm({ disease_code: row.disease_code, disease_name: row.disease_name, disease_category: row.disease_category, transmission_mode: row.transmission_mode, alert_threshold_weekly: row.alert_threshold_weekly, is_notifiable: row.is_notifiable, description: row.description ?? '' });
    setErr(''); setModal({ mode: 'edit', row });
  };
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      if (modal.mode === 'add') await create(form);
      else await update(modal.row.disease_id, form);
      setModal(null);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const columns = [
    { key: 'disease_code', label: 'Code' },
    { key: 'disease_name', label: 'Disease Name' },
    { key: 'disease_category', label: 'Category', render: r => <Badge label={r.disease_category} color={CAT_COLORS[r.disease_category] ?? 'gray'} /> },
    { key: 'transmission_mode', label: 'Transmission' },
    { key: 'alert_threshold_weekly', label: 'Weekly Threshold' },
    { key: 'is_notifiable', label: 'Notifiable', render: r => <Badge label={r.is_notifiable ? 'Yes' : 'No'} color={r.is_notifiable ? 'green' : 'gray'} /> },
  ];

  return (
    <div>
      <PageHeader title="Diseases" subtitle={`${filtered.length} records`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search diseases…" />
        <Btn onClick={openAdd}>+ Add Disease</Btn>
      </PageHeader>

      <div className="px-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <Spinner /> : <Table columns={columns} rows={filtered} keyField="disease_id" onEdit={openEdit} onDelete={setDelId} />}
        </div>
      </div>

      {delId && (
        <ConfirmDelete
          label={diseases.find(d => d.disease_id === delId)?.disease_name ?? delId}
          onConfirm={async () => { try { await remove(delId); } catch (e) { alert(e.message); } setDelId(null); }}
          onCancel={() => setDelId(null)}
        />
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add Disease' : 'Edit Disease'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
            {err && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{err}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Code">
                <Input value={form.disease_code} onChange={set('disease_code')} placeholder="e.g. DEN-01" />
              </Field>
              <Field label="Disease Name" required>
                <Input value={form.disease_name} onChange={set('disease_name')} placeholder="e.g. Dengue Fever" required />
              </Field>
              <Field label="Category">
                <Select value={form.disease_category} onChange={set('disease_category')}>
                  {CAT_OPTIONS.map(c => <option key={c}>{c}</option>)}
                </Select>
              </Field>
              <Field label="Transmission">
                <Select value={form.transmission_mode} onChange={set('transmission_mode')}>
                  {TRANS_OPTIONS.map(t => <option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Weekly Alert Threshold">
                <Input type="number" value={form.alert_threshold_weekly} onChange={v => set('alert_threshold_weekly')(parseInt(v, 10) || 0)} />
              </Field>
              <Field label="Notifiable">
                <Select value={form.is_notifiable} onChange={v => set('is_notifiable')(parseInt(v, 10))}>
                  <option value={1}>Yes</option>
                  <option value={0}>No</option>
                </Select>
              </Field>
            </div>
            <Field label="Description">
              <Textarea value={form.description} onChange={set('description')} placeholder="Brief description…" />
            </Field>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Disease'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
