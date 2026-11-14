// ====================================================================
// Cliente de API HTTP do ViraCorpus com Resiliencia
// ====================================================================

import { PontoDescarte, CaixaDisponivel, DestinacaoPendente } from '../types/pontoDescarte';

const BASE_URL = 'http://localhost:3001/api';

// Busca lista de pontos de descarte autorizados
export const buscarPontosDescarte = async (): Promise<PontoDescarte[]> => {
  try {
    const res = await fetch(`${BASE_URL}/pontos`);
    if (!res.ok) throw new Error('Falha ao obter pontos do servidor');
    return await res.json();
  } catch (err) {
    console.warn('[ViraCorpus API] Usando dados locais de contingencia:', err);
    return obterPontosContingencia();
  }
};

// Registra uma operacao de troca de caixa
export const registrarTrocaApi = async (dados: any): Promise<any> => {
  const res = await fetch(`${BASE_URL}/operacoes/troca`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const erro = await res.json();
    throw new Error(erro.erro || 'Erro ao registrar troca');
  }
  return await res.json();
};

// Confirma destinacao de residuo com evidencias
export const confirmarDestinacaoApi = async (dados: any): Promise<any> => {
  const res = await fetch(`${BASE_URL}/destinacoes/confirmar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados),
  });
  if (!res.ok) {
    const erro = await res.json();
    throw new Error(erro.erro || 'Erro ao confirmar destinacao');
  }
  return await res.json();
};

// Dados locais de contingencia para demonstracao imediata
const obterPontosContingencia = (): PontoDescarte[] => [
  {
    id: 'loc-01',
    nome: 'Terminal de Cargas - Doca 04',
    codigoSetor: 'TECA-CARGA-01',
    descricaoAcesso: 'Acesso lateral pelo portao P4 - exigido cracha verde',
    latitude: -23.00742,
    longitude: -47.13456,
    tipoCaixa: 'Roll-on',
    capacidadeM3: 40,
    materiaisAceitos: ['Madeira', 'Papelão'],
    disponivel: true,
    dataUltimaTroca: '2026-10-23T14:30:00Z',
    dataUltimaDestinacaoConfirmada: '2026-10-22T09:15:00Z',
  },
  {
    id: 'loc-02',
    nome: 'Hangar de Manutencao de Aeronaves',
    codigoSetor: 'HANGAR-MANUT-02',
    descricaoAcesso: 'Area restrita de pista, proximo ao patio de manobras',
    latitude: -23.01124,
    longitude: -47.13891,
    tipoCaixa: 'Poli',
    capacidadeM3: 5,
    materiaisAceitos: ['Sucata Metálica'],
    disponivel: true,
    dataUltimaTroca: '2026-10-20T11:00:00Z',
    dataUltimaDestinacaoConfirmada: '2026-10-20T16:40:00Z',
  },
  {
    id: 'loc-03',
    nome: 'Terminal de Passageiros 1 - Doca Tecnica',
    codigoSetor: 'TPS1-EMBARQUE-03',
    descricaoAcesso: 'Acesso pela via de servico inferior do terminal',
    latitude: -23.00481,
    longitude: -47.14023,
    tipoCaixa: 'Roll-on',
    capacidadeM3: 26,
    materiaisAceitos: ['Papelão', 'Plástico Filme'],
    disponivel: true,
    dataUltimaTroca: '2026-10-21T18:00:00Z',
    dataUltimaDestinacaoConfirmada: '2026-10-19T10:00:00Z',
  }
];

