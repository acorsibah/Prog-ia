"""Tela de Visualizacao e Rastreamento dos Logs de Auditoria."""

import streamlit as st
from src.services.auditoria_service import auditoria_service


def _renderizar_lista_logs(eventos) -> None:
    """Renderiza a lista cronologica de logs de auditoria."""
    st.subheader(f"Últimos {len(eventos)} Eventos de Auditoria")
    for linha in eventos:
        if "[HUMAN_OPERATOR]" in linha:
            st.success(linha)
        elif "[Agente" in linha or "Agente" in linha:
            st.info(linha)
        else:
            st.code(linha)


def renderizar_auditoria() -> None:
    """Ponto de entrada para a tela de Auditoria."""
    st.title("🛡️ Trilha de Auditoria e Conformidade")
    st.caption("Eventos registrados no arquivo .antigravity/logs/audit.log com rastreamento HITL.")
    eventos = auditoria_service.listar_eventos(limite=100)
    if not eventos:
        st.info("Nenhum evento registrado no log de auditoria até o momento.")
        return
    _renderizar_lista_logs(eventos)
