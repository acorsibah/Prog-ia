// ====================================================================
// Definicao das Rotas da API - ViraCorpus
// ====================================================================

import { Router } from 'express';
import { IRepositorioLogistica } from '../repositories/IRepositorioLogistica';
import { TrocaCaixaService } from '../services/TrocaCaixaService';
import { DestinacaoService } from '../services/DestinacaoService';
import { ConsultaService } from '../services/ConsultaService';
import { TrocaController } from '../controllers/TrocaController';
import { DestinacaoController } from '../controllers/DestinacaoController';
import { ConsultaController } from '../controllers/ConsultaController';

export const criarRotasApi = (repositorio: IRepositorioLogistica): Router => {
  const router = Router();

  const trocaService = new TrocaCaixaService(repositorio);
  const destinacaoService = new DestinacaoService(repositorio);
  const consultaService = new ConsultaService(repositorio);

  const trocaController = new TrocaController(trocaService);
  const destinacaoController = new DestinacaoController(destinacaoService);
  const consultaController = new ConsultaController(consultaService);

  // Rotas de Consulta Publica
  router.get('/pontos', consultaController.listarPontos);
  router.get('/caixas/disponiveis', consultaController.listarCaixas);
  router.get('/destinacoes/pendentes', consultaController.listarPendencias);

  // Rotas Operacionais (Troca e Destinacao)
  router.post('/operacoes/troca', trocaController.registrar);
  router.post('/destinacoes/confirmar', destinacaoController.confirmar);

  return router;
};

