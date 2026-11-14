"""View Streamlit para gerenciamento de receitas e fichas técnicas."""

import streamlit as st

from src.services.ingredientes_service import listar_ingredientes
from src.services.receitas_service import (
    cadastrar_receita,
    desvincular_ingrediente,
    excluir_receita,
    listar_ingredientes_da_receita,
    listar_receitas,
    vincular_ingrediente,
)

# Unidades de medida disponíveis para seleção
UNIDADES = ["kg", "g", "ml", "litro", "unidade"]


def _exibir_lista_receitas() -> None:
    """Renderiza a lista de receitas com expansor para detalhes."""
    receitas = listar_receitas()
    if not receitas:
        st.info("📖 Nenhuma receita cadastrada ainda.")
        return
    for rec in receitas:
        with st.expander(f"📖 {rec.nome} — ⏱️ {rec.tempo_preparo} min"):
            if rec.descricao:
                st.markdown(f"**Descrição:** {rec.descricao}")
            st.markdown(f"**Modo de Preparo:**\n\n{rec.modo_preparo}")
            st.markdown("**Ingredientes:**")
            ings = listar_ingredientes_da_receita(rec.id)
            if ings:
                for ing in ings:
                    st.markdown(f"- {ing.nome}: {ing.quantidade_necessaria} {ing.unidade_medida}")
            else:
                st.caption("Nenhum ingrediente vinculado.")


def _formulario_cadastro_receita() -> None:
    """Renderiza o formulário para cadastro de uma nova receita."""
    st.subheader("📖 Nova Receita")
    with st.form("form_cadastro_receita", clear_on_submit=True):
        nome = st.text_input("Nome da Receita", placeholder="ex: Hambúrguer Artesanal")
        descricao = st.text_input("Descrição (opcional)", placeholder="ex: Clássico da pista...")
        modo_preparo = st.text_area("Modo de Preparo", placeholder="Descreva o passo a passo...")
        tempo_preparo = st.number_input("Tempo de Preparo (minutos)", min_value=1, step=1, value=15)
        enviado = st.form_submit_button("💾 Cadastrar Receita")
    if enviado:
        _processar_cadastro_receita(nome, descricao, modo_preparo, int(tempo_preparo))


def _processar_cadastro_receita(nome: str, descricao: str, modo_preparo: str,
                                 tempo_preparo: int) -> None:
    """Valida e persiste a nova receita após confirmação."""
    if not nome.strip():
        st.warning("⚠️ Informe o nome da receita.")
        return
    if not modo_preparo.strip():
        st.warning("⚠️ Informe o modo de preparo.")
        return
    chave = "confirmar_cadastro_rec"
    st.session_state.setdefault(chave, False)
    if not st.session_state[chave]:
        st.info(f"Confirmar cadastro de **{nome}** ({tempo_preparo} min)?")
        if st.button("✅ Sim, cadastrar receita"):
            st.session_state[chave] = True
            st.rerun()
        return
    try:
        rec = cadastrar_receita(nome.strip(), modo_preparo.strip(), tempo_preparo, descricao.strip())
        st.success(f"✅ Receita **{rec.nome}** cadastrada com ID {rec.id}!")
    except Exception as erro:
        st.error(f"❌ Erro ao cadastrar: {erro}")
    finally:
        st.session_state[chave] = False


def _formulario_vincular_ingrediente() -> None:
    """Renderiza o formulário para vincular um ingrediente a uma receita."""
    st.subheader("🔗 Vincular Ingrediente à Receita")
    receitas = listar_receitas()
    ingredientes = listar_ingredientes()
    if not receitas:
        st.info("Cadastre uma receita primeiro.")
        return
    if not ingredientes:
        st.info("Cadastre um ingrediente primeiro.")
        return
    opc_rec = {f"{r.id} — {r.nome}": r for r in receitas}
    opc_ing = {f"{i.id} — {i.nome}": i for i in ingredientes}
    rec_sel = st.selectbox("Receita", list(opc_rec.keys()), key="sel_rec_vinc")
    ing_sel = st.selectbox("Ingrediente", list(opc_ing.keys()), key="sel_ing_vinc")
    col1, col2 = st.columns(2)
    qtd = col1.number_input("Quantidade Necessária", min_value=0.01, step=0.1, key="qtd_vinc")
    unidade = col2.selectbox("Unidade", UNIDADES, key="und_vinc")
    if st.button("🔗 Vincular", key="btn_vincular_ing"):
        try:
            rec = opc_rec[rec_sel]
            ing = opc_ing[ing_sel]
            vincular_ingrediente(rec.id, ing.id, qtd, unidade)
            st.success(f"✅ **{ing.nome}** vinculado à receita **{rec.nome}**.")
            st.rerun()
        except Exception as erro:
            st.error(f"❌ Erro ao vincular: {erro}")


def _formulario_desvincular() -> None:
    """Renderiza o formulário para remover vínculo ingrediente-receita."""
    st.subheader("🔓 Remover Vínculo")
    receitas = listar_receitas()
    if not receitas:
        return
    opc_rec = {f"{r.id} — {r.nome}": r for r in receitas}
    rec_sel = st.selectbox("Receita", list(opc_rec.keys()), key="sel_rec_desvic")
    rec = opc_rec[rec_sel]
    ings = listar_ingredientes_da_receita(rec.id)
    if not ings:
        st.info("Esta receita não possui ingredientes vinculados.")
        return
    opc_ing = {f"{i.ingrediente_id} — {i.nome}": i for i in ings}
    ing_sel = st.selectbox("Ingrediente para remover", list(opc_ing.keys()), key="sel_ing_desv")
    if st.button("🔓 Remover Vínculo", key="btn_desvincular"):
        ing = opc_ing[ing_sel]
        try:
            desvincular_ingrediente(rec.id, ing.ingrediente_id)
            st.success(f"✅ Vínculo removido: **{ing.nome}** ← **{rec.nome}**.")
            st.rerun()
        except Exception as erro:
            st.error(f"❌ Erro: {erro}")


def _formulario_excluir_receita() -> None:
    """Renderiza o formulário para exclusão de uma receita."""
    st.subheader("🗑️ Remover Receita")
    receitas = listar_receitas()
    if not receitas:
        return
    opc_rec = {f"{r.id} — {r.nome}": r for r in receitas}
    rec_sel = st.selectbox("Receita para remover", list(opc_rec.keys()), key="sel_rec_excl")
    rec = opc_rec[rec_sel]
    st.warning(f"⚠️ Remover **{rec.nome}** apagará também seus vínculos de ingredientes.")
    if st.button("🗑️ Confirmar Remoção", key="btn_excluir_receita"):
        try:
            if excluir_receita(rec.id):
                st.success(f"✅ Receita **{rec.nome}** removida.")
                st.rerun()
            else:
                st.error("❌ Receita não encontrada.")
        except Exception as erro:
            st.error(f"❌ Erro: {erro}")


def renderizar_receitas() -> None:
    """Ponto de entrada da view de receitas."""
    st.title("📖 Receitas & Fichas Técnicas")
    st.caption("Cadastre as receitas do Roller Street Diner e vincule os ingredientes necessários.")
    _exibir_lista_receitas()
    st.divider()
    aba1, aba2, aba3, aba4 = st.tabs(["➕ Nova Receita", "🔗 Vincular Ingrediente",
                                       "🔓 Remover Vínculo", "🗑️ Excluir Receita"])
    with aba1:
        _formulario_cadastro_receita()
    with aba2:
        _formulario_vincular_ingrediente()
    with aba3:
        _formulario_desvincular()
    with aba4:
        _formulario_excluir_receita()
