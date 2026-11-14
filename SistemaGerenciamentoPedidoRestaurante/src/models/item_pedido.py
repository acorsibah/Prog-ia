"""Modelo de entidade para Item de Pedido."""

from dataclasses import dataclass
from typing import Optional


@dataclass
class ItemPedido:
    """Entidade representativa de um item associado a uma comanda."""
    id: Optional[int]
    pedido_id: int
    item_cardapio_id: int
    quantidade: int
    preco_unitario: float
    observacao: Optional[str] = None
    codigo: Optional[str] = None
    nome: Optional[str] = None

    @property
    def subtotal(self) -> float:
        """Calcula o valor total do item com base na quantidade."""
        return round(self.quantidade * self.preco_unitario, 2)
