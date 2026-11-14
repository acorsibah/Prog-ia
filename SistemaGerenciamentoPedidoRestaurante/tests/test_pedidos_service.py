"""Testes automatizados para o servico de pedidos e fechamento de contas."""

from pathlib import Path
import pytest
from src.config.database import inicializar_banco
from src.services.mesas_service import MesasService
from src.services.pedidos_service import PedidosService


@pytest.fixture
def service_pedidos(tmp_path: Path) -> tuple[PedidosService, MesasService]:
    """Fixture que cria uma instancia isolada dos servicos de pedidos e mesas."""
    db_path = tmp_path / "pedidos_teste.sqlite"
    inicializar_banco(db_path)
    return PedidosService(db_path), MesasService(db_path)


def test_abrir_pedido_sucesso(service_pedidos: tuple[PedidosService, MesasService]) -> None:
    """Valida a criacao de pedido com calculo de total e ocupacao de mesa."""
    ped_svc, mesa_svc = service_pedidos
    itens = [
        {"codigo": "RIS-01", "quantidade": 2, "observacao": "Sem sal extra"},
        {"codigo": "SUC-02", "quantidade": 1, "observacao": "Com gelo"}
    ]
    pedido_id = ped_svc.abrir_pedido(mesa_numero=1, itens_data=itens)
    assert pedido_id > 0

    mesa = mesa_svc.obter_por_numero(1)
    assert mesa.status == "OCUPADA"

    pedido = ped_svc.obter_pedido_por_mesa(1)
    assert pedido is not None
    assert pedido.valor_total == 131.00
    assert len(pedido.itens) == 2


def test_abrir_pedido_item_inexistente(service_pedidos: tuple[PedidosService, MesasService]) -> None:
    """Garante que tentativa de abrir pedido com item invalido gera excecao."""
    ped_svc, _ = service_pedidos
    itens = [{"codigo": "CODIGO_INEXISTENTE", "quantidade": 1}]
    with pytest.raises(ValueError):
        ped_svc.abrir_pedido(mesa_numero=2, itens_data=itens)


def test_calcular_fechamento_e_liquidacao_conta(service_pedidos: tuple[PedidosService, MesasService]) -> None:
    """Valida a memoria de calculo com taxa de 10% e liquidacao atomica."""
    ped_svc, mesa_svc = service_pedidos
    itens = [{"codigo": "RIS-01", "quantidade": 1}]
    pedido_id = ped_svc.abrir_pedido(mesa_numero=3, itens_data=itens)

    resumo = ped_svc.calcular_fechamento_mesa(3)
    assert resumo.subtotal == 58.50
    assert resumo.taxa_servico == 5.85
    assert resumo.total_com_taxa == 64.35

    sucesso = ped_svc.liquidar_conta(pedido_id, 3, resumo.total_com_taxa)
    assert sucesso is True

    mesa = mesa_svc.obter_por_numero(3)
    assert mesa.status == "LIVRE"
