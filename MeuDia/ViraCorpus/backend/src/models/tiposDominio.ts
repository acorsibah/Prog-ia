// ====================================================================
// Tipos e Interfaces do Dominio Logistico - ViraCorpus
// ====================================================================

export type PerfilUsuario = 'GESTAO' | 'MOTORISTA' | 'CONSULTA';

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  perfil: PerfilUsuario;
}

export type StatusCaixa = 
  | 'DISPONIVEL' 
  | 'INSTALADA' 
  | 'EM_TRANSITO' 
  | 'EM_MANUTENCAO' 
  | 'INDISPONIVEL' 
  | 'GIRO' 
  | 'RETIRADA_OPERACAO';

export interface CaixaFisica {
  id: string;
  codigoPatrimonio: string;
  tipoCaixaId: string;
  localAtualId: string | null;
  status: StatusCaixa;
  isProvisoria: boolean;
  observacao?: string;
}

export interface PontoDescarteConsulta {
  id: string;
  nome: string;
  codigoSetor: string;
  descricaoAcesso: string;
  latitude: number;
  longitude: number;
  tipoCaixa: string;
  capacidadeM3: number;
  materiaisAceitos: string[];
  disponivel: boolean;
  dataUltimaTroca: string | null;
  dataUltimaDestinacaoConfirmada: string | null;
}

export interface RequisicaoTrocaCaixa {
  programacaoId?: string;
  localId: string;
  caixaRetiradaId: string;
  caixaInstaladaId: string;
  motoristaId: string;
  veiculoPlaca: string;
  materialId?: string;
  observacoes?: string;
}

export type StatusDestinacao = 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA';

export interface RegistroDestinacao {
  id: string;
  eventoOperacionalId: string;
  caixaFisicaId: string;
  materialId?: string;
  localGeradorId: string;
  status: StatusDestinacao;
  motivoPendencia?: string;
  destinadora?: string;
  dataExpedicao: string;
  dataConfirmacao?: string;
  pesoKg?: number;
  mtrNumero?: string;
  ticketCdr?: string;
  responsavelRegistroId: string;
}

export interface RequisicaoConfirmacaoDestinacao {
  registroDestinacaoId: string;
  pesoKg: number;
  mtrNumero: string;
  ticketCdr: string;
  destinadora: string;
  usuarioConfirmacaoId: string;
}

