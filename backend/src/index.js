require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/records', require('./routes/records'));
app.use('/api/users',   require('./routes/users'));

app.use(errorHandler);

app.listen(PORT, () => console.log(`🚀 Prover Saúde API rodando na porta ${PORT}`));
