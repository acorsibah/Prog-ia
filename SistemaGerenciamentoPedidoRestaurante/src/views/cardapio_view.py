"""Tela de Consulta e Gestao do Cardapio Roller Street."""

import streamlit as st
from src.services.cardapio_service import cardapio_service


def _renderizar_tabela_cardapio(itens) -> None:
    """Exibe os itens do cardapio formatados com estilo street."""
    dados = [
        {"Cód": i.codigo, "Item Street": i.nome, "Categoria": i.categoria,
         "Preço": i.formatar_preco(), "Status": "⚡ Disponível" if i.disponivel else "🚫 Esgotado"}
        for i in itens
    ]
    st.dataframe(dados, use_container_width=True)


def _renderizar_toggle_disponibilidade(itens) -> None:
    """Formulario para alternar a disponibilidade de um lanche ou bebida."""
    st.subheader("⚡ Ativar / Esgotar Item")
    opcoes = {f"{i.codigo} - {i.nome} ({'Disponível' if i.disponivel else 'Esgotado'})": i for i in itens}
    escolha = st.selectbox("Selecione o Item da Pista", list(opcoes.keys()))
    if st.button("Alternar Disponibilidade", key="btn_toggle_cardapio"):
        cardapio_service.alternar_disponibilidade(opcoes[escolha].id)
        st.success("Status do item atualizado no cardápio street!")
        st.rerun()


def _renderizar_form_cadastro() -> None:
    """Formulario para cadastro de novos lanches e bebidas street."""
    st.subheader("🛹 Cadastrar Lanche / Bebida")
    with st.form("form_novo_prato_street"):
        codigo = st.text_input("Código Street (ex: BUR-04)")
        nome = st.text_input("Nome do Lanche/Shake")
        categoria = st.selectbox("Categoria", ["Street Burgers", "Hot Dogs Street", "Porções da Pista", "Shakes & Sobremesas", "Bebidas Geladas"])
        preco = st.number_input("Preço de Venda (R$)", min_value=0.0, step=1.0)
        enviado = st.form_submit_button("Adicionar ao Cardápio Street")
        if enviado:
            if not codigo or not nome:
                st.error("Código e Nome são obrigatórios.")
            else:
                cardapio_service.cadastrar_item(codigo, nome, categoria, preco)
                st.success(f"Lanche '{nome}' adicionado ao cardápio da pista!")
                st.rerun()


def renderizar_cardapio() -> None:
    """Ponto de entrada para a tela de Cardapio Street."""
    st.title("🍔 Cardápio Roller Street Diner")
    st.caption("Smash burgers, hot dogs artesanais, batatas rústicas e shakes energéticos.")
    itens = cardapio_service.listar_todos()
    if not itens:
        st.info("Cardápio street vazio.")
        return
    _renderizar_tabela_cardapio(itens)
    st.divider()
    col1, col2 = st.columns(2)
    with col1:
        _renderizar_toggle_disponibilidade(itens)
    with col2:
        _renderizar_form_cadastro()
