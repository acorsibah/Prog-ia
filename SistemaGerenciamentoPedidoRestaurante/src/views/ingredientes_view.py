"""View Streamlit para gerenciamento do estoque de ingredientes."""

import streamlit as st

from src.services.ingredientes_service import (
    atualizar_estoque,
    cadastrar_ingrediente,
    excluir_ingrediente,
    listar_ingredientes,
)

# Unidades de medida disponíveis para seleção
UNIDADES = ["kg", "g", "ml", "litro", "unidade"]


def _exibir_tabela_ingredientes() -> None:
    """Renderiza a tabela com todos os ingredientes do estoque."""
    ingredientes = listar_ingredientes()
    if not ingredientes:
        st.info("🥦 Nenhum ingrediente cadastrado ainda. Adicione abaixo!")
        return
    dados = [
        {
            "🆔 ID": ing.id,
            "🥕 Ingrediente": ing.nome,
            "📦 Quantidade": ing.quantidade,
            "📏 Unidade": ing.unidade_medida,
            "🕐 Cadastrado em": ing.created_at,
        }
        for ing in ingredientes
    ]
    st.dataframe(dados, use_container_width=True)


def _formulario_cadastro() -> None:
    """Renderiza o formulário para cadastro de um novo ingrediente."""
    st.subheader("➕ Novo Ingrediente")
    with st.form("form_cadastro_ingrediente", clear_on_submit=True):
        nome = st.text_input("Nome do Ingrediente", placeholder="ex: Farinha de Trigo")
        col1, col2 = st.columns(2)
        quantidade = col1.number_input("Quantidade Inicial", min_value=0.0, step=0.5)
        unidade = col2.selectbox("Unidade de Medida", UNIDADES)
        enviado = st.form_submit_button("💾 Cadastrar Ingrediente")
    if enviado:
        _processar_cadastro(nome, quantidade, unidade)


def _processar_cadastro(nome: str, quantidade: float, unidade: str) -> None:
    """Valida e persiste o novo ingrediente após confirmação."""
    if not nome.strip():
        st.warning("⚠️ Informe o nome do ingrediente.")
        return
    chave = "confirmar_cadastro_ing"
    st.session_state.setdefault(chave, False)
    if not st.session_state[chave]:
        st.info(f"Confirmar cadastro de **{nome}** ({quantidade} {unidade})?")
        if st.button("✅ Sim, cadastrar"):
            st.session_state[chave] = True
            st.rerun()
        return
    try:
        ing = cadastrar_ingrediente(nome.strip(), quantidade, unidade)
        st.success(f"✅ Ingrediente **{ing.nome}** cadastrado com ID {ing.id}!")
    except Exception as erro:
        st.error(f"❌ Erro ao cadastrar: {erro}")
    finally:
        st.session_state[chave] = False


def _formulario_atualizar_estoque() -> None:
    """Renderiza o formulário para atualizar a quantidade de um ingrediente."""
    st.subheader("🔄 Atualizar Estoque")
    ingredientes = listar_ingredientes()
    if not ingredientes:
        return
    opcoes = {f"{ing.id} — {ing.nome}": ing for ing in ingredientes}
    selecionado = st.selectbox("Selecione o Ingrediente", list(opcoes.keys()),
                               key="sel_atualizar_ing")
    ing = opcoes[selecionado]
    nova_qtd = st.number_input("Nova Quantidade", min_value=0.0, value=float(ing.quantidade),
                               step=0.5, key="nova_qtd_ing")
    if st.button("💾 Atualizar Estoque", key="btn_atualizar_estoque"):
        try:
            atualizar_estoque(ing.id, nova_qtd)
            st.success(f"✅ Estoque de **{ing.nome}** atualizado para {nova_qtd} {ing.unidade_medida}.")
            st.rerun()
        except Exception as erro:
            st.error(f"❌ Erro: {erro}")


def _formulario_excluir() -> None:
    """Renderiza o formulário para exclusão de um ingrediente."""
    st.subheader("🗑️ Remover Ingrediente")
    ingredientes = listar_ingredientes()
    if not ingredientes:
        return
    opcoes = {f"{ing.id} — {ing.nome}": ing for ing in ingredientes}
    selecionado = st.selectbox("Ingrediente para remover", list(opcoes.keys()),
                               key="sel_excluir_ing")
    ing = opcoes[selecionado]
    st.warning(f"⚠️ Esta ação removerá **{ing.nome}** permanentemente (se não vinculado a receitas).")
    if st.button("🗑️ Confirmar Remoção", key="btn_excluir_ing"):
        try:
            if excluir_ingrediente(ing.id):
                st.success(f"✅ Ingrediente **{ing.nome}** removido.")
                st.rerun()
            else:
                st.error("❌ Ingrediente não encontrado.")
        except Exception as erro:
            st.error(f"❌ Não foi possível remover: {erro}")


def renderizar_ingredientes() -> None:
    """Ponto de entrada da view de ingredientes."""
    st.title("🥕 Estoque de Ingredientes")
    st.caption("Gerencie os insumos disponíveis na cozinha do Roller Street Diner.")
    _exibir_tabela_ingredientes()
    st.divider()
    aba1, aba2, aba3 = st.tabs(["➕ Cadastrar", "🔄 Atualizar Estoque", "🗑️ Remover"])
    with aba1:
        _formulario_cadastro()
    with aba2:
        _formulario_atualizar_estoque()
    with aba3:
        _formulario_excluir()
