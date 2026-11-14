"""Modulo de varredura estatica de qualidade e conformidade (QA)."""

import ast
from pathlib import Path
from typing import Dict, List


def verificar_tamanho_funcoes(arquivo: Path) -> List[str]:
    """Valida se alguma funcao do arquivo excede o limite de 20 linhas."""
    violacoes = []
    conteudo = arquivo.read_text(encoding="utf-8")
    arvore = ast.parse(conteudo)
    for nodo in ast.walk(arvore):
        if isinstance(nodo, (ast.FunctionDef, ast.AsyncFunctionDef)):
            linhas = (nodo.end_lineno or nodo.lineno) - nodo.lineno + 1
            if linhas > 20:
                violacoes.append(f"{arquivo.name}:{nodo.name} ({linhas} linhas)")
    return violacoes


def verificar_sql_parametrizado(arquivo: Path) -> List[str]:
    """Inspeciona strings SQL garantindo que nao usem interpolacao perigosa."""
    violacoes = []
    linhas = arquivo.read_text(encoding="utf-8").splitlines()
    for idx, linha in enumerate(linhas, start=1):
        l_upper = linha.upper()
        if any(verbo in l_upper for verbo in ["SELECT", "INSERT", "UPDATE", "DELETE"]):
            if "F\"" in linha or "F'" in linha:
                violacoes.append(f"{arquivo.name}:{idx} (Possível f-string em query SQL)")
    return violacoes


def executar_varredura(diretorio: Path) -> Dict[str, List[str]]:
    """Executa a varredura completa em todos os arquivos Python do diretorio."""
    relatorio = {"funcoes_longas": [], "sql_vulneravel": []}
    for arquivo in diretorio.glob("**/*.py"):
        relatorio["funcoes_longas"].extend(verificar_tamanho_funcoes(arquivo))
        relatorio["sql_vulneravel"].extend(verificar_sql_parametrizado(arquivo))
    return relatorio
