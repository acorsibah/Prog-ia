// ====================================================================
// Servico de Consulta Publica e Operacional - ViraCorpus
// ====================================================================

import { IRepositorioLogistica } from '../repositories/IRepositorioLogistica';
import { PontoDescarteConsulta, CaixaFisica, RegistroDestinacao } from '../models/tiposDominio';

export class ConsultaService {
  constructor(private repositorio: IRepositorioLogistica) {}

  // Lista todos os pontos de descarte autorizados
  public async listarPontos(): Promise<PontoDescarteConsulta[]> {
    return this.repositorio.listarPontosConsulta();
  }

  // Lista caixas fisicas disponiveis no patio de Viracopos
  public async listarCaixasDisponiveis(): Promise<CaixaFisica[]> {
    return this.repositorio.listarCaixasDisponiveis();
  }

  // Lista destinacoes que ainda demandam comprovante ou peso
  public async listarDestinacoesPendentes(): Promise<RegistroDestinacao[]> {
    return this.repositorio.listarDestinacoesPendentes();
  }
}

