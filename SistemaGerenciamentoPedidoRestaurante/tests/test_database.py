"""Testes automatizados para o modulo de banco de dados."""

from pathlib import Path
import sqlite3
import pytest
from src.config.database import inicializar_banco, obter_conexao


@pytest.fixture
def db_temporario(tmp_path: Path) -> Path:
    """Fixture que cria uma instancia temporaria e isolada do banco SQLite."""
    caminho = tmp_path / "teste_restaurante.sqlite"
    inicializar_banco(caminho)
    return caminho


def test_tabelas_criadas_com_sucesso(db_temporario: Path) -> None:
    """Valida se todas as 4 tabelas essenciais foram criadas no banco."""
    with obter_conexao(db_temporario) as conexao:
        tabelas = [
            row["name"]
            for row in conexao.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        ]
        assert "mesas" in tabelas
        assert "cardapio" in tabelas
        assert "pedidos" in tabelas
        assert "itens_pedido" in tabelas


def test_carga_inicial_de_mesas_e_cardapio(db_temporario: Path) -> None:
    """Valida se o seed automatico insere mesas e itens padrao."""
    with obter_conexao(db_temporario) as conexao:
        total_mesas = conexao.execute("SELECT COUNT(*) AS c FROM mesas").fetchone()["c"]
        total_cardapio = conexao.execute("SELECT COUNT(*) AS c FROM cardapio").fetchone()["c"]
        assert total_mesas >= 6
        assert total_cardapio >= 5


def test_violacao_de_chave_estrangeira(db_temporario: Path) -> None:
    """Valida se o PRAGMA foreign_keys rejeita pedidos para mesas inexistentes."""
    with obter_conexao(db_temporario) as conexao:
        with pytest.raises(sqlite3.IntegrityError):
            conexao.execute(
                "INSERT INTO pedidos (mesa_id, status, valor_total) VALUES (9999, 'RECEBIDO', 50.0)"
            )
