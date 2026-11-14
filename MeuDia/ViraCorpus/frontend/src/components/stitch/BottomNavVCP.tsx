// ====================================================================
// Barra de Navegacao Inferior (Bottom Navigation) - Google Stitch
// ====================================================================

import React from 'react';

export type AbaNavegacao = 'MAPA' | 'TAREFAS' | 'DESTINACAO' | 'RELATORIOS';

interface Props {
  abaAtiva: AbaNavegacao;
  onSelecionarAba: (aba: AbaNavegacao) => void;
}

export const BottomNavVCP: React.FC<Props> = ({ abaAtiva, onSelecionarAba }) => {
  // Retorna estilos da aba selecionada
  const estiloAba = (aba: AbaNavegacao) => {
    const ativa = abaAtiva === aba;
    if (ativa) {
      return 'flex flex-col items-center justify-center w-20 h-14 rounded-lg text-primary font-bold transition-colors';
    }
    return 'flex flex-col items-center justify-center w-20 h-14 rounded-lg text-slate-400 hover:text-slate-700 transition-colors font-medium';
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md shadow-[0_-2px_12px_rgba(0,0,0,0.06)] border-t border-slate-200">
      <div className="max-w-md mx-auto h-16 px-2 flex items-center justify-around">
        <button onClick={() => onSelecionarAba('MAPA')} className={estiloAba('MAPA')}>
          <span className="material-symbols-outlined text-[24px]">map</span>
          <span className="text-[11px] leading-tight mt-0.5">Mapa & Caixas</span>
        </button>

        <button onClick={() => onSelecionarAba('TAREFAS')} className={estiloAba('TAREFAS')}>
          <span className="material-symbols-outlined text-[24px]">local_shipping</span>
          <span className="text-[11px] leading-tight mt-0.5">Tarefas</span>
        </button>

        <button onClick={() => onSelecionarAba('DESTINACAO')} className={estiloAba('DESTINACAO')}>
          <span className="material-symbols-outlined text-[24px]">recycling</span>
          <span className="text-[11px] leading-tight mt-0.5">Destinação</span>
        </button>

        <button onClick={() => onSelecionarAba('RELATORIOS')} className={estiloAba('RELATORIOS')}>
          <span className="material-symbols-outlined text-[24px]">query_stats</span>
          <span className="text-[11px] leading-tight mt-0.5">Relatórios</span>
        </button>
      </div>
    </nav>
  );
};
