"""Modulo para conexao e inicializacao do banco SQLite com tema Patins Street."""

from pathlib import Path
import sqlite3
from src.config.settings import settings

SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


def obter_conexao(db_path: Path | None = None) -> sqlite3.Connection:
    """Cria e retorna uma conexao configurada com integridade referencial."""
    caminho = db_path or settings.db_path
    caminho.parent.mkdir(parents=True, exist_ok=True)
    conexao = sqlite3.connect(caminho, check_same_thread=False)
    conexao.row_factory = sqlite3.Row
    conexao.execute("PRAGMA foreign_keys = ON;")
    return conexao


def inicializar_banco(db_path: Path | None = None) -> None:
    """Aplica o schema relacional se as tabelas nao existirem."""
    script_sql = SCHEMA_PATH.read_text(encoding="utf-8")
    with obter_conexao(db_path) as conexao:
        conexao.executescript(script_sql)
    popular_dados_iniciais(db_path)


def _inserir_mesas_iniciais(conexao: sqlite3.Connection) -> None:
    """Insere as mesas tematicas da pista de patins se estiverem vazias."""
    cursor = conexao.execute("SELECT COUNT(*) AS total FROM mesas")
    if cursor.fetchone()["total"] == 0:
        mesas = [(1, 4, "LIVRE"), (2, 2, "LIVRE"), (3, 6, "LIVRE"),
                 (4, 4, "LIVRE"), (5, 2, "LIVRE"), (6, 8, "LIVRE")]
        sql = "INSERT INTO mesas (numero, capacidade, status) VALUES (?, ?, ?)"
        conexao.executemany(sql, mesas)


def _obter_cardapio_street() -> list[tuple]:
    """Retorna a lista de pratos e lanches no estilo Roller Street Diner."""
    return [
        ("RIS-01", "Risoto de Funghi", "Especiais da Pista", 58.50, 1),
        ("SUC-02", "Suco de Maracujá", "Bebidas Geladas", 14.00, 1),
        ("STR-01", "Grind Smash Burger (Duplo Cheddar)", "Street Burgers", 42.00, 1),
        ("STR-02", "Ollie Bacon Monster (200g BBQ)", "Street Burgers", 46.00, 1),
        ("STR-03", "Half-Pipe Crispy Chicken", "Street Burgers", 38.00, 1),
        ("HOT-01", "Tail-Slide Hot Dog Especial", "Hot Dogs Street", 32.00, 1),
        ("POR-01", "Kickflip Fries (Cheddar & Bacon)", "Porções da Pista", 28.00, 1),
        ("POR-02", "Wheels Onion Rings Crocantes", "Porções da Pista", 26.00, 1),
        ("SHK-01", "Inline Berry Shake (Morango)", "Shakes & Sobremesas", 22.00, 1),
        ("SHK-02", "Skate Choco Shake (Trufado)", "Shakes & Sobremesas", 24.00, 1),
    ]


def _inserir_cardapio_inicial(conexao: sqlite3.Connection) -> None:
    """Insere o cardapio com tema Street Roller Diner."""
    cursor = conexao.execute("SELECT COUNT(*) AS total FROM cardapio")
    if cursor.fetchone()["total"] == 0:
        itens = _obter_cardapio_street()
        sql = """INSERT INTO cardapio
                 (codigo, nome, categoria, preco, disponivel)
                 VALUES (?, ?, ?, ?, ?)"""
        conexao.executemany(sql, itens)


def popular_dados_iniciais(db_path: Path | None = None) -> None:
    """Garante a carga inicial de mesas e itens do cardapio."""
    with obter_conexao(db_path) as conexao:
        _inserir_mesas_iniciais(conexao)
        _inserir_cardapio_inicial(conexao)
