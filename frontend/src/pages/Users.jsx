import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import Logo from '../components/Logo';

const UNITS = ['Unidade Centro', 'Unidade Norte', 'Unidade Sul'];

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,38,71,.45)', backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        style={{ boxShadow: '0 24px 64px rgba(15,52,96,.22)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <span className="font-bold text-slate-800">{title}</span>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "h-10 border border-slate-200 rounded-xl px-3 text-sm bg-[#F8FBFF] outline-none focus:border-[#1B6AB1] focus:ring-2 focus:ring-[#1B6AB1]/10 transition text-slate-700";

export default function Users() {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal]     = useState(null); // null | 'create' | {user}
  const [del, setDel]         = useState(null); // user to delete
  const [err, setErr]         = useState('');
  const [saving, setSaving]   = useState(false);

  const [form, setForm] = useState({ username: '', name: '', unit: '', role: 'attendant', password: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setForm({ username: '', name: '', unit: UNITS[0], role: 'attendant', password: '' });
    setErr('');
    setModal('create');
  }

  function openEdit(u) {
    setForm({ username: u.username, name: u.name, unit: u.unit || UNITS[0], role: u.role, password: '' });
    setErr('');
    setModal(u);
  }

  function setF(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function save() {
    setErr('');
    setSaving(true);
    try {
      if (modal === 'create') {
        await api.post('/users', form);
      } else {
        const body = { name: form.name, unit: form.unit, role: form.role };
        if (form.password) body.password = form.password;
        await api.put(`/users/${modal.id}`, body);
      }
      setModal(null);
      load();
    } catch (e) {
      setErr(e.response?.data?.error || 'Erro ao salvar.');
    } finally { setSaving(false); }
  }

  async function confirmDelete() {
    try {
      await api.delete(`/users/${del.id}`);
      setDel(null);
      load();
    } catch (e) {
      alert(e.response?.data?.error || 'Erro ao deletar.');
    }
  }

  function handleLogout() { logout(); navigate('/', { replace: true }); }

  const admins    = users.filter(u => u.role === 'admin');
  const attendants = users.filter(u => u.role === 'attendant');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg,#EEF4FB 0%,#F5F8FC 100%)' }}>

      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 h-[62px] flex items-center justify-between gap-4 sticky top-0 z-40"
        style={{ boxShadow: '0 1px 0 #E2EBF6, 0 4px 16px rgba(15,52,96,.05)' }}>
        <div className="flex items-center gap-4">
          <Logo size={38} />
          <div className="w-px h-7 bg-slate-100" />
          <button onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-slate-500 hover:text-[#0F3460] text-xs font-semibold px-2 py-1.5 rounded-lg hover:bg-[#EBF4FF] transition">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Painel Admin
          </button>
          <div className="w-px h-7 bg-slate-100" />
          <span className="text-white text-[10px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full"
            style={{ background: 'linear-gradient(135deg,#0A2647,#1B6AB1)', boxShadow: '0 2px 8px rgba(15,52,96,.25)' }}>
            Usuários
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

      <div style={{ height: 3, background: 'linear-gradient(90deg,#0A2647,#1B6AB1 50%,#2B8CD8)' }} />

      <div className="max-w-3xl w-full mx-auto px-4 py-7 flex flex-col gap-5 pb-16">

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-[#0F3460]">Gerenciar Usuários</h1>
            <p className="text-xs text-slate-400 mt-0.5">{users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-5 h-10 text-white text-sm font-bold rounded-xl transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#0A2647,#1B6AB1)', boxShadow: '0 4px 14px rgba(15,52,96,.25)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Usuário
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-[#1B6AB1] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {[{ label: 'Administradores', list: admins }, { label: 'Atendentes', list: attendants }].map(({ label, list }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-100 overflow-hidden"
                style={{ boxShadow: '0 2px 12px rgba(15,52,96,.07)' }}>
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                  <span className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#1B6AB1,#0F3460)' }} />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{label}</span>
                  <span className="ml-auto text-xs font-bold text-[#1B6AB1] bg-[#EBF4FF] px-2.5 py-0.5 rounded-full">{list.length}</span>
                </div>
                {list.length === 0 ? (
                  <p className="text-sm text-slate-300 text-center py-8">Nenhum cadastrado</p>
                ) : list.map((u, i) => (
                  <div key={u.id}
                    className={`flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 ${i % 2 === 0 ? '' : 'bg-[#FAFCFF]'}`}>
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ background: u.role === 'admin' ? 'linear-gradient(135deg,#0A2647,#1B6AB1)' : 'linear-gradient(135deg,#1B6AB1,#2B8CD8)' }}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{u.name}</p>
                      <p className="text-xs text-slate-400 truncate">@{u.username}{u.unit ? ` · ${u.unit}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEdit(u)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#1B6AB1] hover:bg-[#EBF4FF] px-3 py-1.5 rounded-lg transition">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Editar
                      </button>
                      <button onClick={() => setDel(u)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Modal criar/editar */}
      {modal && (
        <Modal title={modal === 'create' ? 'Novo Usuário' : 'Editar Usuário'} onClose={() => setModal(null)}>
          <div className="flex flex-col gap-4">
            {modal === 'create' && (
              <Field label="Usuário (login)">
                <input className={inputCls} value={form.username} onChange={e => setF('username', e.target.value)}
                  placeholder="ex: maria.silva" autoCapitalize="none" />
              </Field>
            )}
            <Field label="Nome completo">
              <input className={inputCls} value={form.name} onChange={e => setF('name', e.target.value)}
                placeholder="ex: Maria Silva" />
            </Field>
            <Field label="Unidade">
              <select className={inputCls} value={form.unit} onChange={e => setF('unit', e.target.value)}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </Field>
            <Field label="Perfil">
              <select className={inputCls} value={form.role} onChange={e => setF('role', e.target.value)}>
                <option value="attendant">Atendente</option>
                <option value="admin">Administrador</option>
              </select>
            </Field>
            <Field label={modal === 'create' ? 'Senha' : 'Nova senha (deixe em branco para manter)'}>
              <input className={inputCls} type="password" value={form.password}
                onChange={e => setF('password', e.target.value)}
                placeholder={modal === 'create' ? 'Mínimo 6 caracteres' : '••••••'} />
            </Field>
            {err && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg px-4 py-2.5 text-center">{err}</div>
            )}
            <div className="flex gap-3 pt-1">
              <button onClick={() => setModal(null)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 h-10 rounded-xl text-white text-sm font-bold transition hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#0A2647,#1B6AB1)' }}>
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal confirmar delete */}
      {del && (
        <Modal title="Remover usuário" onClose={() => setDel(null)}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6"/><path d="M14 11v6"/>
                </svg>
              </div>
              <p className="text-slate-700 font-semibold text-center">Remover <span className="text-[#0F3460]">{del.name}</span>?</p>
              <p className="text-sm text-slate-400 text-center">Esta ação não pode ser desfeita. O usuário perderá o acesso imediatamente.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDel(null)}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button onClick={confirmDelete}
                className="flex-1 h-10 rounded-xl text-white text-sm font-bold bg-red-500 hover:bg-red-600 transition">
                Remover
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
