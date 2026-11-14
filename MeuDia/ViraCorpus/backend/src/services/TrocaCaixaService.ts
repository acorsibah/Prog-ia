// ====================================================================
// Servico de Troca de Caixas - ViraCorpus
// Aplica a regra central: Troca nao infere destinacao.
// Mantem cada funcao com menos de 20 linhas e responsabilidade unica.
// ====================================================================

import { IRepositorioLogistica } from '../repositories/IRepositorioLogistica';
import { RequisicaoTrocaCaixa, UsuarioAutenticado } from '../models/tiposDominio';

export class TrocaCaixaService {
  constructor(private repositorio: IRepositorioLogistica) {}

  // Valida se o usuario possui permissao de operacao em campo
  private validarPermissao(usuario: UsuarioAutenticado): void {
    if (usuario.perfil !== 'GESTAO' && usuario.perfil !== 'MOTORISTA') {
      throw new Error('Apenas Gestão ou Motorista podem registrar troca de caixa.');
    }
  }

  // Valida integridade dos parametros obrigatorios da troca
  private validarCamposObrigatorios(dto: RequisicaoTrocaCaixa): void {
    if (!dto.localId || !dto.caixaRetiradaId || !dto.caixaInstaladaId) {
      throw new Error('Local, caixa retirada e instalada são obrigatórios.');
    }
    if (dto.caixaRetiradaId === dto.caixaInstaladaId) {
      throw new Error('A caixa instalada não pode ser idêntica à caixa retirada.');
    }
  }

  // Valida disponibilidade da caixa fisica que esta sendo instalada
  private async validarDisponibilidadeInstalada(caixaInstaladaId: string): Promise<void> {
    const caixa = await this.repositorio.obterCaixaPorId(caixaInstaladaId);
    if (!caixa) {
      throw new Error('Caixa a ser instalada não encontrada no inventário.');
    }
    if (caixa.status !== 'DISPONIVEL' && caixa.status !== 'GIRO') {
      throw new Error(`A caixa instalada não está disponível. Status atual: ${caixa.status}`);
    }
  }

  // Executa o fluxo completo da troca garantindo a criacao da pendencia
  public async registrarTroca(
    usuario: UsuarioAutenticado,
    dto: RequisicaoTrocaCaixa
  ): Promise<{ sucesso: boolean; eventoId: string; destinacaoId: string }> {
    this.validarPermissao(usuario);
    this.validarCamposObrigatorios(dto);
    await this.validarDisponibilidadeInstalada(dto.caixaInstaladaId);

    const resultado = await this.repositorio.executarTroca(dto);

    await this.repositorio.registrarAuditoria(
      'eventos_operacionais',
      resultado.eventoId,
      'INSERT',
      { usuario: usuario.nome, acao: 'TROCA_REALIZADA', dto }
    );

    return { sucesso: true, ...resultado };
  }
}

