"""Modelo de entidade para Pedido."""

from dataclasses import dataclass, field
from typing import List, Optional
from src.models.item_pedido import ItemPedido


@dataclass
class Pedido:
    """Entidade representativa de uma comanda/pedido de restaurante."""
    id: Optional[int]
    mesa_id: int
    data_hora: str
    status: str = "RECEBIDO"
    valor_total: float = 0.0
    mesa_numero: Optional[int] = None
    itens: List[ItemPedido] = field(default_factory=list)

    def calcular_subtotal_itens(self) -> float:
        """Calcula a soma de todos os itens associados."""
        return round(sum(i.subtotal for i in self.itens), 2)

    def calcular_taxa_servico(self, percentual: float = 0.10) -> float:
        """Calcula o valor da taxa de servico opcional."""
        return round(self.calcular_subtotal_itens() * percentual, 2)
