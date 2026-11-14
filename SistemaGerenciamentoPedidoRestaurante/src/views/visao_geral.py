"""Tela de Visao Geral com metricas e atmosfera da Pista Patins Street."""

import streamlit as st
from src.services.mesas_service import mesas_service
from src.services.pedidos_service import pedidos_service


def _renderizar_metricas(mesas, pedidos) -> None:
    """Renderiza os cards de metricas operacionais no estilo street roller."""
    col1, col2, col3, col4 = st.columns(4)
    livres = sum(1 for m in mesas if m.status == "LIVRE")
    ocupadas = sum(1 for m in mesas if m.status == "OCUPADA")
    col1.metric("🛹 Spots Livres", livres)
    col2.metric("🛼 Spots Ocupados", ocupadas)
    col3.metric("🔥 Comandas no Pit Stop", len(pedidos))
    faturamento = sum(p.valor_total for p in pedidos)
    col4.metric("💰 Consumo em Pista", f"R$ {faturamento:.2f}".replace(".", ","))


def _renderizar_painel_mesas(mesas) -> None:
    """Renderiza a grade visual dos spots e mesas do Rink de Patinação."""
    st.subheader("🛹 Situação dos Spots da Pista")
    cols = st.columns(len(mesas) if mesas else 1)
    status_icones = {"LIVRE": "🟢 Livre", "OCUPADA": "🔴 Na Pista", "RESERVADA": "🟡 Reservado"}
    nomes_spots = ["Half-Pipe 1", "Bowl Street 2", "Rampa Leste 3", "Lounge Inline 4", "Rail Box 5", "VIP Roller 6"]
    for idx, mesa in enumerate(mesas):
        with cols[idx % len(cols)]:
            nome_spot = nomes_spots[idx % len(nomes_spots)]
            st.markdown(f"**Spot {mesa.numero}**")
            st.caption(f"{nome_spot} ({mesa.capacidade} lug.)")
            st.info(status_icones.get(mesa.status, mesa.status))


def renderizar_visao_geral() -> None:
    """Ponto de entrada para a tela de Visao Geral tematica."""
    st.title("🛼 RollerFlow — Painel da Pista Street")
    st.markdown("<span class='street-badge'>STREET ROLLER DINER & RINK</span>", unsafe_allow_html=True)
    st.caption("Acompanhamento em tempo real de patinadores, spots, pedidos e produção da cozinha urbana.")
    mesas = mesas_service.listar_todas()
    pedidos = pedidos_service.listar_ativos()
    _renderizar_metricas(mesas, pedidos)
    st.divider()
    _renderizar_painel_mesas(mesas)
