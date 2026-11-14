"""Servico para execucao e auditoria de Skills do Google Antigravity."""

from dataclasses import dataclass
import json
import os
from pathlib import Path
from typing import Dict, List, Optional
import pytest
from src.config.settings import settings


@dataclass
class RelatorioSeguranca:
    """Relatorio consolidado de auditoria de seguranca."""
    status_geral: str
    itens_conformes: List[str]
    alertas: List[str]
    variaveis_detectadas: List[str]


class SkillsService:
    """Responsavel por gerenciar as skills operacionais e de seguranca."""

    def __init__(self, raiz: Optional[Path] = None) -> None:
        self.raiz = raiz or settings.caminho_raiz
        self.pasta_skills = self.raiz / ".antigravity/skills"

    def obter_especificacao(self, nome_skill: str) -> Optional[Dict]:
        """Recupera a definicao JSON da skill."""
        caminho = self.pasta_skills / f"{nome_skill}.json"
        if not caminho.exists():
            return None
        return json.loads(caminho.read_text(encoding="utf-8"))

    def listar_testes_previstos(self) -> List[str]:
        """Lista os cenarios e arquivos de teste implementados no projeto."""
        pasta_testes = self.raiz / "tests"
        if not pasta_testes.exists():
            return []
        cenarios = []
        for arquivo in sorted(pasta_testes.glob("test_*.py")):
            cenarios.append(f"Módulo: {arquivo.name}")
        return cenarios

    def executar_testes(self) -> tuple[int, str]:
        """Dispara a execucao da suite de testes pytest de forma programatica."""
        pasta_testes = str(self.raiz / "tests")
        # Executa o pytest diretamente via API Python sem shell arbitrario
        codigo_retorno = pytest.main(["-q", pasta_testes])
        status = "SUCESSO" if codigo_retorno == 0 else "FALHA"
        return codigo_retorno, status

    def auditar_seguranca(self) -> RelatorioSeguranca:
        """Inspeciona configuracoes de seguranca sem vazar segredos."""
        conformes = []
        alertas = []
        variaveis = []

        self._auditar_env(conformes, alertas, variaveis)
        self._auditar_hitl(conformes, alertas)
        self._auditar_logs(conformes, alertas)

        status = "APROVADO" if not alertas else "ATENÇÃO"
        return RelatorioSeguranca(status, conformes, alertas, variaveis)

    def _auditar_env(self, conformes: List[str], alertas: List[str], vars_list: List[str]) -> None:
        """Audita a presenca do arquivo .env sem expor valores confidenciais."""
        caminho_env = self.raiz / ".env"
        if caminho_env.exists():
            conformes.append("Arquivo de ambiente .env localizado e isolado.")
            for chave in ["DB_PATH", "APP_ENV", "PORT"]:
                if os.getenv(chave):
                    vars_list.append(f"{chave} = [CONFIGURADO - VALOR OCULTO]")
                else:
                    alertas.append(f"Variável obrigatória '{chave}' ausente no ambiente.")
        else:
            alertas.append("Arquivo .env ausente (utilizando defaults do sistema).")

    def _auditar_hitl(self, conformes: List[str], alertas: List[str]) -> None:
        """Verifica a ativacao da politica Human-in-the-Loop no config.json."""
        config_path = self.raiz / ".antigravity/config.json"
        if not config_path.exists():
            alertas.append("Arquivo .antigravity/config.json nao encontrado.")
            return

        dados = json.loads(config_path.read_text(encoding="utf-8"))
        hitl = dados.get("security", {}).get("humanInTheLoop", {})
        if hitl.get("enabled"):
            conformes.append("Política Human-in-the-Loop ativa para operações críticas.")
        else:
            alertas.append("Human-in-the-Loop desativado no arquivo de configuração!")

    def _auditar_logs(self, conformes: List[str], alertas: List[str]) -> None:
        """Verifica a integridade do arquivo de log de auditoria."""
        log_path = self.raiz / ".antigravity/logs/audit.log"
        if log_path.exists():
            linhas = log_path.read_text(encoding="utf-8").splitlines()
            conformes.append(f"Log de auditoria ativo com {len(linhas)} registro(s).")
        else:
            alertas.append("Arquivo .antigravity/logs/audit.log ainda não inicializado.")


# Instancia padrao do servico de skills
skills_service = SkillsService()
