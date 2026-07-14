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

  useEffect(() => {
    loadToday();
  }, []);

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
    } catch {
      showToast('Erro ao desfazer.');
    }
  }

  function showToast(msg) {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2300);
  }

  function handleLogout() { logout(); navigate('/', { replace: true }); }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FC]">
      {/* Header */}
      <header className="bg-navy px-4 py-3 flex items-center justify-between gap-3">
        <Logo size={36} />
        <div className="flex items-center gap-3">
          <div className="text-right leading-tight">
            <strong className="block text-white text-sm font-bold">{user?.name}</strong>
            <span className="text-white/50 text-xs">{user?.unit}</span>
          </div>
          <button
            onClick={handleLogout}
            className="bg-white/10 hover:bg-white/20 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-5 py-8">
        {/* Counter */}
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            Clientes registrados hoje
          </p>
          <div className="text-7xl font-extrabold text-navy font-tabular leading-none tracking-tighter">
            {count}
          </div>
          <p className="text-slate-400 text-sm mt-1.5">em {date}</p>
        </div>

        {/* Big button */}
        <button
          onClick={register}
          disabled={loading}
          className={[
            'flex flex-col items-center justify-center gap-3',
            'w-[min(320px,88vw)] aspect-[1.35]',
            'rounded-2xl bg-royal text-white',
            'text-[clamp(18px,4.5vw,23px)] font-extrabold tracking-wide',
            'shadow-[0_8px_32px_rgba(27,106,177,.38)]',
            'transition-all duration-150 active:scale-95',
            'hover:bg-navy disabled:opacity-70',
            pulse ? 'animate-pulse' : '',
          ].join(' ')}
        >
          <svg width="46" height="46" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="21" stroke="rgba(255,255,255,.35)" strokeWidth="2" />
            <path d="M24 14V34M14 24H34" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
          {loading ? 'Registrando…' : 'Registrar Cliente'}
        </button>

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!lastId}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 border-[1.5px] border-slate-200 rounded-lg px-4 py-2 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-slate-400 disabled:hover:border-slate-200 disabled:hover:bg-transparent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M3 10h11a5 5 0 0 1 0 10H7" /><polyline points="7 6 3 10 7 14" />
          </svg>
          Desfazer último registro
        </button>
      </main>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-navy text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg whitespace-nowrap z-50 animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}
