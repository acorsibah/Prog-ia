"""Servico de gerenciamento de receitas e seus ingredientes."""

from typing import List, Optional

from src.config.database import obter_conexao
from src.models.receita import IngredienteReceita, Receita


def listar_receitas() -> List[Receita]:
    """Retorna todas as receitas cadastradas, sem carregar ingredientes."""
    sql = "SELECT id, nome, descricao, modo_preparo, tempo_preparo, created_at FROM receitas ORDER BY nome"
    with obter_conexao() as con:
        linhas = con.execute(sql).fetchall()
    return [Receita(id=r[0], nome=r[1], descricao=r[2] or "", modo_preparo=r[3],
                    tempo_preparo=r[4], created_at=r[5]) for r in linhas]


def obter_receita_por_id(receita_id: int) -> Optional[Receita]:
    """Busca uma receita completa (com ingredientes) pelo seu id."""
    sql = "SELECT id, nome, descricao, modo_preparo, tempo_preparo, created_at FROM receitas WHERE id = ?"
    with obter_conexao() as con:
        linha = con.execute(sql, (receita_id,)).fetchone()
    if not linha:
        return None
    receita = Receita(id=linha[0], nome=linha[1], descricao=linha[2] or "",
                      modo_preparo=linha[3], tempo_preparo=linha[4], created_at=linha[5])
    receita.ingredientes = listar_ingredientes_da_receita(receita_id)
    return receita


def cadastrar_receita(nome: str, modo_preparo: str, tempo_preparo: int,
                      descricao: str = "") -> Receita:
    """Insere uma nova receita no banco e retorna o objeto criado."""
    # Valida via modelo antes de persistir
    nova = Receita(id=None, nome=nome, descricao=descricao,
                   modo_preparo=modo_preparo, tempo_preparo=tempo_preparo)
    sql = "INSERT INTO receitas (nome, descricao, modo_preparo, tempo_preparo) VALUES (?, ?, ?, ?)"
    with obter_conexao() as con:
        cursor = con.execute(sql, (nova.nome, nova.descricao, nova.modo_preparo, nova.tempo_preparo))
        con.commit()
        nova.id = cursor.lastrowid
    return nova


def vincular_ingrediente(receita_id: int, ingrediente_id: int,
                         quantidade_necessaria: float, unidade_medida: str) -> bool:
    """Associa um ingrediente a uma receita com quantidade e unidade."""
    if quantidade_necessaria <= 0:
        raise ValueError("Quantidade necessária deve ser maior que zero.")
    sql = """INSERT INTO receitas_ingredientes
             (receita_id, ingrediente_id, quantidade_necessaria, unidade_medida)
             VALUES (?, ?, ?, ?)"""
    with obter_conexao() as con:
        con.execute(sql, (receita_id, ingrediente_id, quantidade_necessaria, unidade_medida))
        con.commit()
    return True


def listar_ingredientes_da_receita(receita_id: int) -> List[IngredienteReceita]:
    """Retorna todos os ingredientes vinculados a uma receita específica."""
    sql = """SELECT ri.ingrediente_id, i.nome, ri.quantidade_necessaria, ri.unidade_medida
             FROM receitas_ingredientes ri
             JOIN ingredientes i ON i.id = ri.ingrediente_id
             WHERE ri.receita_id = ?
             ORDER BY i.nome"""
    with obter_conexao() as con:
        linhas = con.execute(sql, (receita_id,)).fetchall()
    return [IngredienteReceita(*linha) for linha in linhas]


def desvincular_ingrediente(receita_id: int, ingrediente_id: int) -> bool:
    """Remove a associação entre um ingrediente e uma receita."""
    sql = "DELETE FROM receitas_ingredientes WHERE receita_id = ? AND ingrediente_id = ?"
    with obter_conexao() as con:
        cursor = con.execute(sql, (receita_id, ingrediente_id))
        con.commit()
    return cursor.rowcount > 0


def excluir_receita(receita_id: int) -> bool:
    """Remove uma receita e seus vínculos de ingredientes (CASCADE)."""
    sql = "DELETE FROM receitas WHERE id = ?"
    with obter_conexao() as con:
        cursor = con.execute(sql, (receita_id,))
        con.commit()
    return cursor.rowcount > 0


# Instância singleton exportada para uso nas views
receitas_service = {
    "listar": listar_receitas,
    "obter": obter_receita_por_id,
    "cadastrar": cadastrar_receita,
    "vincular_ingrediente": vincular_ingrediente,
    "listar_ingredientes": listar_ingredientes_da_receita,
    "desvincular_ingrediente": desvincular_ingrediente,
    "excluir": excluir_receita,
}
