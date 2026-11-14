"""Servico de intermediacao com agentes Antigravity e fallback local."""

from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from src.config.settings import settings
from src.services.pedidos_service import ResumoConta, pedidos_service


@dataclass
class ResultadoAgente:
    """Resultado estruturado da execucao de um agente ou servico equivalente."""
    nome_agente: str
    modo_execucao: str
    mensagem: str
    sucesso: bool
    dados: Optional[Any] = None


class AgentesService:
    """Coordena as chamadas para os agentes Antigravity ou rotinas locais."""

    def __init__(self, raiz_antigravity: Optional[Path] = None) -> None:
        self.raiz = raiz_antigravity or (settings.caminho_raiz / ".antigravity")

    def verificar_disponibilidade_mcp(self) -> bool:
        """Verifica se os arquivos e configuracoes do MCP estao presentes."""
        config_mcp = self.raiz / "config.json"
        return config_mcp.exists()

    def obter_especificacao_agente(self, nome: str) -> Optional[Dict]:
        """Le o arquivo json de especificacao do agente se existir."""
        caminho = self.raiz / "agents" / f"{nome}.json"
        if not caminho.exists():
            return None
        return json.loads(caminho.read_text(encoding="utf-8"))

    def executar_maitre(self, mesa_numero: int, itens: List[Dict]) -> ResultadoAgente:
        """Executa a rotina do Agente Maitre para validacao e abertura."""
        modo = "LOCAL_EQUIVALENTE"
        msg = "Agente Maitre (Serviço Local Equivalente executado com validação de mesa e cardápio)."
        try:
            pedido_id = pedidos_service.abrir_pedido(mesa_numero, itens, autor="AgenteMaitre")
            return ResultadoAgente("AgenteMaitre", modo, f"{msg} Pedido #{pedido_id} criado.", True, {"pedido_id": pedido_id})
        except Exception as e:
            return ResultadoAgente("AgenteMaitre", modo, f"Erro na operação do Maitre: {e}", False)

    def executar_chef_consultar(self) -> ResultadoAgente:
        """Executa a rotina do Agente Chef para consulta da fila da cozinha."""
        modo = "LOCAL_EQUIVALENTE"
        msg = "Agente Chef (Serviço Local Equivalente - Fila KDS filtrada por pedidos pendentes)."
        try:
            pedidos_ativos = pedidos_service.listar_ativos()
            fila = [p for p in pedidos_ativos if p.status in ("RECEBIDO", "PREPARANDO")]
            return ResultadoAgente("AgenteChef", modo, msg, True, fila)
        except Exception as e:
            return ResultadoAgente("AgenteChef", modo, f"Erro na consulta do Chef: {e}", False)

    def executar_chef_atualizar(self, pedido_id: int, novo_status: str) -> ResultadoAgente:
        """Executa a atualizacao de preparo do Agente Chef."""
        modo = "LOCAL_EQUIVALENTE"
        try:
            pedidos_service.atualizar_status(pedido_id, novo_status, autor="AgenteChef")
            return ResultadoAgente("AgenteChef", modo, f"Pedido #{pedido_id} atualizado para '{novo_status}'.", True)
        except Exception as e:
            return ResultadoAgente("AgenteChef", modo, f"Erro ao atualizar pelo Chef: {e}", False)

    def executar_caixa_fechamento(self, mesa_numero: int) -> ResultadoAgente:
        """Executa a memoria de calculo do Agente Caixa."""
        modo = "LOCAL_EQUIVALENTE"
        try:
            resumo: ResumoConta = pedidos_service.calcular_fechamento_mesa(mesa_numero)
            return ResultadoAgente("AgenteCaixa", modo, "Memória de cálculo gerada com sucesso.", True, resumo)
        except Exception as e:
            return ResultadoAgente("AgenteCaixa", modo, f"Erro ao calcular conta: {e}", False)

    def executar_caixa_liquidar(self, pedido_id: int, mesa_numero: int, valor: float) -> ResultadoAgente:
        """Executa a liquidacao e liberacao da mesa pelo Agente Caixa."""
        modo = "LOCAL_EQUIVALENTE"
        try:
            pedidos_service.liquidar_conta(pedido_id, mesa_numero, valor, autor="AgenteCaixa")
            return ResultadoAgente("AgenteCaixa", modo, f"Conta liquidada e Mesa {mesa_numero} liberada.", True)
        except Exception as e:
            return ResultadoAgente("AgenteCaixa", modo, f"Erro ao liquidar conta: {e}", False)


# Instancia padrao do servico de agentes
agentes_service = AgentesService()
