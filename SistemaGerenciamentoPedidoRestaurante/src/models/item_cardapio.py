"""Modelo de entidade para Item do Cardapio."""

from dataclasses import dataclass
from typing import Optional


@dataclass
class ItemCardapio:
    """Entidade representativa de um prato ou bebida no cardapio."""
    id: Optional[int]
    codigo: str
    nome: str
    categoria: str
    preco: float
    disponivel: bool = True

    def formatar_preco(self) -> str:
        """Formata o valor monetario para o padrao brasileiro."""
        return f"R$ {self.preco:.2f}".replace(".", ",")
