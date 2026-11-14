// ====================================================================
// Servico de Destinacao de Residuos - ViraCorpus
// Controla a confirmacao mediante evidencias obrigatorias (MTR e Ticket)
// ====================================================================

import { IRepositorioLogistica } from '../repositories/IRepositorioLogistica';
import { RequisicaoConfirmacaoDestinacao, UsuarioAutenticado } from '../models/tiposDominio';

export class DestinacaoService {
  constructor(private repositorio: IRepositorioLogistica) {}

  // Valida perfil com autorizacao para confirmar destinacao
  private validarPermissao(usuario: UsuarioAutenticado): void {
    if (usuario.perfil !== 'GESTAO') {
      throw new Error('Apenas o perfil Gestão pode homologar a confirmação de destinação.');
    }
  }

  // Valida evidencias ambientais obrigatorias
  private validarEvidenciasObrigatorias(dto: RequisicaoConfirmacaoDestinacao): void {
    if (!dto.mtrNumero || dto.mtrNumero.trim().length === 0) {
      throw new Error('O número do MTR é obrigatório para confirmar destinação.');
    }
    if (!dto.ticketCdr || dto.ticketCdr.trim().length === 0) {
      throw new Error('O Ticket de Balança / CDR é obrigatório.');
    }
    if (!dto.pesoKg || dto.pesoKg <= 0) {
      throw new Error('O peso aferido deve ser maior que zero.');
    }
  }

  // Valida se o registro de destinacao existe e ainda esta pendente
  private async validarRegistroPendente(registroId: string): Promise<void> {
    const registro = await this.repositorio.obterDestinacaoPorId(registroId);
    if (!registro) {
      throw new Error('Registro de destinação não encontrado.');
    }
    if (registro.status !== 'PENDENTE') {
      throw new Error(`Destinação já finalizada com status: ${registro.status}`);
    }
  }

  // Processa a confirmacao e gera auditoria
  public async confirmarDestinacao(
    usuario: UsuarioAutenticado,
    dto: RequisicaoConfirmacaoDestinacao
  ): Promise<{ sucesso: boolean; mensagem: string }> {
    this.validarPermissao(usuario);
    this.validarEvidenciasObrigatorias(dto);
    await this.validarRegistroPendente(dto.registroDestinacaoId);

    await this.repositorio.confirmarDestinacao(dto);

    await this.repositorio.registrarAuditoria(
      'registros_destinacao',
      dto.registroDestinacaoId,
      'UPDATE',
      { usuario: usuario.nome, acao: 'DESTINACAO_CONFIRMADA', peso: dto.pesoKg, mtr: dto.mtrNumero }
    );

    return { sucesso: true, mensagem: 'Destinação confirmada com sucesso.' };
  }
}

