"""Tela de Gerenciamento e Consulta de Spots da Pista Street."""

import streamlit as st
from src.services.mesas_service import mesas_service


def _renderizar_tabela_mesas(mesas) -> None:
    """Renderiza a listagem de spots da pista."""
    nomes_spots = ["Half-Pipe 1", "Bowl Street 2", "Rampa Leste 3", "Lounge Inline 4", "Rail Box 5", "VIP Roller 6"]
    dados = [
        {"Spot #": f"Spot {m.numero}", "Área da Pista": nomes_spots[(m.numero - 1) % len(nomes_spots)],
         "Capacidade": f"{m.capacidade} patinadores", "Status": m.status}
        for m in mesas
    ]
    st.dataframe(dados, use_container_width=True)


def _renderizar_form_status(mesas) -> None:
    """Renderiza formulario de alteracao manual de status do spot."""
    st.subheader("⚡ Atualizar Status do Spot")
    opcoes = {f"Spot {m.numero} (Status: {m.status})": m for m in mesas}
    if not opcoes:
        st.info("Nenhum spot cadastrado.")
        return

    escolha = st.selectbox("Selecione o Spot da Pista", list(opcoes.keys()))
    mesa_sel = opcoes[escolha]
    novo_status = st.selectbox("Novo Status", ["LIVRE", "OCUPADA", "RESERVADA"])

    if st.button("Gravar Status do Spot", key="btn_status_spot"):
        sucesso = mesas_service.atualizar_status(mesa_sel.id, novo_status)
        if sucesso:
            st.success(f"Spot {mesa_sel.numero} atualizado para {novo_status}!")
            st.rerun()


def renderizar_mesas() -> None:
    """Ponto de entrada para a tela de Spots e Mesas."""
    st.title("🛹 Spots & Mesas da Pista")
    st.caption("Controle dos pontos de parada, descanso e consumo ao redor da pista de patinação.")
    mesas = mesas_service.listar_todas()
    if not mesas:
        st.warning("Nenhum spot encontrado no banco de dados.")
        return
    _renderizar_tabela_mesas(mesas)
    st.divider()
    _renderizar_form_status(mesas)
