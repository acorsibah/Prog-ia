"""Modelo de dados para a entidade Ingrediente (estoque de insumos)."""

from dataclasses import dataclass, field
from typing import Literal

# Unidades de medida aceitas pelo banco de dados
UnidadeMedida = Literal["kg", "g", "ml", "litro", "unidade"]


@dataclass
class Ingrediente:
    """Representa um ingrediente disponível no estoque do restaurante."""

    # Identificador único gerado pelo banco (None antes de persistir)
    id: int | None
    nome: str
    quantidade: float
    unidade_medida: UnidadeMedida
    created_at: str = field(default="")

    def __post_init__(self) -> None:
        """Valida os campos obrigatórios após a inicialização."""
        if not self.nome or not self.nome.strip():
            raise ValueError("Nome do ingrediente não pode ser vazio.")
        if self.quantidade < 0:
            raise ValueError("Quantidade não pode ser negativa.")
        unidades_validas = {"kg", "g", "ml", "litro", "unidade"}
        if self.unidade_medida not in unidades_validas:
            raise ValueError(f"Unidade de medida inválida: {self.unidade_medida}.")
