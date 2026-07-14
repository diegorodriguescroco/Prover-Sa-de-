import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Logo from '../components/Logo';

const UNITS     = ['Unidade Centro', 'Unidade Norte', 'Unidade Sul'];
const ATTENDANTS = ['Maria Silva', 'Joana Pereira', 'Carla Mendes'];

function fDateBR(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function SummaryCard({ label, value, sub, accent }) {
  return (
    <div className={`rounded-xl p-5 border ${accent ? 'bg-navy border-navy' : 'bg-white border-slate-200'}`}>
      <p className={`text-[11px] font-bold uppercase tracking-widest mb-1 ${accent ? 'text-white/50' : 'text-slate-400'}`}>{label}</p>
      <p className={`text-4xl font-extrabold font-tabular leading-tight ${accent ? 'text-white' : 'text-navy'}`}>{value}</p>
      {sub && <p className={`text-xs mt-1 ${accent ? 'text-white/40' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );
}

function MiniTable({ title, rows }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {title}
      </div>
      {rows.length === 0
        ? <p className="px-4 py-3 text-sm text-slate-400">Sem dados</p>
        : rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50 last:border-0 text-sm">
            <span className="text-slate-700 font-medium">{r.name || r.unit}</span>
            <span className="font-bold text-royal font-tabular">{r.count}</span>
          </div>
        ))
      }
    </div>
  );
}

export default function Admin() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [filters, setFilters] = useState({ unit: '', attendant: '', from: '', to: '' });
  const [summary, setSummary] = useState({ total: 0, today: 0, byAtt: [], byUnit: [] });
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.unit)      params.unit      = filters.unit;
      if (filters.attendant) params.attendant = filters.attendant;
      if (filters.from)      params.from      = filters.from;
      if (filters.to)        params.to        = filters.to;

      const [sumRes, recRes] = await Promise.all([
        api.get('/records/summary', { params }),
        api.get('/records',         { params }),
      ]);
      setSummary(sumRes.data);
      setRecords(recRes.data);
    } catch {}
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  function setF(key, val) { setFilters(f => ({ ...f, [key]: val })); }

  function clearFilters() { setFilters({ unit: '', attendant: '', from: '', to: '' }); }

  function exportCSV() {
    if (!records.length) { alert('Nenhum registro para exportar.'); return; }
    const header = 'Atendente,Unidade,Data,Horario\n';
    const rows   = records.map(r => `"${r.name}","${r.unit}","${fDateBR(r.date)}","${r.time}"`).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,﻿' + encodeURIComponent(header + rows);
    a.download = `prover_${today.replaceAll('-', '')}.csv`;
    a.click();
  }

  function handleLogout() { logout(); navigate('/', { replace: true }); }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FC]">
      {/* Topbar */}
      <header className="bg-navy px-5 h-14 flex items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <span className="bg-white/15 text-white/70 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
            Admin
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="bg-white/10 hover:bg-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
        >
          Sair
        </button>
      </header>

      <div className="max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-5 pb-12">

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap gap-3 items-end">
          {[
            { label: 'Unidade', key: 'unit', options: UNITS },
            { label: 'Atendente', key: 'attendant', options: ATTENDANTS },
          ].map(({ label, key, options }) => (
            <div key={key} className="flex flex-col gap-1 flex-1 min-w-[140px]">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
              <select
                value={filters[key]}
                onChange={e => setF(key, e.target.value)}
                className="h-10 border-[1.5px] border-slate-200 rounded-lg px-3 text-sm bg-slate-50 outline-none focus:border-royal transition"
              >
                <option value="">Todos</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}

          {[
            { label: 'Data início', key: 'from' },
            { label: 'Data fim',    key: 'to'   },
          ].map(({ label, key }) => (
            <div key={key} className="flex flex-col gap-1 flex-1 min-w-[130px]">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
              <input
                type="date"
                value={filters[key]}
                onChange={e => setF(key, e.target.value)}
                className="h-10 border-[1.5px] border-slate-200 rounded-lg px-3 text-sm bg-slate-50 outline-none focus:border-royal transition"
              />
            </div>
          ))}

          <button
            onClick={clearFilters}
            className="h-10 px-4 bg-slate-100 hover:bg-pale text-slate-500 hover:text-royal text-sm font-semibold rounded-lg border border-slate-200 transition self-end"
          >
            Limpar
          </button>
          <button
            onClick={exportCSV}
            className="h-10 px-4 bg-royal hover:bg-navy text-white text-sm font-bold rounded-lg transition self-end flex items-center gap-2 whitespace-nowrap"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar CSV
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard label="Total de registros" value={summary.total} sub="no período filtrado" accent />
          <SummaryCard label="Hoje"       value={summary.today} sub={fDateBR(today)} />
          <SummaryCard label="Unidades"   value={summary.byUnit.length} sub="com registros" />
          <SummaryCard label="Atendentes" value={summary.byAtt.length}  sub="com registros" />
        </div>

        {/* Mini tables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MiniTable title="Por Atendente" rows={summary.byAtt} />
          <MiniTable title="Por Unidade"   rows={summary.byUnit} />
        </div>

        {/* Tabela detalhada */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-sm font-bold text-slate-700">Registros detalhados</span>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {records.length} registro{records.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="p-8 text-center text-sm text-slate-400">Carregando…</p>
            ) : records.length === 0 ? (
              <p className="p-8 text-center text-sm text-slate-400">Nenhum registro encontrado com os filtros selecionados.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {['#', 'Atendente', 'Unidade', 'Data', 'Horário'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-pale/60 transition-colors">
                      <td className="px-4 py-2.5 text-slate-400 font-tabular">{records.length - i}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{r.name}</td>
                      <td className="px-4 py-2.5 text-slate-500">{r.unit}</td>
                      <td className="px-4 py-2.5 text-slate-500 font-tabular">{fDateBR(r.date)}</td>
                      <td className="px-4 py-2.5 font-bold text-royal font-tabular">{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
