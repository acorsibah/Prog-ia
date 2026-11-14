// ====================================================================
// Interfaces de Dominio do Front-end (Fiel ao Modelo Stitch VCP)
// ====================================================================

export type StatusOcupacao = 'LIVRE' | 'ALERTA' | 'CRITICO';

export interface RastreabilidadeTroca {
  dataHora: string;
  motorista: string;
  veiculoPlaca: string;
  detalheLocal: string;
}

export interface RastreabilidadeDestinacao {
  dataHora: string;
  destinadora: string;
  documentoMtr: string;
  tipoCertificado: string;
}

export interface PontoDescarteVCP {
  id: string;
  codigoCaixa: string;
  localidade: string;
  setorDescricao: string;
  tipoCaixa: string;
  capacidadeM3: number;
  ocupacaoPct: number;
  volumeM3: number;
  taraKg: number;
  statusOcupacao: StatusOcupacao;
  materiaisAceitos: string[];
  instrucaoTitulo: string;
  instrucaoTexto: string;
  latitude: number;
  longitude: number;
  ultimaTroca: RastreabilidadeTroca;
  ultimaDestinacao: RastreabilidadeDestinacao;
}

export interface FiltrosStitch {
  localidade: string;
  material: string;
  statusOcupacao: string;
  termoBusca: string;
}

// Interfaces legadas compativeis com endpoints REST da API
export interface PontoDescarte {
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

export interface FiltrosConsulta {
  termoBusca: string;
  material: string;
  capacidade: number | null;
}

export interface CaixaDisponivel {
  id: string;
  codigoPatrimonio: string;
  status: string;
}

export interface DestinacaoPendente {
  id: string;
  caixaFisicaId: string;
  localGeradorId: string;
  dataExpedicao: string;
  status: string;
}
