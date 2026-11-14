"""Testes automatizados para o servico de mesas."""

from pathlib import Path
import pytest
from src.config.database import inicializar_banco
from src.services.mesas_service import MesasService


@pytest.fixture
def service_mesa(tmp_path: Path) -> MesasService:
    """Fixture que inicializa o servico com banco temporario."""
    db_path = tmp_path / "mesas_teste.sqlite"
    inicializar_banco(db_path)
    return MesasService(db_path)


def test_listar_todas_mesas(service_mesa: MesasService) -> None:
    """Valida se a listagem retorna todas as mesas cadastradas."""
    mesas = service_mesa.listar_todas()
    assert len(mesas) >= 6
    assert mesas[0].numero == 1


def test_obter_mesa_existente_e_inexistente(service_mesa: MesasService) -> None:
    """Valida a busca por numero de mesa."""
    mesa = service_mesa.obter_por_numero(1)
    assert mesa is not None
    assert mesa.numero == 1

    mesa_nula = service_mesa.obter_por_numero(999)
    assert mesa_nula is None


def test_atualizar_status_mesa(service_mesa: MesasService) -> None:
    """Valida a transicao de status de uma mesa."""
    mesa = service_mesa.obter_por_numero(2)
    assert mesa is not None
    sucesso = service_mesa.atualizar_status(mesa.id, "OCUPADA")
    assert sucesso is True

    mesa_atualizada = service_mesa.obter_por_numero(2)
    assert mesa_atualizada.status == "OCUPADA"
