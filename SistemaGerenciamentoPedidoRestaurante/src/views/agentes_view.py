"""Tela de Interacao com os Agentes no tema Patins Street."""

import streamlit as st
from src.services.agentes_service import agentes_service
from src.services.cardapio_service import cardapio_service
from src.services.mesas_service import mesas_service


def _renderizar_status_mcp() -> None:
    """Exibe o diagnostico de integracao com os agentes da pista e MCP."""
    st.subheader("🤖 Agentes Inteligentes da Pista")
    mcp_ativo = agentes_service.verificar_disponibilidade_mcp()
    if mcp_ativo:
        st.info("Configuração MCP (.antigravity/config.json) ativa. Protocolo Human-in-the-Loop em vigor.")
    else:
        st.warning("Daemon MCP externo não detectado. Operando via Serviço Local Equivalente de pista.")


def _renderizar_bloco_maitre() -> None:
    """Card interativo para o Agente Maître da Pista."""
    st.markdown("### 🛼 @AgenteMaitre (Recepção da Pista)")
    st.caption("Recepciona patinadores, checa spots livres e valida disponibilidade de lanches.")
    mesas_livres = [m for m in mesas_service.listar_todas() if m.status == "LIVRE"]
    if not mesas_livres:
        st.info("Sem spots livres para novos patinadores.")
        return
    mesa_sel = st.selectbox("Spot para o Maître", [m.numero for m in mesas_livres], key="maitre_mesa")
    itens = cardapio_service.listar_disponiveis()
    item_sel = st.selectbox("Lanche Solicitado", [f"{i.codigo} - {i.nome}" for i in itens], key="maitre_item")
    cod = item_sel.split(" - ")[0]
    obs = st.text_input("Observação do Patinador", value="Sem cebola", key="maitre_obs")

    if st.button("Disparar @AgenteMaitre", key="btn_run_maitre"):
        res = agentes_service.executar_maitre(mesa_sel, [{"codigo": cod, "quantidade": 1, "observacao": obs}])
        if res.sucesso:
            st.success(f"[{res.modo_execucao}] {res.mensagem}")
        else:
            st.error(f"[{res.modo_execucao}] {res.mensagem}")


def _renderizar_bloco_chef() -> None:
    """Card interativo para o Agente Chef do Pit Stop."""
    st.markdown("### 🔥 @AgenteChef (Pit Stop Cozinha)")
    st.caption("Monitora a fila KDS de lanches e shakes em ordem cronológica de chegada.")
    if st.button("Consultar Fila do Pit Stop (@AgenteChef)", key="btn_run_chef"):
        res = agentes_service.executar_chef_consultar()
        st.info(f"[{res.modo_execucao}] {res.mensagem}")
        if res.dados:
            for p in res.dados:
                st.write(f"**Comanda #{p.id} — Spot {p.mesa_numero}** (`{p.status}`)")
                for it in p.itens:
                    obs = f" - ⚠️ *{it.observacao}*" if it.observacao else ""
                    st.write(f"  • {it.quantidade}x {it.nome}{obs}")
        else:
            st.write("Nenhum pedido aguardando preparo no Pit Stop.")


def _renderizar_bloco_caixa() -> None:
    """Card interativo para o Agente Caixa de Check-out."""
    st.markdown("### 💰 @AgenteCaixa (Check-out & Conta)")
    st.caption("Calcula a conta do patinador com 10% de serviço e finaliza mediante confirmação.")
    mesas_ocupadas = [m.numero for m in mesas_service.listar_todas() if m.status == "OCUPADA"]
    if not mesas_ocupadas:
        st.info("Nenhum spot com consumo em aberto.")
        return
    mesa_sel = st.selectbox("Spot para Fechamento", mesas_ocupadas, key="caixa_mesa")
    if st.button("Calcular Conta (@AgenteCaixa)", key="btn_run_caixa"):
        res = agentes_service.executar_caixa_fechamento(mesa_sel)
        if res.sucesso:
            st.success(f"[{res.modo_execucao}] {res.mensagem}")
            st.json(res.dados.itens)
            st.write(f"**Subtotal:** R$ {res.dados.subtotal:.2f} | **Com 10%:** R$ {res.dados.total_com_taxa:.2f}")


def renderizar_agentes() -> None:
    """Ponto de entrada para a tela de Agentes no tema Patins Street."""
    st.title("🤖 Centro de Operações dos Agentes de Pista")
    _renderizar_status_mcp()
    st.divider()
    col1, col2, col3 = st.columns(3)
    with col1:
        _renderizar_bloco_maitre()
    with col2:
        _renderizar_bloco_chef()
    with col3:
        _renderizar_bloco_caixa()
