"""Tela de Invocacao e Execucao de Skills do Google Antigravity."""

import streamlit as st
from src.services.skills_service import skills_service


def _renderizar_skill_abrir_pedido() -> None:
    """Card de execucao e inspecao da skill /abrir-pedido."""
    st.markdown("### ⚡ Skill `/abrir-pedido`")
    espec = skills_service.obter_especificacao("abrir-pedido")
    if espec:
        st.caption(espec.get("description", ""))
        st.json(espec.get("parameters", {}))
        st.info("Para executar, utilize o formulário em 'Pedidos' ou a aba 'Agentes' (@AgenteMaitre).")
    else:
        st.warning("Arquivo .antigravity/skills/abrir-pedido.json não encontrado. Alternativa local em vigor.")


def _renderizar_skill_test() -> None:
    """Card de execucao da skill /test com confirmacao explicita previa."""
    st.markdown("### 🧪 Skill `/test` (Suíte de Testes)")
    cenarios = skills_service.listar_testes_previstos()
    st.write("**Cenários de Teste Descobertos:**")
    for c in cenarios:
        st.write(f"- {c}")

    confirma = st.checkbox("Confirmo a execução controlada da suíte de testes pytest", key="chk_testes")
    if st.button("Executar Testes (/test)", key="btn_run_tests"):
        if not confirma:
            st.error("Aprovação explícita necessária para rodar os testes.")
            return
        cod, status = skills_service.executar_testes()
        if cod == 0:
            st.success(f"Todos os testes passaram com sucesso! [Código: {cod} - {status}]")
        else:
            st.error(f"Falhas detectadas na suíte de testes. [Código: {cod} - {status}]")


def _renderizar_skill_audit_security() -> None:
    """Card de execucao da skill /audit-security sem expor segredos."""
    st.markdown("### 🛡️ Skill `/audit-security` (Auditoria)")
    if st.button("Auditar Segurança do Sistema", key="btn_run_audit_sec"):
        rel = skills_service.auditar_seguranca()
        if rel.status_geral == "APROVADO":
            st.success(f"Status da Auditoria: {rel.status_geral}")
        else:
            st.warning(f"Status da Auditoria: {rel.status_geral}")

        st.write("**Conformidades:**")
        for item in rel.itens_conformes:
            st.write(f"✅ {item}")
        if rel.alertas:
            st.write("**Alertas de Segurança:**")
            for alt in rel.alertas:
                st.write(f"⚠️ {alt}")
        st.write("**Variáveis Sanitizadas:**")
        for var in rel.variaveis_detectadas:
            st.code(var)


def renderizar_skills() -> None:
    """Ponto de entrada para a tela de Skills."""
    st.title("⚡ Skills do Google Antigravity")
    st.caption("Ações padronizadas, seguras e auditadas para o ecossistema GastroFlow.")
    col1, col2, col3 = st.columns(3)
    with col1:
        _renderizar_skill_abrir_pedido()
    with col2:
        _renderizar_skill_test()
    with col3:
        _renderizar_skill_audit_security()
