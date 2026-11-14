"""Servico central de gestao e ciclo de vida de pedidos."""

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional
from src.config.database import obter_conexao
from src.models.item_pedido import ItemPedido
from src.models.pedido import Pedido
from src.services.auditoria_service import auditoria_service
from src.services.cardapio_service import CardapioService
from src.services.mesas_service import MesasService


@dataclass
class ResumoConta:
    """Estrutura com a memoria de calculo do fechamento de mesa."""
    pedido_id: int
    mesa_numero: int
    itens: List[Dict]
    subtotal: float
    taxa_servico: float
    total_com_taxa: float
    total_sem_taxa: float


class PedidosService:
    """Responsavel pelas regras de negocio e persistencia dos pedidos."""

    def __init__(self, db_path: Optional[Path] = None) -> None:
        self.db_path = db_path
        self.mesas_svc = MesasService(db_path)
        self.cardapio_svc = CardapioService(db_path)

    def abrir_pedido(self, mesa_numero: int, itens_data: List[Dict], autor: str = "SISTEMA") -> int:
        """Abre uma nova comanda para uma mesa validada."""
        mesa = self.mesas_svc.obter_por_numero(mesa_numero)
        if not mesa:
            raise ValueError(f"Mesa {mesa_numero} nao foi encontrada no sistema.")
        total, itens_validados = self._validar_itens(itens_data)
        pedido_id = self._persistir_novo_pedido(mesa.id, total, itens_validados)
        auditoria_service.registrar(
            agente=autor,
            acao="abrir_pedido",
            detalhes=f"Pedido #{pedido_id} para Mesa {mesa_numero}. Total: R$ {total:.2f}"
        )
        return pedido_id

    def _persistir_novo_pedido(self, mesa_id: int, total: float, itens: List[Dict]) -> int:
        """Insere o pedido e seus itens no banco atualizando o status da mesa."""
        with obter_conexao(self.db_path) as conexao:
            cursor = conexao.execute(
                "INSERT INTO pedidos (mesa_id, status, valor_total) VALUES (?, 'RECEBIDO', ?)",
                (mesa_id, total)
            )
            pedido_id = cursor.lastrowid
            self._gravar_itens(conexao, pedido_id, itens)
            conexao.execute("UPDATE mesas SET status = 'OCUPADA' WHERE id = ?", (mesa_id,))
            return pedido_id

    def _validar_itens(self, itens_data: List[Dict]) -> tuple[float, List[Dict]]:
        """Valida se os itens existem no cardapio e estao disponiveis."""
        total, validados = 0.0, []
        for item in itens_data:
            prod = self.cardapio_svc.obter_por_codigo(item["codigo"])
            if not prod or not prod.disponivel:
                raise ValueError(f"Item {item.get('codigo')} indisponivel ou inexistente.")
            qtd = int(item.get("quantidade", 1))
            total += prod.preco * qtd
            validados.append({
                "item_cardapio_id": prod.id, "quantidade": qtd,
                "preco_unitario": prod.preco, "observacao": item.get("observacao", "")
            })
        return round(total, 2), validados

    def _gravar_itens(self, conexao, pedido_id: int, itens: List[Dict]) -> None:
        """Insere os itens validados na tabela itens_pedido."""
        sql = """INSERT INTO itens_pedido 
                 (pedido_id, item_cardapio_id, quantidade, preco_unitario, observacao)
                 VALUES (?, ?, ?, ?, ?)"""
        for item in itens:
            conexao.execute(
                sql,
                (pedido_id, item["item_cardapio_id"], item["quantidade"],
                 item["preco_unitario"], item["observacao"])
            )

    def listar_ativos(self) -> List[Pedido]:
        """Lista todos os pedidos com status diferente de PAGO e CANCELADO."""
        sql = """SELECT p.id, p.mesa_id, p.data_hora, p.status, p.valor_total, m.numero as mesa_numero
                 FROM pedidos p JOIN mesas m ON p.mesa_id = m.id
                 WHERE p.status NOT IN ('PAGO', 'CANCELADO')
                 ORDER BY p.data_hora ASC"""
        with obter_conexao(self.db_path) as conexao:
            linhas = conexao.execute(sql).fetchall()
            return [self._carregar_pedido_completo(conexao, linha) for linha in linhas]

    def _carregar_pedido_completo(self, conexao, linha) -> Pedido:
        """Monta o objeto Pedido preenchendo seus itens associados."""
        pedido_id = linha["id"]
        sql_itens = """SELECT ip.id, ip.pedido_id, ip.item_cardapio_id, ip.quantidade,
                              ip.preco_unitario, ip.observacao, c.codigo, c.nome
                       FROM itens_pedido ip JOIN cardapio c ON ip.item_cardapio_id = c.id
                       WHERE ip.pedido_id = ?"""
        itens_rows = conexao.execute(sql_itens, (pedido_id,)).fetchall()
        itens = [ItemPedido(**dict(r)) for r in itens_rows]
        return Pedido(
            id=linha["id"], mesa_id=linha["mesa_id"], data_hora=linha["data_hora"],
            status=linha["status"], valor_total=linha["valor_total"],
            mesa_numero=linha["mesa_numero"], itens=itens
        )

    def obter_pedido_por_mesa(self, mesa_numero: int) -> Optional[Pedido]:
        """Obtem o pedido ativo de uma determinada mesa."""
        sql = """SELECT p.id, p.mesa_id, p.data_hora, p.status, p.valor_total, m.numero as mesa_numero
                 FROM pedidos p JOIN mesas m ON p.mesa_id = m.id
                 WHERE m.numero = ? AND p.status NOT IN ('PAGO', 'CANCELADO')
                 ORDER BY p.id DESC LIMIT 1"""
        with obter_conexao(self.db_path) as conexao:
            linha = conexao.execute(sql, (mesa_numero,)).fetchone()
            return self._carregar_pedido_completo(conexao, linha) if linha else None

    def atualizar_status(self, pedido_id: int, novo_status: str, autor: str = "SISTEMA") -> bool:
        """Atualiza a etapa de producao ou cancelamento do pedido."""
        status_validos = ["RECEBIDO", "PREPARANDO", "PRONTO", "ENTREGUE", "PAGO", "CANCELADO"]
        status_norm = novo_status.upper().strip()
        if status_norm not in status_validos:
            raise ValueError(f"Status invalido: {novo_status}")

        sql = "UPDATE pedidos SET status = ? WHERE id = ?"
        with obter_conexao(self.db_path) as conexao:
            cursor = conexao.execute(sql, (status_norm, pedido_id))
            sucesso = cursor.rowcount > 0

        if sucesso:
            auditoria_service.registrar(
                agente=autor, acao="atualizar_status",
                detalhes=f"Pedido #{pedido_id} transicionado para {status_norm}"
            )
        return sucesso

    def _extrair_discriminacao_itens(self, itens: List[ItemPedido]) -> tuple[List[Dict], float]:
        """Extrai os dados e calcula o subtotal para memoria de calculo."""
        itens_disc, subtotal = [], 0.0
        for item in itens:
            st = item.subtotal
            subtotal += st
            itens_disc.append({
                "codigo": item.codigo, "nome": item.nome, "quantidade": item.quantidade,
                "preco_unitario": item.preco_unitario, "subtotal": st, "observacao": item.observacao or ""
            })
        return itens_disc, round(subtotal, 2)

    def calcular_fechamento_mesa(self, mesa_numero: int) -> ResumoConta:
        """Calcula o extrato e a memoria de calculo discriminada da comanda."""
        pedido = self.obter_pedido_por_mesa(mesa_numero)
        if not pedido:
            raise ValueError(f"Nenhum pedido ativo para a Mesa {mesa_numero}.")
        itens_disc, subtotal = self._extrair_discriminacao_itens(pedido.itens)
        taxa = round(subtotal * 0.10, 2)
        return ResumoConta(
            pedido_id=pedido.id, mesa_numero=mesa_numero, itens=itens_disc,
            subtotal=subtotal, taxa_servico=taxa,
            total_com_taxa=round(subtotal + taxa, 2), total_sem_taxa=subtotal
        )

    def liquidar_conta(self, pedido_id: int, mesa_numero: int, valor_final: float, autor: str = "SISTEMA") -> bool:
        """Liquida a conta em transacao atomica: marca PAGO e libera a mesa."""
        with obter_conexao(self.db_path) as conexao:
            conexao.execute("BEGIN TRANSACTION;")
            conexao.execute("UPDATE pedidos SET status = 'PAGO', valor_total = ? WHERE id = ?", (valor_final, pedido_id))
            conexao.execute("UPDATE mesas SET status = 'LIVRE' WHERE numero = ?", (mesa_numero,))
            conexao.execute("COMMIT;")

        auditoria_service.registrar(
            agente=autor, acao="liquidar_conta",
            detalhes=f"Pedido #{pedido_id} Mesa {mesa_numero} PAGO R$ {valor_final:.2f}."
        )
        return True


# Instancia padrao do servico de pedidos
pedidos_service = PedidosService()
