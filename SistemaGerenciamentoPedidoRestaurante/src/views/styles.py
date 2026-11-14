"""Modulo de estilizacao e tema Patins Street para a interface Streamlit."""

import streamlit as st


def _obter_css_patins_street() -> str:
    """Retorna as regras CSS personalizadas no estilo urbano de Patins Street."""
    return """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,400;0,700;0,900;1,800&family=Permanent+Marker&display=swap');
    
    .stApp {
        background: radial-gradient(circle at 10% 20%, #12131C 0%, #090A0F 90%);
        color: #E2E8F0;
        font-family: 'Montserrat', sans-serif;
    }
    
    h1, h2, h3 {
        font-family: 'Permanent Marker', cursive, sans-serif !important;
        letter-spacing: 1px;
    }
    h1 {
        background: linear-gradient(90deg, #00F2FE 0%, #4FACFE 40%, #FF007F 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 20px rgba(0, 242, 254, 0.3);
    }
    
    [data-testid="stMetricValue"] {
        color: #00F2FE !important;
        font-family: 'Permanent Marker', cursive;
        font-size: 2rem !important;
    }
    
    div[data-testid="stSidebar"] {
        background: #0D0E15 !important;
        border-right: 2px solid #FF007F40;
    }
    
    .stButton>button {
        background: linear-gradient(135deg, #FF007F 0%, #7928CA 100%) !important;
        color: #FFFFFF !important;
        border: none !important;
        border-radius: 8px !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 15px rgba(255, 0, 127, 0.4) !important;
        transition: all 0.3s ease !important;
    }
    .stButton>button:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 6px 20px rgba(0, 242, 254, 0.6) !important;
    }
    
    div[data-testid="stForm"], div[data-testid="stExpander"] {
        background: rgba(26, 28, 43, 0.7);
        border: 1px solid rgba(0, 242, 254, 0.3);
        border-radius: 12px;
        backdrop-filter: blur(10px);
    }
    
    .street-badge {
        display: inline-block;
        padding: 4px 12px;
        background: rgba(255, 0, 127, 0.2);
        border: 1px solid #FF007F;
        border-radius: 20px;
        color: #FF70B5;
        font-weight: 700;
        font-size: 0.85rem;
    }
    </style>
    """


def injetar_estilo_patins_street() -> None:
    """Injeta as definicoes de tema urbano Patins Street na sessao do Streamlit."""
    st.markdown(_obter_css_patins_street(), unsafe_allow_html=True)
