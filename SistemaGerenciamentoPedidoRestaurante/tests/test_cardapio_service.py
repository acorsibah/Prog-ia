"""Testes automatizados para o servico de cardapio."""

from pathlib import Path
import pytest
from src.config.database import inicializar_banco
from src.services.cardapio_service import CardapioService


@pytest.fixture
def service_cardapio(tmp_path: Path) -> CardapioService:
    """Fixture para inicializar o servico de cardapio com banco isolado."""
    db_path = tmp_path / "cardapio_teste.sqlite"
    inicializar_banco(db_path)
    return CardapioService(db_path)


def test_listar_itens_cardapio(service_cardapio: CardapioService) -> None:
    """Valida a recuperacao de todos os itens cadastrados."""
    itens = service_cardapio.listar_todos()
    assert len(itens) >= 5
    assert any(i.codigo == "RIS-01" for i in itens)


def test_obter_item_por_codigo(service_cardapio: CardapioService) -> None:
    """Valida a busca de item pelo codigo unico."""
    item = service_cardapio.obter_por_codigo("RIS-01")
    assert item is not None
    assert item.nome == "Risoto de Funghi"
    assert item.preco > 0


def test_alternar_disponibilidade_item(service_cardapio: CardapioService) -> None:
    """Valida a alteracao de disponibilidade de um item."""
    item = service_cardapio.obter_por_codigo("RIS-01")
    assert item is not None
    status_anterior = item.disponivel

    service_cardapio.alternar_disponibilidade(item.id)
    item_modificado = service_cardapio.obter_por_codigo("RIS-01")
    assert item_modificado.disponivel != status_anterior


def test_cadastrar_novo_item(service_cardapio: CardapioService) -> None:
    """Valida o cadastro parametrizado de um novo prato."""
    novo_id = service_cardapio.cadastrar_item("BUR-01", "Hambúrguer Gourmet", "Lanches", 39.90)
    assert novo_id > 0
    item = service_cardapio.obter_por_codigo("BUR-01")
    assert item is not None
    assert item.nome == "Hambúrguer Gourmet"
