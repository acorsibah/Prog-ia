"""Testes automatizados para o servico de skills e seguranca."""

from src.services.skills_service import skills_service


def test_obter_especificacao_abrir_pedido() -> None:
    """Valida a leitura do arquivo json da skill /abrir-pedido."""
    espec = skills_service.obter_especificacao("abrir-pedido")
    assert espec is not None
    assert espec["trigger"] == "/abrir-pedido"
    assert "mesa" in espec["parameters"]


def test_listar_cenarios_de_teste() -> None:
    """Valida a descoberta dos modulos de teste sem disparar execucao."""
    cenarios = skills_service.listar_testes_previstos()
    assert len(cenarios) >= 4
    assert any("test_database.py" in c for c in cenarios)


def test_auditoria_seguranca_sem_vazamento() -> None:
    """Valida se a auditoria de seguranca oculta os valores dos segredos."""
    relatorio = skills_service.auditar_seguranca()
    assert relatorio.status_geral in ("APROVADO", "ATENÇÃO")
    for var in relatorio.variaveis_detectadas:
        assert "[CONFIGURADO - VALOR OCULTO]" in var
        assert "restaurante.sqlite" not in var
