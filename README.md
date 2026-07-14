# Prover Saúde — Registro de Clientes

Sistema web para registrar clientes interessados que passam pelas unidades da **Prover Saúde**, com dois perfis de acesso (admin e atendente).

## Stack

- **Backend:** Node.js + Express + `pg` (PostgreSQL) + JWT + bcrypt
- **Banco de dados:** PostgreSQL via [Supabase](https://supabase.com)
- **Frontend:** React + Vite + Tailwind CSS
- **Deploy:** Backend no [Railway](https://railway.app), Frontend na [Vercel](https://vercel.com)

## Estrutura

```
prover-saude/
├── backend/
│   └── src/
│       ├── config/       conexão com o Postgres
│       ├── controllers/  regras de negócio
│       ├── db/           schema.sql e seed.sql
│       ├── middleware/   JWT e error handler
│       ├── routes/       auth e records
│       └── scripts/      migrate.js e seed.js
└── frontend/
    └── src/
        ├── api/          cliente axios
        ├── components/   Logo
        ├── context/      AuthContext
        └── pages/        Login, Attendant, Admin
```

---

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com), crie uma conta e clique em **New Project**.
2. Escolha um nome (ex: `prover-saude`), defina uma senha forte para o banco e selecione a região **South America (São Paulo)**.
3. Aguarde a criação do projeto (~2 minutos).
4. Vá em **Project Settings → Database → Connection string**, aba **URI**, e copie a string. Formato:
   ```
   postgresql://postgres:[SUA-SENHA]@db.[SEU-PROJETO].supabase.co:5432/postgres
   ```
   > Para Railway, prefira o **Session pooler** (porta `6543`).

5. Abra o **SQL Editor** do Supabase e execute em ordem:
   - `backend/src/db/schema.sql` → cria as tabelas `users` e `records`
   - `backend/src/db/seed.sql` → cria os 4 usuários iniciais

### Usuários criados pelo seed

| Usuário | Senha      | Perfil    | Unidade         |
|---------|------------|-----------|-----------------|
| admin   | prover2024 | admin     | —               |
| maria   | atend1     | atendente | Unidade Centro  |
| joana   | atend2     | atendente | Unidade Norte   |
| carla   | atend3     | atendente | Unidade Sul     |

**Troque essas senhas antes de usar em produção.**

---

## 2. Variáveis de ambiente

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA@db.SEU_PROJETO.supabase.co:5432/postgres
JWT_SECRET=gere_um_valor_aleatorio_forte
JWT_EXPIRES_IN=8h
CORS_ORIGIN=http://localhost:5173
PORT=4000
DATABASE_SSL=true
```

Gerar JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:4000/api
```

---

## 3. Rodar localmente

```bash
# Backend
cd backend
npm install
cp .env.example .env   # edite com seus valores
npm run db:migrate     # cria as tabelas
npm run db:seed        # popula os usuários
npm run dev            # http://localhost:4000

# Frontend (outro terminal)
cd frontend
npm install
cp .env.example .env
npm run dev            # http://localhost:5173
```

---

## 4. Deploy backend no Railway

1. Crie uma conta em [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
2. **Root Directory:** `backend`
3. Em **Variables**, adicione:
   - `DATABASE_URL` (connection string do Supabase — Session pooler)
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN=8h`
   - `CORS_ORIGIN` (URL do frontend na Vercel — preencha depois)
   - `DATABASE_SSL=true`
4. Clique em **Deploy**. URL pública gerada: `https://SEU-APP.up.railway.app`
5. Teste: `https://SEU-APP.up.railway.app/health` deve retornar `{"status":"ok"}`

---

## 5. Deploy frontend na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com) → **Add New Project** → mesmo repositório
2. **Root Directory:** `frontend`
3. Em **Environment Variables**, adicione:
   - `VITE_API_URL=https://SEU-APP.up.railway.app/api`
4. Clique em **Deploy**. URL gerada: `https://SEU-FRONTEND.vercel.app`
5. Volte ao Railway e atualize `CORS_ORIGIN` com essa URL → redeploy.
