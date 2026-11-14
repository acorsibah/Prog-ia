// ====================================================================
// Contrato de Persistencia de Dados da Logistica
// ====================================================================

import { 
  CaixaFisica, 
  PontoDescarteConsulta, 
  RegistroDestinacao, 
  RequisicaoTrocaCaixa, 
  RequisicaoConfirmacaoDestinacao 
} from '../models/tiposDominio';

export interface IRepositorioLogistica {
  // Metodos de consulta de pontos de descarte
  listarPontosConsulta(): Promise<PontoDescarteConsulta[]>;
  obterCaixaPorId(id: string): Promise<CaixaFisica | null>;
  listarCaixasDisponiveis(): Promise<CaixaFisica[]>;

  // Metodos de execucao de troca
  executarTroca(dto: RequisicaoTrocaCaixa): Promise<{ eventoId: string; destinacaoId: string }>;

  // Metodos de gestao de destinacao
  listarDestinacoesPendentes(): Promise<RegistroDestinacao[]>;
  obterDestinacaoPorId(id: string): Promise<RegistroDestinacao | null>;
  confirmarDestinacao(dto: RequisicaoConfirmacaoDestinacao): Promise<void>;
  
  // Auditoria
  registrarAuditoria(tabela: string, registroId: string, acao: string, dados: any): Promise<void>;
}

