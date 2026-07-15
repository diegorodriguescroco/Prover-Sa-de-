import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Logo from '../components/Logo';

export default function Attendant() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [count, setCount]     = useState(0);
  const [date, setDate]       = useState('');
  const [lastId, setLastId]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState('');
  const [pulse, setPulse]     = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => { loadToday(); }, []);

  async function loadToday() {
    try {
      const { data } = await api.get('/records/today');
      setCount(data.count);
      setDate(formatDateBR(data.date));
    } catch {}
  }

  async function register() {
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await api.post('/records');
      setLastId(data.id);
      setCount(c => c + 1);
      showToast(`✓ Cliente registrado às ${data.time}`);
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  }

  async function undo() {
    if (!lastId) return;
    try {
      await api.delete(`/records/${lastId}`);
      setLastId(null);
      setCount(c => Math.max(0, c - 1));
      showToast('Último registro removido.');
    } catch { showToast('Erro ao desfazer.'); }
  }

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2300);
  }

  function handleLogout() { logout(); navigate('/', { replace: true }); }

  function formatDateBR(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#F0F5FB' }}>

      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-5 h-[60px] flex items-center justify-between gap-3 sticky top-0 z-40"
        style={{ boxShadow: '0 1px 0 #E2EBF6, 0 2px 12px rgba(15,52,96,.06)' }}>
        <Logo size={38} />
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <strong className="block text-[#0F3460] text-sm font-bold">{user?.name}</strong>
            <span className="text-slate-400 text-xs">{user?.unit}</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-500 hover:text-[#0F3460] text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-[#EBF4FF] transition">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
          </button>
        </div>
      </header>

      {/* Barra decorativa */}
      <div style={{ height: 3, background: 'linear-gradient(90deg,#0F3460,#1B6AB1,#2B8CD8)' }} />

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-5 py-8">

        {/* Counter card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-10 py-6 text-center"
          style={{ boxShadow: '0 4px 24px rgba(15,52,96,.08)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Clientes registrados hoje
          </p>
          <div className="text-[80px] font-extrabold text-[#0F3460] font-tabular leading-none tracking-tighter">
            {count}
          </div>
          <p className="text-slate-400 text-sm mt-2">{date}</p>
        </div>

        {/* Big button */}
        <button
          onClick={register}
          disabled={loading}
          style={{ background: 'linear-gradient(145deg,#1B6AB1,#0F3460)', boxShadow: '0 8px 32px rgba(15,52,96,.30)' }}
          className={[
            'flex flex-col items-center justify-center gap-3',
            'w-[min(300px,88vw)] aspect-[1.3]',
            'rounded-3xl text-white',
            'text-[clamp(18px,4.5vw,22px)] font-extrabold tracking-wide',
            'transition-all duration-150 active:scale-95 hover:opacity-90 disabled:opacity-60',
            pulse ? 'animate-pulse' : '',
          ].join(' ')}
        >
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="21" stroke="rgba(255,255,255,.25)" strokeWidth="2"/>
            <path d="M24 14V34M14 24H34" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
          </svg>
          {loading ? 'Registrando…' : 'Registrar Cliente'}
        </button>

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!lastId}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 border border-slate-200 rounded-xl px-5 py-2.5 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 10h11a5 5 0 0 1 0 10H7"/><polyline points="7 6 3 10 7 14"/>
          </svg>
          Desfazer último registro
        </button>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg whitespace-nowrap z-50"
          style={{ background: 'linear-gradient(135deg,#0F3460,#1B6AB1)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
