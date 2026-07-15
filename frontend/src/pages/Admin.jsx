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

const CARD_ICONS = {
  total: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  hoje: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  unidades: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  atendentes: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
};

function SummaryCard({ label, value, sub, accent, icon }) {
  return (
    <div className={`rounded-2xl p-5 relative overflow-hidden transition-transform hover:-translate-y-0.5 ${
      accent
        ? 'text-white'
        : 'bg-white border border-slate-100'
    }`}
      style={accent
        ? { background: 'linear-gradient(135deg,#0A2647 0%,#1B6AB1 100%)', boxShadow: '0 8px 32px rgba(15,52,96,.28)' }
        : { boxShadow: '0 2px 12px rgba(15,52,96,.07)' }
      }>
      {/* Círculo decorativo de fundo */}
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-10"
        style={{ background: accent ? '#fff' : '#1B6AB1' }} />
      <div className="absolute -right-1 -bottom-6 w-14 h-14 rounded-full opacity-5"
        style={{ background: accent ? '#fff' : '#0F3460' }} />

      <div className="flex items-start justify-between mb-3 relative">
        <p className={`text-[10px] font-bold uppercase tracking-widest ${accent ? 'text-white/60' : 'text-slate-400'}`}>{label}</p>
        <span className={`p-1.5 rounded-xl ${accent ? 'bg-white/15 text-white' : 'bg-[#EBF4FF] text-[#1B6AB1]'}`}>
          {icon}
        </span>
      </div>
      <p className={`text-[42px] font-extrabold font-tabular leading-none relative ${accent ? 'text-white' : 'text-[#0F3460]'}`}>
        {value}
      </p>
      {sub && <p className={`text-xs mt-2 relative ${accent ? 'text-white/45' : 'text-slate-400'}`}>{sub}</p>}
    </div>
  );
}

