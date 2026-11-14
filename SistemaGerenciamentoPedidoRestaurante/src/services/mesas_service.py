"""Servico de gestao e consulta de mesas do restaurante."""

from pathlib import Path
from typing import List, Optional
from src.config.database import obter_conexao
from src.models.mesa import Mesa


class MesasService:
    """Responsavel pelas regras de negocio e persistencia das mesas."""

    def __init__(self, db_path: Optional[Path] = None) -> None:
        self.db_path = db_path

    def listar_todas(self) -> List[Mesa]:
        """Recupera todas as mesas cadastradas ordenadas pelo numero."""
        sql = "SELECT id, numero, capacidade, status FROM mesas ORDER BY numero ASC"
        with obter_conexao(self.db_path) as conexao:
            linhas = conexao.execute(sql).fetchall()
            return [Mesa(**dict(linha)) for linha in linhas]

    def obter_por_numero(self, numero: int) -> Optional[Mesa]:
        """Localiza uma mesa especifica atraves do seu numero."""
        sql = "SELECT id, numero, capacidade, status FROM mesas WHERE numero = ?"
        with obter_conexao(self.db_path) as conexao:
            linha = conexao.execute(sql, (numero,)).fetchone()
            return Mesa(**dict(linha)) if linha else None

    def obter_por_id(self, mesa_id: int) -> Optional[Mesa]:
        """Localiza uma mesa especifica atraves do seu ID interno."""
        sql = "SELECT id, numero, capacidade, status FROM mesas WHERE id = ?"
        with obter_conexao(self.db_path) as conexao:
            linha = conexao.execute(sql, (mesa_id,)).fetchone()
            return Mesa(**dict(linha)) if linha else None

    def atualizar_status(self, mesa_id: int, novo_status: str) -> bool:
        """Altera o status da mesa (LIVRE, OCUPADA, RESERVADA)."""
        sql = "UPDATE mesas SET status = ? WHERE id = ?"
        with obter_conexao(self.db_path) as conexao:
            cursor = conexao.execute(sql, (novo_status.upper(), mesa_id))
            return cursor.rowcount > 0


# Instancia padrao do servico de mesas
mesas_service = MesasService()
