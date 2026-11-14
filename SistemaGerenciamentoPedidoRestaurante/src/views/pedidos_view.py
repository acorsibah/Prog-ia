"""Tela de Gestao de Comandas e Atendimento no tema Patins Street."""

import streamlit as st
from src.services.cardapio_service import cardapio_service
from src.services.mesas_service import mesas_service
from src.services.pedidos_service import pedidos_service


def _renderizar_aba_abrir_pedido() -> None:
    """Formulario para abertura de comanda na pista com confirmacao HITL."""
    st.subheader("🛼 Abrir Comanda para Spot")
    mesas_livres = [m for m in mesas_service.listar_todas() if m.status == "LIVRE"]
    itens_disp = cardapio_service.listar_disponiveis()
    if not mesas_livres:
        st.warning("Não há spots livres na pista no momento. Libere um spot para abrir nova comanda.")
        return

    mesa_sel = st.selectbox("Spot da Pista", [f"Spot {m.numero}" for m in mesas_livres])
    num_mesa = int(mesa_sel.replace("Spot ", ""))
    item_sel = st.selectbox("Item do Cardápio Street", [f"{i.codigo} - {i.nome} ({i.formatar_preco()})" for i in itens_disp])
    cod_item = item_sel.split(" - ")[0]
    prod = cardapio_service.obter_por_codigo(cod_item)

    qtd = st.number_input("Quantidade", min_value=1, value=1, step=1)
    obs = st.text_input("Observações (ex: sem maionese, com gelo extra)")
    subtotal = prod.preco * qtd

    st.info(f"💰 Valor Previsto: R$ {subtotal:.2f}".replace(".", ","))
    confirma = st.checkbox("Confirmo a gravação da comanda no banco (Human-in-the-Loop)")

    if st.button("Gravar Comanda na Pista", type="primary", key="btn_gravar_comanda"):
        if not confirma:
            st.error("Por favor, confirme a operação antes de prosseguir.")
            return
        pedido_id = pedidos_service.abrir_pedido(num_mesa, [{"codigo": cod_item, "quantidade": qtd, "observacao": obs}])
        st.success(f"Comanda #{pedido_id} aberta no Spot {num_mesa} com sucesso!")
        st.rerun()


def _renderizar_aba_acompanhamento() -> None:
    """Fila do Pit Stop / Cozinha urbana para preparo rápido de lanches e shakes."""
    st.subheader("🔥 Fila de Preparo do Pit Stop")
    pedidos = pedidos_service.listar_ativos()
    if not pedidos:
        st.info("Nenhuma comanda na fila de preparo no momento.")
        return

    for p in pedidos:
        with st.container(border=True):
            col1, col2 = st.columns([3, 1])
            with col1:
                st.markdown(f"**Comanda #{p.id} — Spot {p.mesa_numero}** (`{p.status}`)")
                st.caption(f"Horário: {p.data_hora} | Consumo: R$ {p.valor_total:.2f}".replace(".", ","))
                for it in p.itens:
                    obs_txt = f" *(Obs: {it.observacao})*" if it.observacao else ""
                    st.write(f"- {it.quantidade}x {it.nome}{obs_txt}")
            with col2:
                proximo = {"RECEBIDO": "PREPARANDO", "PREPARANDO": "PRONTO", "PRONTO": "ENTREGUE"}.get(p.status)
                if proximo and st.button(f"Mudar para {proximo}", key=f"btn_avancar_{p.id}"):
                    pedidos_service.atualizar_status(p.id, proximo)
                    st.rerun()


def _renderizar_aba_fechamento() -> None:
    """Fechamento de comanda com memoria de calculo discriminada e taxa opcional."""
    st.subheader("💳 Check-out & Liquidação da Comanda")
    mesas_ocupadas = [m for m in mesas_service.listar_todas() if m.status == "OCUPADA"]
    if not mesas_ocupadas:
        st.info("Não há patinadores com comanda ativa para encerramento.")
        return

    mesa_sel = st.selectbox("Spot a Fechar", [f"Spot {m.numero}" for m in mesas_ocupadas], key="sel_fechar_mesa")
    num_mesa = int(mesa_sel.replace("Spot ", ""))
    try:
        resumo = pedidos_service.calcular_fechamento_mesa(num_mesa)
    except Exception as e:
        st.error(f"Erro ao calcular conta: {e}")
        return

    st.dataframe(resumo.itens, use_container_width=True)
    st.markdown(f"**Subtotal do Consumo:** R$ {resumo.subtotal:.2f}".replace(".", ","))
    st.markdown(f"**Taxa de Serviço Pista (10%):** R$ {resumo.taxa_servico:.2f}".replace(".", ","))

    aplicar_taxa = st.checkbox("Incluir taxa da pista de 10%", value=True)
    valor_final = resumo.total_com_taxa if aplicar_taxa else resumo.total_sem_taxa
    st.subheader(f"Total Final: R$ {valor_final:.2f}".replace(".", ","))

    confirma = st.checkbox("Confirmo o pagamento e a liberação imediata do spot na pista", key="chk_confirma_pag")
    if st.button("Confirmar Liquidação", type="primary", key="btn_liquidar"):
        if not confirma:
            st.error("Aprovação necessária para liquidar a comanda.")
            return
        pedidos_service.liquidar_conta(resumo.pedido_id, num_mesa, valor_final)
        st.success(f"Comanda do Spot {num_mesa} liquidada! Spot liberado na pista.")
        st.rerun()


def renderizar_pedidos() -> None:
    """Ponto de entrada para a tela de Pedidos no tema Roller Street."""
    st.title("🧾 Comandas da Pista Street")
    aba1, aba2, aba3 = st.tabs(["🛼 Abrir Comanda", "🔥 Pit Stop / Cozinha", "💳 Check-out"])
    with aba1:
        _renderizar_aba_abrir_pedido()
    with aba2:
        _renderizar_aba_acompanhamento()
    with aba3:
        _renderizar_aba_fechamento()
