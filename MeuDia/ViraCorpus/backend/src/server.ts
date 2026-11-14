// ====================================================================
// Servidor Express Principal - ViraCorpus API
// ====================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RepositorioMemoria } from './repositories/RepositorioMemoria';
import { criarRotasApi } from './routes/apiRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Instancia o repositorio (Memoria com dados de Viracopos para homologacao)
const repositorio = new RepositorioMemoria();

// Registra as rotas da aplicacao
app.use('/api', criarRotasApi(repositorio));

// Rota raiz para verificacao de saude
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', aplicacao: 'ViraCorpus API', aeroporto: 'Viracopos' });
});

export const servidor = app.listen(PORT, () => {
  console.log(`[ViraCorpus] API rodando com sucesso na porta ${PORT}`);
});

export default app;

