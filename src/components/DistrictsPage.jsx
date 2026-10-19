import { useState } from 'react';
import { useCrud } from './useCrud';
import { PageHeader, Btn, SearchInput, Modal, Field, Input, Table, Spinner, ConfirmDelete } from './ui';

const EMPTY = { district_code: '', district_name: '', state_name: '', population: '' };

export default function DistrictsPage() {
  const { data: districts, loading, create, update, remove } = useCrud('/districts');

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [delId, setDelId] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = districts.filter(d => {
    const q = search.toLowerCase();
    return !q || d.district_name?.toLowerCase().includes(q) || d.state_name?.toLowerCase().includes(q);
  });

  const openAdd = () => { setForm(EMPTY); setErr(''); setModal({ mode: 'add' }); };
  const openEdit = (row) => {
    setForm({ district_code: row.district_code, district_name: row.district_name, state_name: row.state_name, population: row.population });
    setErr(''); setModal({ mode: 'edit', row });
  };
  const set = k => v => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault(); setErr(''); setSaving(true);
    try {
      if (modal.mode === 'add') await create(form);
      else await update(modal.row.district_id, form);
      setModal(null);
    } catch (e) { setErr(e.message); }
    setSaving(false);
  };

  const columns = [
    { key: 'district_code', label: 'Code' },
    { key: 'district_name', label: 'District Name' },
    { key: 'state_name', label: 'State' },
    { key: 'population', label: 'Population', render: r => r.population?.toLocaleString('en-IN') ?? '—' },
  ];

  return (
    <div>
      <PageHeader title="Districts" subtitle={`${filtered.length} records`}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search districts…" />
        <Btn onClick={openAdd}>+ Add District</Btn>
      </PageHeader>

      <div className="px-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? <Spinner /> : <Table columns={columns} rows={filtered} keyField="district_id" onEdit={openEdit} onDelete={setDelId} />}
        </div>
      </div>

      {delId && (
        <ConfirmDelete
          label={districts.find(d => d.district_id === delId)?.district_name ?? delId}
          onConfirm={async () => { try { await remove(delId); } catch (e) { alert(e.message); } setDelId(null); }}
          onCancel={() => setDelId(null)}
        />
      )}

      {modal && (
        <Modal title={modal.mode === 'add' ? 'Add District' : 'Edit District'} onClose={() => setModal(null)}>
          <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
            {err && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{err}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Code">
                <Input value={form.district_code} onChange={set('district_code')} placeholder="e.g. PUNE" />
              </Field>
              <Field label="District Name" required>
                <Input value={form.district_name} onChange={set('district_name')} required placeholder="e.g. Pune" />
              </Field>
              <Field label="State">
                <Input value={form.state_name} onChange={set('state_name')} placeholder="e.g. Maharashtra" />
              </Field>
              <Field label="Population">
                <Input type="number" value={form.population} onChange={set('population')} placeholder="e.g. 5000000" />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn>
              <Btn type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save District'}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
