import { useEffect, useState } from 'react';

const BASE = '/api';

function useFetch(url, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(BASE + url);
      const json = await r.json();
      setData(json);
    } catch { setData([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, deps);  // eslint-disable-line

  return { data, setData, loading, reload: load };
}

export function useCrud(path) {
  const { data, loading, reload } = useFetch(path);

  const create = async (body) => {
    const r = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Create failed'); }
    await reload();
  };

  const update = async (id, body) => {
    const r = await fetch(`${BASE}${path}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Update failed'); }
    await reload();
  };

  const remove = async (id) => {
    const r = await fetch(`${BASE}${path}/${id}`, { method: 'DELETE' });
    if (!r.ok) { const e = await r.json(); throw new Error(e.error ?? 'Delete failed'); }
    await reload();
  };

  return { data, loading, reload, create, update, remove };
}

export function useFetchList(path) {
  return useFetch(path);
}
