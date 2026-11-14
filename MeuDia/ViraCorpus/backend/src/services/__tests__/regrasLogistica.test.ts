// ====================================================================
// Testes de Regra de Negocio - ViraCorpus
// Verifica o desacoplamento entre Troca e Destinacao
// ====================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { RepositorioMemoria } from '../../repositories/RepositorioMemoria';
import { TrocaCaixaService } from '../TrocaCaixaService';
import { DestinacaoService } from '../DestinacaoService';
import { UsuarioAutenticado } from '../../models/tiposDominio';

describe('Regra Central: Desacoplamento entre Troca e Destinacao', () => {
  const repo = new RepositorioMemoria();
  const trocaService = new TrocaCaixaService(repo);
  const destinacaoService = new DestinacaoService(repo);

  const motorista: UsuarioAutenticado = {
    id: 'user-mot-01',
    nome: 'Carlos Motorista',
    perfil: 'MOTORISTA'
  };

  const gestor: UsuarioAutenticado = {
    id: 'user-ges-01',
    nome: 'Gestor Logístico',
    perfil: 'GESTAO'
  };

  const consulta: UsuarioAutenticado = {
    id: 'user-con-01',
    nome: 'Fiscal Consulta',
    perfil: 'CONSULTA'
  };

  test('Usuario de consulta nao pode registrar troca de caixa', async () => {
    await assert.rejects(
      async () => {
        await trocaService.registrarTroca(consulta, {
          localId: 'loc-01',
          caixaRetiradaId: 'cx-01',
          caixaInstaladaId: 'cx-04',
          motoristaId: consulta.id,
          veiculoPlaca: 'BRA2E19'
        });
      },
      /Apenas Gestão ou Motorista/
    );
  });

  test('Motorista registra troca e destinacao permanece PENDENTE', async () => {
    const res = await trocaService.registrarTroca(motorista, {
      localId: 'loc-01',
      caixaRetiradaId: 'cx-01',
      caixaInstaladaId: 'cx-04',
      motoristaId: motorista.id,
      veiculoPlaca: 'BRA2E19'
    });

    assert.equal(res.sucesso, true);
    assert.ok(res.destinacaoId);

    const dest = await repo.obterDestinacaoPorId(res.destinacaoId);
    assert.equal(dest?.status, 'PENDENTE');
    assert.equal(dest?.pesoKg, undefined);
  });

  test('Nao permite confirmar destinacao sem MTR e Ticket de balanca', async () => {
    const pendentes = await repo.listarDestinacoesPendentes();
    const pendenteId = pendentes[0].id;

    await assert.rejects(
      async () => {
        await destinacaoService.confirmarDestinacao(gestor, {
          registroDestinacaoId: pendenteId,
          pesoKg: 0,
          mtrNumero: '',
          ticketCdr: '',
          destinadora: 'Aterro Sanitário Paulínia',
          usuarioConfirmacaoId: gestor.id
        });
      },
      /MTR é obrigatório/
    );
  });

  test('Gestor confirma destinacao com evidencias e libera caixa de giro', async () => {
    const pendentes = await repo.listarDestinacoesPendentes();
    const pendenteId = pendentes[0].id;

    const res = await destinacaoService.confirmarDestinacao(gestor, {
      registroDestinacaoId: pendenteId,
      pesoKg: 3450.50,
      mtrNumero: 'MTR-SP-2026-99881',
      ticketCdr: 'CDR-88712',
      destinadora: 'Destinadora Paulínia Resíduos',
      usuarioConfirmacaoId: gestor.id
    });

    assert.equal(res.sucesso, true);

    const destConfirmada = await repo.obterDestinacaoPorId(pendenteId);
    assert.equal(destConfirmada?.status, 'CONFIRMADA');
    assert.equal(destConfirmada?.pesoKg, 3450.50);
  });
});

