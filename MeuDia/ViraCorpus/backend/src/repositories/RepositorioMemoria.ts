// ====================================================================
// Repositorio em Memoria para Testes e Desenvolvimento Rapido
// Simula a persistencia do PostgreSQL com dados autorizados de Viracopos
// ====================================================================

import { IRepositorioLogistica } from './IRepositorioLogistica';
import { 
  CaixaFisica, 
  PontoDescarteConsulta, 
  RegistroDestinacao, 
  RequisicaoTrocaCaixa, 
  RequisicaoConfirmacaoDestinacao 
} from '../models/tiposDominio';

export class RepositorioMemoria implements IRepositorioLogistica {
  private pontos: PontoDescarteConsulta[] = [];
  private caixas: CaixaFisica[] = [];
  private destinacoes: RegistroDestinacao[] = [];
  private logsAuditoria: any[] = [];

  constructor() {
    this.carregarDadosIniciais();
  }

  // Carga inicial com dados realistas de Viracopos [DADOS DE EXEMPLO]
  private carregarDadosIniciais(): void {
    this.pontos = [
      {
        id: 'loc-01',
        nome: 'Terminal de Cargas - Doca 04',
        codigoSetor: 'TECA-CARGA-01',
        descricaoAcesso: 'Acesso lateral pelo portao P4 - exigido cracha verde',
        latitude: -23.007420,
        longitude: -47.134560,
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
        latitude: -23.011240,
        longitude: -47.138910,
        tipoCaixa: 'Poli',
        capacidadeM3: 5,
        materiaisAceitos: ['Sucata Metalica'],
        disponivel: true,
        dataUltimaTroca: '2026-10-20T11:00:00Z',
        dataUltimaDestinacaoConfirmada: '2026-10-20T16:40:00Z',
      },
      {
        id: 'loc-03',
        nome: 'Terminal de Passageiros 1 - Doca Tecnica',
        codigoSetor: 'TPS1-EMBARQUE-03',
        descricaoAcesso: 'Acesso pela via de servico inferior do terminal',
        latitude: -23.004810,
        longitude: -47.140230,
        tipoCaixa: 'Roll-on',
        capacidadeM3: 26,
        materiaisAceitos: ['Papelão', 'Plástico Filme'],
        disponivel: true,
        dataUltimaTroca: '2026-10-21T18:00:00Z',
        dataUltimaDestinacaoConfirmada: '2026-10-19T10:00:00Z',
      }
    ];

    this.caixas = [
      { id: 'cx-01', codigoPatrimonio: 'CX-40-001', tipoCaixaId: 'tipo-40', localAtualId: 'loc-01', status: 'INSTALADA', isProvisoria: false },
      { id: 'cx-02', codigoPatrimonio: 'CX-05-002', tipoCaixaId: 'tipo-05', localAtualId: 'loc-02', status: 'INSTALADA', isProvisoria: false },
      { id: 'cx-03', codigoPatrimonio: 'CX-26-003', tipoCaixaId: 'tipo-26', localAtualId: 'loc-03', status: 'INSTALADA', isProvisoria: false },
      { id: 'cx-04', codigoPatrimonio: 'CX-40-GIRO-01', tipoCaixaId: 'tipo-40', localAtualId: null, status: 'DISPONIVEL', isProvisoria: false },
      { id: 'cx-05', codigoPatrimonio: 'CX-05-GIRO-02', tipoCaixaId: 'tipo-05', localAtualId: null, status: 'GIRO', isProvisoria: false },
    ];
  }

  // Lista todos os pontos para visualizacao publica
  public async listarPontosConsulta(): Promise<PontoDescarteConsulta[]> {
    return [...this.pontos];
  }

  // Busca caixa por identificador
  public async obterCaixaPorId(id: string): Promise<CaixaFisica | null> {
    const caixa = this.caixas.find((c) => c.id === id);
    return caixa ? { ...caixa } : null;
  }

  // Lista caixas livres para serem instaladas
  public async listarCaixasDisponiveis(): Promise<CaixaFisica[]> {
    return this.caixas.filter((c) => c.status === 'DISPONIVEL');
  }

  // Atualiza os status de inventario na troca
  private atualizarStatusInventario(dto: RequisicaoTrocaCaixa): void {
    const instalada = this.caixas.find((c) => c.id === dto.caixaInstaladaId);
    if (instalada) {
      instalada.status = 'INSTALADA';
      instalada.localAtualId = dto.localId;
    }
    const retirada = this.caixas.find((c) => c.id === dto.caixaRetiradaId);
    if (retirada) {
      retirada.status = 'GIRO';
      retirada.localAtualId = null;
    }
  }

  // Atualiza a data da ultima troca do ponto
  private atualizarDataTrocaPonto(localId: string, dataHora: string): void {
    const ponto = this.pontos.find((p) => p.id === localId);
    if (ponto) ponto.dataUltimaTroca = dataHora;
  }

  // Executa troca criando o registro de destinacao com status pendente
  public async executarTroca(dto: RequisicaoTrocaCaixa): Promise<{ eventoId: string; destinacaoId: string }> {
    const agora = new Date().toISOString();
    const eventoId = `ev-${Date.now()}`;
    const destinacaoId = `dest-${Date.now()}`;

    this.atualizarStatusInventario(dto);
    this.atualizarDataTrocaPonto(dto.localId, agora);

    this.destinacoes.push({
      id: destinacaoId,
      eventoOperacionalId: eventoId,
      caixaFisicaId: dto.caixaRetiradaId,
      materialId: dto.materialId,
      localGeradorId: dto.localId,
      status: 'PENDENTE',
      dataExpedicao: agora,
      responsavelRegistroId: dto.motoristaId,
    });

    return { eventoId, destinacaoId };
  }

  // Lista destinacoes que ainda estao pendentes de confirmacao
  public async listarDestinacoesPendentes(): Promise<RegistroDestinacao[]> {
    return this.destinacoes.filter((d) => d.status === 'PENDENTE');
  }

  // Busca destinacao especifica
  public async obterDestinacaoPorId(id: string): Promise<RegistroDestinacao | null> {
    const dest = this.destinacoes.find((d) => d.id === id);
    return dest ? { ...dest } : null;
  }

  // Atualiza ponto com a data da confirmacao
  private atualizarDataConfirmacaoPonto(localId: string, data: string): void {
    const ponto = this.pontos.find((p) => p.id === localId);
    if (ponto) ponto.dataUltimaDestinacaoConfirmada = data;
  }

  // Confirma a destinacao e libera a caixa de giro
  public async confirmarDestinacao(dto: RequisicaoConfirmacaoDestinacao): Promise<void> {
    const dest = this.destinacoes.find((d) => d.id === dto.registroDestinacaoId);
    if (!dest) throw new Error('Destinação não encontrada.');

    const agora = new Date().toISOString();
    dest.status = 'CONFIRMADA';
    dest.pesoKg = dto.pesoKg;
    dest.mtrNumero = dto.mtrNumero;
    dest.ticketCdr = dto.ticketCdr;
    dest.destinadora = dto.destinadora;
    dest.dataConfirmacao = agora;

    const caixa = this.caixas.find((c) => c.id === dest.caixaFisicaId);
    if (caixa) caixa.status = 'DISPONIVEL';

    this.atualizarDataConfirmacaoPonto(dest.localGeradorId, agora);
  }

  // Registra acoes de auditoria
  public async registrarAuditoria(tabela: string, registroId: string, acao: string, dados: any): Promise<void> {
    this.logsAuditoria.push({
      tabela,
      registroId,
      acao,
      dados,
      dataHora: new Date().toISOString(),
    });
  }
}

