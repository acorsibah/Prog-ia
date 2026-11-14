"""Testes para o servico de gerenciamento de receitas."""

import pytest
from src.config.database import inicializar_banco
from src.services.ingredientes_service import cadastrar_ingrediente
from src.services.receitas_service import (
    cadastrar_receita,
    desvincular_ingrediente,
    excluir_receita,
    listar_ingredientes_da_receita,
    listar_receitas,
    obter_receita_por_id,
    vincular_ingrediente,
)


@pytest.fixture(autouse=True)
def banco_limpo(tmp_path, monkeypatch):
    """Inicializa banco de dados temporario para cada teste."""
    db_temp = str(tmp_path / "test_receitas.sqlite")
    monkeypatch.setenv("DB_PATH", db_temp)
    import src.config.settings as s
    s._instancia = None
    inicializar_banco()
    yield
    s._instancia = None


def test_listar_receitas_vazio():
    """Deve retornar lista vazia quando nenhuma receita for cadastrada."""
    assert listar_receitas() == []


def test_cadastrar_receita():
    """Deve cadastrar uma receita e retornar com id preenchido."""
    rec = cadastrar_receita("Hambúrguer Artesanal", "Grelhe o pão e a carne.", 10, "Clássico da pista")
    assert rec.id is not None
    assert rec.nome == "Hambúrguer Artesanal"
    assert rec.tempo_preparo == 10


def test_obter_receita_por_id():
    """Deve retornar a receita correta pelo id."""
    rec = cadastrar_receita("Hot Dog Street", "Cozinhe o cachorro.", 5)
    encontrada = obter_receita_por_id(rec.id)
    assert encontrada is not None
    assert encontrada.nome == "Hot Dog Street"


def test_obter_receita_inexistente():
    """Deve retornar None para id inexistente."""
    assert obter_receita_por_id(9999) is None


def test_vincular_ingrediente():
    """Deve vincular um ingrediente a uma receita sem erros."""
    rec = cadastrar_receita("Milkshake", "Bata tudo no liquidificador.", 3)
    ing = cadastrar_ingrediente("Leite", 5.0, "litro")
    resultado = vincular_ingrediente(rec.id, ing.id, 0.3, "litro")
    assert resultado is True
    ings = listar_ingredientes_da_receita(rec.id)
    assert len(ings) == 1
    assert ings[0].nome == "Leite"


def test_desvincular_ingrediente():
    """Deve remover o vínculo ingrediente-receita."""
    rec = cadastrar_receita("Batata Frita", "Frite em óleo quente.", 8)
    ing = cadastrar_ingrediente("Batata", 2.0, "kg")
    vincular_ingrediente(rec.id, ing.id, 0.3, "kg")
    sucesso = desvincular_ingrediente(rec.id, ing.id)
    assert sucesso is True
    assert listar_ingredientes_da_receita(rec.id) == []


def test_excluir_receita():
    """Deve remover a receita e seus vínculos (CASCADE)."""
    rec = cadastrar_receita("Suco Natural", "Bata e coe.", 2)
    ing = cadastrar_ingrediente("Laranja", 10.0, "unidade")
    vincular_ingrediente(rec.id, ing.id, 3.0, "unidade")
    sucesso = excluir_receita(rec.id)
    assert sucesso is True
    assert obter_receita_por_id(rec.id) is None
    assert listar_ingredientes_da_receita(rec.id) == []


def test_cadastrar_receita_nome_vazio_levanta_erro():
    """Deve lançar ValueError ao tentar cadastrar receita sem nome."""
    with pytest.raises(ValueError):
        cadastrar_receita("", "Modo de preparo.", 5)


def test_cadastrar_receita_modo_vazio_levanta_erro():
    """Deve lançar ValueError ao tentar cadastrar receita sem modo de preparo."""
    with pytest.raises(ValueError):
        cadastrar_receita("Pão na Chapa", "", 3)


def test_vincular_quantidade_zero_levanta_erro():
    """Deve lançar ValueError ao vincular ingrediente com quantidade zero."""
    rec = cadastrar_receita("Tapioca", "Aqueça a frigideira.", 5)
    ing = cadastrar_ingrediente("Goma", 1.0, "kg")
    with pytest.raises(ValueError):
        vincular_ingrediente(rec.id, ing.id, 0.0, "kg")
