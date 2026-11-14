"""Modulo de configuracoes e carregamento de variaveis de ambiente."""

from dataclasses import dataclass
import os
from pathlib import Path


def _carregar_env(caminho_env: Path) -> None:
    """Carrega variaveis de um arquivo .env simples sem expor segredos."""
    if not caminho_env.exists():
        return
    for linha in caminho_env.read_text(encoding="utf-8").splitlines():
        linha = linha.strip()
        if not linha or linha.startswith("#") or "=" not in linha:
            continue
        chave, valor = linha.split("=", 1)
        os.environ.setdefault(chave.strip(), valor.strip())


@dataclass(frozen=True)
class Settings:
    """Configuracoes imutaveis do sistema GastroFlow."""
    caminho_raiz: Path = Path(__file__).resolve().parent.parent.parent
    caminho_env: Path = caminho_raiz / ".env"

    def __post_init__(self) -> None:
        _carregar_env(self.caminho_env)

    @property
    def db_path(self) -> Path:
        """Retorna o caminho resolvido para o banco SQLite."""
        caminho_str = os.getenv("DB_PATH", "src/database/restaurante.sqlite")
        return (self.caminho_raiz / caminho_str).resolve()

    @property
    def audit_log_path(self) -> Path:
        """Retorna o caminho para o arquivo de log de auditoria."""
        return (self.caminho_raiz / ".antigravity/logs/audit.log").resolve()

    @property
    def app_env(self) -> str:
        """Ambiente de execucao (development, testing, production)."""
        return os.getenv("APP_ENV", "development")

    @property
    def port(self) -> int:
        """Porta padrao de execucao do servico."""
        return int(os.getenv("PORT", "8501"))


# Instancia singleton para as configuracoes da aplicacao
settings = Settings()
