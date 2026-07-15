import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Logo from '../components/Logo';

const UNITS      = ['Unidade Centro', 'Unidade Norte', 'Unidade Sul'];
const ATTENDANTS = ['Maria Silva', 'Joana Pereira', 'Carla Mendes'];

function fDateBR(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function SummaryCard({ label, value, sub, accent }) {
  return (
    <div className={`rounded-2xl p-5 ${accent
      ? 'bg-gradient-to-br from-[#0F3460] to-[#1B6AB1] text-white shadow-[0_4px_24px_rgba(15,52,96,.22)]'
      : 'bg-white border border-slate-100 shadow-sm'}`}>
      <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${accent ? 'text-white/50' : 'text-slate-400'}`}>{label}</p>
      <p className={`text-[40px] font-extrabold font-tabular leading-none ${accent ? 'text-white' : 'text-[#0F3460]'}`}>{value}</p>
      {sub && <p className={`text-xs mt-1.5 ${accent ? 'text-white/40' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );
}

function MiniTable({ title, rows }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
        <span className="w-1.5 h-4 rounded-full bg-[#1B6AB1] inline-block" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
      </div>
      {rows.length === 0
        ? <p className="px-5 py-4 text-sm text-slate-400">Sem dados</p>
        : rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#EBF4FF] text-[#1B6AB1] text-[11px] font-bold flex items-center justify-center font-tabular">
                {i + 1}
              </span>
              <span className="text-sm text-slate-700 font-medium">{r.name || r.unit}</span>
            </div>
            <span className="text-sm font-bold text-[#1B6AB1] font-tabular bg-[#EBF4FF] px-2.5 py-0.5 rounded-full">{r.count}</span>
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
    <div className="min-h-screen flex flex-col" style={{ background: '#F0F5FB' }}>

      {/* Topbar */}
      <header className="bg-white border-b border-slate-100 px-6 h-[60px] flex items-center justify-between gap-4 sticky top-0 z-40"
        style={{ boxShadow: '0 1px 0 #E2EBF6, 0 2px 12px rgba(15,52,96,.06)' }}>
        <div className="flex items-center gap-3">
          <Logo size={38} />
          <div className="w-px h-6 bg-slate-200 mx-1" />
          <span style={{ background: 'linear-gradient(135deg,#0F3460,#1B6AB1)' }}
            className="text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
            Painel Admin
          </span>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-slate-500 hover:text-[#0F3460] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#EBF4FF] transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </header>

      {/* Barra decorativa azul fina abaixo do header */}
      <div style={{ height: 3, background: 'linear-gradient(90deg,#0F3460,#1B6AB1,#2B8CD8)' }} />

      <div className="max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-5 pb-14">

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-wrap gap-3 items-end">
          {[
            { label: 'Unidade', key: 'unit', options: UNITS },
            { label: 'Atendente', key: 'attendant', options: ATTENDANTS },
          ].map(({ label, key, options }) => (
            <div key={key} className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
              <select value={filters[key]} onChange={e => setF(key, e.target.value)}
                className="h-10 border border-slate-200 rounded-xl px-3 text-sm bg-slate-50 outline-none focus:border-[#1B6AB1] focus:ring-2 focus:ring-[#1B6AB1]/10 transition">
                <option value="">Todos</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}

          {[{ label: 'Data início', key: 'from' }, { label: 'Data fim', key: 'to' }].map(({ label, key }) => (
            <div key={key} className="flex flex-col gap-1.5 flex-1 min-w-[130px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
              <input type="date" value={filters[key]} onChange={e => setF(key, e.target.value)}
                className="h-10 border border-slate-200 rounded-xl px-3 text-sm bg-slate-50 outline-none focus:border-[#1B6AB1] focus:ring-2 focus:ring-[#1B6AB1]/10 transition" />
            </div>
          ))}

          <button onClick={clearFilters}
            className="h-10 px-4 text-slate-500 hover:text-[#1B6AB1] text-sm font-semibold rounded-xl border border-slate-200 hover:border-[#1B6AB1] hover:bg-[#EBF4FF] transition self-end">
            Limpar
          </button>
          <button onClick={exportCSV}
            className="h-10 px-5 text-white text-sm font-bold rounded-xl transition self-end flex items-center gap-2 whitespace-nowrap shadow-sm hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#0F3460,#1B6AB1)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 rounded-full bg-[#1B6AB1] inline-block" />
              <span className="text-sm font-bold text-slate-700">Registros detalhados</span>
            </div>
            <span className="text-xs font-semibold text-[#1B6AB1] bg-[#EBF4FF] px-3 py-1 rounded-full font-tabular">
              {records.length} registro{records.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <p className="p-10 text-center text-sm text-slate-400">Carregando…</p>
            ) : records.length === 0 ? (
              <p className="p-10 text-center text-sm text-slate-400">Nenhum registro encontrado com os filtros selecionados.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#F5F9FF' }} className="border-b border-slate-100">
                    {['#', 'Atendente', 'Unidade', 'Data', 'Horário'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-[#F5F9FF] transition-colors">
                      <td className="px-5 py-3 text-slate-300 font-tabular text-xs">{records.length - i}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{r.name}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold text-[#1B6AB1] bg-[#EBF4FF] px-2.5 py-1 rounded-full">{r.unit}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 font-tabular">{fDateBR(r.date)}</td>
                      <td className="px-5 py-3 font-bold text-[#0F3460] font-tabular">{r.time}</td>
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
