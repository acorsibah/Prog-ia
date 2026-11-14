"""Servico de auditoria e registro de operacoes sensiveis."""

from datetime import datetime
from pathlib import Path
from typing import List
from src.config.settings import settings


class AuditoriaService:
    """Responsavel pela persistencia e leitura segura de logs de auditoria."""

    def __init__(self, log_path: Path | None = None) -> None:
        self.log_path = log_path or settings.audit_log_path

    def registrar(self, agente: str, acao: str, detalhes: str, aprovado_por: str = "HUMAN_OPERATOR") -> None:
        """Registra um evento formatado no arquivo de log de auditoria."""
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now().isoformat()
        linha = (
            f"[{timestamp}] [AUDIT] [{aprovado_por}] Agente: {agente} | "
            f"Acao: {acao} | Detalhes: {detalhes}\n"
        )
        with self.log_path.open("a", encoding="utf-8") as f:
            f.write(linha)

    def listar_eventos(self, limite: int = 50) -> List[str]:
        """Recupera os ultimos eventos de auditoria registrados."""
        if not self.log_path.exists():
            return []
        linhas = self.log_path.read_text(encoding="utf-8").splitlines()
        # Retorna os mais recentes primeiro
        return list(reversed(linhas))[:limite]


# Instancia padrao do servico de auditoria
auditoria_service = AuditoriaService()
