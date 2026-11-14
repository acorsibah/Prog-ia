"""Servico de gerenciamento do estoque de ingredientes."""

from typing import List, Optional

from src.config.database import obter_conexao
from src.models.ingrediente import Ingrediente


def listar_ingredientes() -> List[Ingrediente]:
    """Retorna todos os ingredientes cadastrados no estoque."""
    sql = "SELECT id, nome, quantidade, unidade_medida, created_at FROM ingredientes ORDER BY nome"
    with obter_conexao() as con:
        linhas = con.execute(sql).fetchall()
    return [Ingrediente(*linha) for linha in linhas]


def obter_ingrediente_por_id(ingrediente_id: int) -> Optional[Ingrediente]:
    """Busca um ingrediente pelo seu identificador único."""
    sql = "SELECT id, nome, quantidade, unidade_medida, created_at FROM ingredientes WHERE id = ?"
    with obter_conexao() as con:
        linha = con.execute(sql, (ingrediente_id,)).fetchone()
    return Ingrediente(*linha) if linha else None


def cadastrar_ingrediente(nome: str, quantidade: float, unidade_medida: str) -> Ingrediente:
    """Insere um novo ingrediente no estoque e retorna o objeto criado."""
    # Valida via modelo antes de persistir
    novo = Ingrediente(id=None, nome=nome, quantidade=quantidade, unidade_medida=unidade_medida)
    sql = "INSERT INTO ingredientes (nome, quantidade, unidade_medida) VALUES (?, ?, ?)"
    with obter_conexao() as con:
        cursor = con.execute(sql, (novo.nome, novo.quantidade, novo.unidade_medida))
        con.commit()
        novo.id = cursor.lastrowid
    return novo


def atualizar_estoque(ingrediente_id: int, nova_quantidade: float) -> bool:
    """Atualiza a quantidade disponível de um ingrediente no estoque."""
    if nova_quantidade < 0:
        raise ValueError("Quantidade não pode ser negativa.")
    sql = "UPDATE ingredientes SET quantidade = ? WHERE id = ?"
    with obter_conexao() as con:
        cursor = con.execute(sql, (nova_quantidade, ingrediente_id))
        con.commit()
    return cursor.rowcount > 0


def excluir_ingrediente(ingrediente_id: int) -> bool:
    """Remove um ingrediente do estoque (apenas se não vinculado a receitas)."""
    sql = "DELETE FROM ingredientes WHERE id = ?"
    with obter_conexao() as con:
        cursor = con.execute(sql, (ingrediente_id,))
        con.commit()
    return cursor.rowcount > 0


# Instância singleton exportada para uso nas views
ingredientes_service = {
    "listar": listar_ingredientes,
    "obter": obter_ingrediente_por_id,
    "cadastrar": cadastrar_ingrediente,
    "atualizar_estoque": atualizar_estoque,
    "excluir": excluir_ingrediente,
}
