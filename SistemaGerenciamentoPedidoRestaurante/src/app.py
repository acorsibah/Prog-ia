"""Ponto de entrada principal da aplicacao GastroFlow em Streamlit com tema Patins Street."""

from pathlib import Path
import sys

# Garante que a raiz do projeto esteja no sys.path para resolucao do pacote src
RAIZ_PROJETO = Path(__file__).resolve().parent.parent
if str(RAIZ_PROJETO) not in sys.path:
    sys.path.insert(0, str(RAIZ_PROJETO))

import streamlit as st
from src.config.database import inicializar_banco
from src.views.agentes_view import renderizar_agentes
from src.views.auditoria_view import renderizar_auditoria
from src.views.cardapio_view import renderizar_cardapio
from src.views.ingredientes_view import renderizar_ingredientes
from src.views.mesas_view import renderizar_mesas
from src.views.pedidos_view import renderizar_pedidos
from src.views.receitas_view import renderizar_receitas
from src.views.skills_view import renderizar_skills
from src.views.styles import injetar_estilo_patins_street
from src.views.visao_geral import renderizar_visao_geral


def _configurar_pagina() -> None:
    """Configura os metadados visuais da pagina no estilo Roller Street."""
    st.set_page_config(
        page_title="GastroFlow 🛼 Roller Street Diner",
        page_icon="🛼",
        layout="wide",
        initial_sidebar_state="expanded",
    )
    injetar_estilo_patins_street()


def _renderizar_menu_lateral() -> str:
    """Cria a barra lateral temática de navegacao no estilo Patins Street."""
    st.sidebar.markdown("# 🛼 RollerFlow")
    st.sidebar.markdown("<span class='street-badge'>STREET & ROLL DINER</span>", unsafe_allow_html=True)
    st.sidebar.caption("Pista Urbana de Pedidos & Mesas")
    paginas = [
        "🛼 Visão da Pista",
        "🛹 Spots & Mesas",
        "🍔 Cardápio Street",
        "🧾 Pedidos & Comandas",
        "🥕 Ingredientes",
        "📖 Receitas",
        "🤖 Agentes de Pista",
        "⚡ Skills Antigravity",
        "🛡️ Auditoria Street",
    ]
    return st.sidebar.radio("Navegação da Pista", paginas)


def _rotear_pagina(pagina_selecionada: str) -> None:
    """Roteia a execucao para a view correspondente a pagina escolhida."""
    rotas = {
        "🛼 Visão da Pista": renderizar_visao_geral,
        "🛹 Spots & Mesas": renderizar_mesas,
        "🍔 Cardápio Street": renderizar_cardapio,
        "🧾 Pedidos & Comandas": renderizar_pedidos,
        "🥕 Ingredientes": renderizar_ingredientes,
        "📖 Receitas": renderizar_receitas,
        "🤖 Agentes de Pista": renderizar_agentes,
        "⚡ Skills Antigravity": renderizar_skills,
        "🛡️ Auditoria Street": renderizar_auditoria,
    }
    visualizador = rotas.get(pagina_selecionada, renderizar_visao_geral)
    visualizador()


def main() -> None:
    """Funcao mestre que inicializa o banco e controla o ciclo de vida da UI."""
    _configurar_pagina()
    inicializar_banco()
    pagina = _renderizar_menu_lateral()
    _rotear_pagina(pagina)


if __name__ == "__main__":
    main()
