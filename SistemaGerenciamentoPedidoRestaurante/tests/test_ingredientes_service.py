"""Testes para o servico de gerenciamento de ingredientes."""

import pytest
from src.config.database import inicializar_banco, obter_conexao
from src.services.ingredientes_service import (
    atualizar_estoque,
    cadastrar_ingrediente,
    excluir_ingrediente,
    listar_ingredientes,
    obter_ingrediente_por_id,
)


@pytest.fixture(autouse=True)
def banco_limpo(tmp_path, monkeypatch):
    """Inicializa banco de dados temporario para cada teste."""
    db_temp = str(tmp_path / "test_ingredientes.sqlite")
    monkeypatch.setenv("DB_PATH", db_temp)
    # Reinicia o singleton de settings para capturar o novo DB_PATH
    import src.config.settings as s
    s._instancia = None
    inicializar_banco()
    yield
    # Limpeza: remove referência ao singleton
    s._instancia = None


def test_listar_ingredientes_vazio():
    """Deve retornar lista vazia quando nenhum ingrediente for cadastrado."""
    resultado = listar_ingredientes()
    assert resultado == []


def test_cadastrar_ingrediente():
    """Deve cadastrar um ingrediente e retornar com id preenchido."""
    ing = cadastrar_ingrediente("Farinha", 5.0, "kg")
    assert ing.id is not None
    assert ing.nome == "Farinha"
    assert ing.quantidade == 5.0
    assert ing.unidade_medida == "kg"


def test_obter_ingrediente_por_id():
    """Deve retornar o ingrediente correto pelo id."""
    ing = cadastrar_ingrediente("Leite", 2.0, "litro")
    encontrado = obter_ingrediente_por_id(ing.id)
    assert encontrado is not None
    assert encontrado.nome == "Leite"


def test_obter_ingrediente_inexistente():
    """Deve retornar None para id inexistente."""
    assert obter_ingrediente_por_id(9999) is None


def test_atualizar_estoque():
    """Deve atualizar a quantidade do ingrediente no banco."""
    ing = cadastrar_ingrediente("Sal", 1.0, "kg")
    sucesso = atualizar_estoque(ing.id, 3.5)
    assert sucesso is True
    atualizado = obter_ingrediente_por_id(ing.id)
    assert atualizado.quantidade == 3.5


def test_atualizar_estoque_quantidade_negativa():
    """Deve lançar ValueError para quantidade negativa."""
    ing = cadastrar_ingrediente("Pimenta", 0.5, "g")
    with pytest.raises(ValueError):
        atualizar_estoque(ing.id, -1.0)


def test_excluir_ingrediente():
    """Deve remover o ingrediente do banco e retornar True."""
    ing = cadastrar_ingrediente("Azeite", 1.0, "litro")
    sucesso = excluir_ingrediente(ing.id)
    assert sucesso is True
    assert obter_ingrediente_por_id(ing.id) is None


def test_cadastrar_nome_vazio_levanta_erro():
    """Deve lançar ValueError ao tentar cadastrar ingrediente sem nome."""
    with pytest.raises(ValueError):
        cadastrar_ingrediente("", 1.0, "kg")


def test_cadastrar_unidade_invalida_levanta_erro():
    """Deve lançar ValueError para unidade de medida inválida."""
    with pytest.raises(ValueError):
        cadastrar_ingrediente("Açúcar", 1.0, "caixa")
