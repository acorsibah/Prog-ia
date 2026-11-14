"""Modelo de entidade para Mesa."""

from dataclasses import dataclass
from typing import Optional


@dataclass
class Mesa:
    """Entidade representativa de uma mesa do restaurante."""
    id: Optional[int]
    numero: int
    capacidade: int
    status: str = "LIVRE"

    def esta_livre(self) -> bool:
        """Verifica se a mesa esta apta para receber novos clientes."""
        return self.status.upper() == "LIVRE"

    def esta_ocupada(self) -> bool:
        """Verifica se a mesa esta com atendimento em andamento."""
        return self.status.upper() == "OCUPADA"
