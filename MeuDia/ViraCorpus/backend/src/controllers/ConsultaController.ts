// ====================================================================
// Controlador de Consulta Publica e Operacional - ViraCorpus
// ====================================================================

import { Request, Response } from 'express';
import { ConsultaService } from '../services/ConsultaService';

export class ConsultaController {
  constructor(private consultaService: ConsultaService) {}

  // Lista todos os pontos autorizados para exibicao no mapa
  public listarPontos = async (_req: Request, res: Response): Promise<void> => {
    try {
      const pontos = await this.consultaService.listarPontos();
      res.json(pontos);
    } catch (erro: any) {
      res.status(500).json({ erro: 'Erro ao consultar pontos de descarte.' });
    }
  };

  // Lista caixas livres no patio
  public listarCaixas = async (_req: Request, res: Response): Promise<void> => {
    try {
      const caixas = await this.consultaService.listarCaixasDisponiveis();
      res.json(caixas);
    } catch (erro: any) {
      res.status(500).json({ erro: 'Erro ao consultar caixas disponíveis.' });
    }
  };

  // Lista destinacoes que ainda demandam comprovacao
  public listarPendencias = async (_req: Request, res: Response): Promise<void> => {
    try {
      const pendencias = await this.consultaService.listarDestinacoesPendentes();
      res.json(pendencias);
    } catch (erro: any) {
      res.status(500).json({ erro: 'Erro ao consultar pendências.' });
    }
  };
}

