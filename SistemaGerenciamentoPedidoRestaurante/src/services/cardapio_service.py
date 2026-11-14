"""Servico de gestao e consulta do cardapio do restaurante."""

from pathlib import Path
from typing import List, Optional
from src.config.database import obter_conexao
from src.models.item_cardapio import ItemCardapio


class CardapioService:
    """Responsavel pelas regras de negocio e persistencia do cardapio."""

    def __init__(self, db_path: Optional[Path] = None) -> None:
        self.db_path = db_path

    def listar_todos(self) -> List[ItemCardapio]:
        """Recupera todos os itens cadastrados no cardapio."""
        sql = "SELECT id, codigo, nome, categoria, preco, disponivel FROM cardapio ORDER BY categoria, nome"
        with obter_conexao(self.db_path) as conexao:
            linhas = conexao.execute(sql).fetchall()
            return [
                ItemCardapio(
                    id=linha["id"],
                    codigo=linha["codigo"],
                    nome=linha["nome"],
                    categoria=linha["categoria"],
                    preco=linha["preco"],
                    disponivel=bool(linha["disponivel"]),
                )
                for linha in linhas
            ]

    def listar_disponiveis(self) -> List[ItemCardapio]:
        """Recupera apenas os itens marcados como disponiveis (disponivel = 1)."""
        sql = "SELECT id, codigo, nome, categoria, preco, disponivel FROM cardapio WHERE disponivel = 1 ORDER BY nome"
        with obter_conexao(self.db_path) as conexao:
            linhas = conexao.execute(sql).fetchall()
            return [
                ItemCardapio(
                    id=linha["id"],
                    codigo=linha["codigo"],
                    nome=linha["nome"],
                    categoria=linha["categoria"],
                    preco=linha["preco"],
                    disponivel=True,
                )
                for linha in linhas
            ]

    def obter_por_codigo(self, codigo: str) -> Optional[ItemCardapio]:
        """Localiza um item especifico do cardapio atraves do codigo."""
        sql = "SELECT id, codigo, nome, categoria, preco, disponivel FROM cardapio WHERE codigo = ?"
        with obter_conexao(self.db_path) as conexao:
            linha = conexao.execute(sql, (codigo.upper().strip(),)).fetchone()
            if not linha:
                return None
            return ItemCardapio(
                id=linha["id"],
                codigo=linha["codigo"],
                nome=linha["nome"],
                categoria=linha["categoria"],
                preco=linha["preco"],
                disponivel=bool(linha["disponivel"]),
            )

    def alternar_disponibilidade(self, item_id: int) -> bool:
        """Inverte o status de disponibilidade do prato ou bebida."""
        sql = "UPDATE cardapio SET disponivel = CASE WHEN disponivel = 1 THEN 0 ELSE 1 END WHERE id = ?"
        with obter_conexao(self.db_path) as conexao:
            cursor = conexao.execute(sql, (item_id,))
            return cursor.rowcount > 0

    def cadastrar_item(self, codigo: str, nome: str, categoria: str, preco: float, disponivel: bool = True) -> int:
        """Insere um novo item no cardapio."""
        sql = """INSERT INTO cardapio (codigo, nome, categoria, preco, disponivel)
                 VALUES (?, ?, ?, ?, ?)"""
        with obter_conexao(self.db_path) as conexao:
            cursor = conexao.execute(
                sql,
                (codigo.upper().strip(), nome.strip(), categoria.strip(), preco, 1 if disponivel else 0),
            )
            return cursor.lastrowid


# Instancia padrao do servico de cardapio
cardapio_service = CardapioService()
