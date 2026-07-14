import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]   = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.username.trim().toLowerCase(), form.password);
      navigate(user.role === 'admin' ? '/admin' : '/registrar', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy to-royal p-5">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm px-9 py-11">
        <div className="flex justify-center mb-8">
          <Logo size={48} textClass="text-2xl" />
        </div>

        <p className="text-center text-sm font-semibold text-slate-500 mb-6 tracking-wide">
          Acesso ao Sistema de Registro
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Usuário
            </label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Digite seu usuário"
              autoComplete="username"
              autoCapitalize="none"
              className="h-11 border-[1.5px] border-slate-200 rounded-xl px-3.5 text-sm bg-slate-50 outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 focus:bg-white transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Senha
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              className="h-11 border-[1.5px] border-slate-200 rounded-xl px-3.5 text-sm bg-slate-50 outline-none focus:border-royal focus:ring-2 focus:ring-royal/15 focus:bg-white transition"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg px-4 py-2.5 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 mt-1 bg-royal hover:bg-navy text-white font-bold rounded-xl tracking-wide transition disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