function MiniTable({ title, rows }) {
  const max = rows.length ? Math.max(...rows.map(r => r.count)) : 1;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(15,52,96,.07)' }}>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#1B6AB1,#0F3460)' }} />
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{title}</span>
      </div>
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p className="text-sm text-slate-300 font-medium">Sem dados ainda</p>
        </div>
      ) : rows.map((r, i) => (
        <div key={i} className="px-5 py-3 border-b border-slate-50 last:border-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center font-tabular"
                style={{ background: i === 0 ? 'linear-gradient(135deg,#0F3460,#1B6AB1)' : '#EBF4FF', color: i === 0 ? '#fff' : '#1B6AB1' }}>
                {i + 1}
              </span>
              <span className="text-sm text-slate-700 font-medium">{r.name || r.unit}</span>
            </div>
            <span className="text-sm font-bold text-[#0F3460] font-tabular">{r.count}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(r.count / max) * 100}%`, background: i === 0 ? 'linear-gradient(90deg,#0F3460,#1B6AB1)' : 'linear-gradient(90deg,#93C5FD,#1B6AB1)' }} />
          </div>
        </div>
      ))}
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
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg,#EEF4FB 0%,#F5F8FC 100%)' }}>

      {/* Topbar */}
      <header className="bg-white border-b border-slate-100 px-6 h-[62px] flex items-center justify-between gap-4 sticky top-0 z-40"
        style={{ boxShadow: '0 1px 0 #E2EBF6, 0 4px 16px rgba(15,52,96,.05)' }}>
        <div className="flex items-center gap-4">
          <Logo size={38} />
          <div className="w-px h-7 bg-slate-100" />
          <span className="text-white text-[10px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full"
            style={{ background: 'linear-gradient(135deg,#0A2647,#1B6AB1)', boxShadow: '0 2px 8px rgba(15,52,96,.25)' }}>
            Painel Admin
          </span>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-[#0F3460] text-xs font-semibold px-3 py-2 rounded-xl hover:bg-[#EBF4FF] transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sair
        </button>
      </header>

      {/* Faixa decorativa */}
      <div style={{ height: 3, background: 'linear-gradient(90deg,#0A2647,#1B6AB1 50%,#2B8CD8)' }} />

      <div className="max-w-5xl w-full mx-auto px-4 py-7 flex flex-col gap-5 pb-16">

        {/* Filtros */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-wrap gap-3 items-end"
          style={{ boxShadow: '0 2px 12px rgba(15,52,96,.06)' }}>
          {[
            { label: 'Unidade', key: 'unit', options: UNITS },
            { label: 'Atendente', key: 'attendant', options: ATTENDANTS },
          ].map(({ label, key, options }) => (
            <div key={key} className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
              <select value={filters[key]} onChange={e => setF(key, e.target.value)}
                className="h-10 border border-slate-200 rounded-xl px-3 text-sm bg-[#F8FBFF] outline-none focus:border-[#1B6AB1] focus:ring-2 focus:ring-[#1B6AB1]/10 transition text-slate-700">
                <option value="">Todos</option>
                {options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          {[{ label: 'Data início', key: 'from' }, { label: 'Data fim', key: 'to' }].map(({ label, key }) => (
            <div key={key} className="flex flex-col gap-1.5 flex-1 min-w-[130px]">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
              <input type="date" value={filters[key]} onChange={e => setF(key, e.target.value)}
                className="h-10 border border-slate-200 rounded-xl px-3 text-sm bg-[#F8FBFF] outline-none focus:border-[#1B6AB1] focus:ring-2 focus:ring-[#1B6AB1]/10 transition text-slate-700" />
            </div>
          ))}
          <button onClick={clearFilters}
            className="h-10 px-4 text-slate-400 hover:text-[#1B6AB1] text-sm font-semibold rounded-xl border border-slate-200 hover:border-[#1B6AB1] hover:bg-[#EBF4FF] transition self-end">
            Limpar
          </button>
          <button onClick={exportCSV}
            className="h-10 px-5 text-white text-sm font-bold rounded-xl transition self-end flex items-center gap-2 whitespace-nowrap hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#0A2647,#1B6AB1)', boxShadow: '0 4px 14px rgba(15,52,96,.25)' }}>
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
          <SummaryCard label="Total de registros" value={summary.total}        sub="no período filtrado"   accent icon={CARD_ICONS.total} />
          <SummaryCard label="Hoje"                value={summary.today}       sub={fDateBR(today)}        icon={CARD_ICONS.hoje} />
          <SummaryCard label="Unidades"            value={summary.byUnit.length} sub="com registros"       icon={CARD_ICONS.unidades} />
          <SummaryCard label="Atendentes"          value={summary.byAtt.length}  sub="com registros"       icon={CARD_ICONS.atendentes} />
        </div>

        {/* Mini tables */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <MiniTable title="Por Atendente" rows={summary.byAtt} />
          <MiniTable title="Por Unidade"   rows={summary.byUnit} />
        </div>

        {/* Tabela detalhada */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
          style={{ boxShadow: '0 2px 12px rgba(15,52,96,.07)' }}>
          <div className="px-5 py-4 flex items-center justify-between gap-3 flex-wrap border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#1B6AB1,#0F3460)' }} />
              <span className="text-sm font-bold text-slate-700">Registros detalhados</span>
            </div>
            <span className="text-xs font-bold text-[#1B6AB1] bg-[#EBF4FF] px-3 py-1 rounded-full font-tabular">
              {records.length} registro{records.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="w-8 h-8 border-2 border-[#1B6AB1] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Carregando…</p>
              </div>
            ) : records.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <p className="text-sm text-slate-400 font-medium">Nenhum registro encontrado</p>
                <p className="text-xs text-slate-300">Tente ajustar os filtros acima</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'linear-gradient(90deg,#0A2647,#1B6AB1)' }}>
                    {['#', 'Atendente', 'Unidade', 'Data', 'Horário'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-white/70 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r.id} className={`border-b border-slate-50 hover:bg-[#F5F9FF] transition-colors ${i % 2 === 0 ? '' : 'bg-[#FAFCFF]'}`}>
                      <td className="px-5 py-3 text-slate-300 font-tabular text-xs">{records.length - i}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{r.name}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-semibold text-[#1B6AB1] bg-[#EBF4FF] px-2.5 py-1 rounded-full whitespace-nowrap">
                          {r.unit}
                        </span>
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
