"""Modelo de dados para a entidade Receita (fichas técnicas do restaurante)."""

from dataclasses import dataclass, field
from typing import List


@dataclass
class IngredienteReceita:
    """Representa um ingrediente vinculado a uma receita com sua quantidade."""

    # Identificador do ingrediente no estoque
    ingrediente_id: int
    nome: str
    quantidade_necessaria: float
    unidade_medida: str


@dataclass
class Receita:
    """Representa uma receita com seus ingredientes e modo de preparo."""

    # Identificador único gerado pelo banco (None antes de persistir)
    id: int | None
    nome: str
    modo_preparo: str
    # Tempo estimado de preparo em minutos
    tempo_preparo: int
    descricao: str = field(default="")
    created_at: str = field(default="")
    # Lista de ingredientes vinculados (carregada sob demanda)
    ingredientes: List[IngredienteReceita] = field(default_factory=list)

    def __post_init__(self) -> None:
        """Valida os campos obrigatórios após a inicialização."""
        if not self.nome or not self.nome.strip():
            raise ValueError("Nome da receita não pode ser vazio.")
        if not self.modo_preparo or not self.modo_preparo.strip():
            raise ValueError("Modo de preparo não pode ser vazio.")
        if self.tempo_preparo <= 0:
            raise ValueError("Tempo de preparo deve ser maior que zero.")
