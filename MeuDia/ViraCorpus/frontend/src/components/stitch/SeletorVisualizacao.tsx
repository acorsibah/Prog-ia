// ====================================================================
// Seletor de Modo de Exibicao Fiel ao Google Stitch
// ====================================================================

import React from 'react';

interface Props {
  modo: 'MAPA' | 'LISTA';
  totalCaixas: number;
  onAlternar: (modo: 'MAPA' | 'LISTA') => void;
}

export const SeletorVisualizacao: React.FC<Props> = ({ modo, totalCaixas, onAlternar }) => {
  // Retorna estilos dinâmicos para abas do Stitch
  const estiloAba = (aba: 'MAPA' | 'LISTA') => {
    const ativa = modo === aba;
    if (ativa) {
      return 'flex-1 min-h-[42px] py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 bg-white text-primary shadow-sm transition-all';
    }
    return 'flex-1 min-h-[42px] py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 transition-all';
  };

  return (
    <div className="bg-slate-100 p-1 rounded-xl shadow-sm flex items-center gap-1 border border-slate-200">
      <button onClick={() => onAlternar('MAPA')} className={estiloAba('MAPA')}>
        <span className="material-symbols-outlined text-[18px]">map</span>
        <span>Mapa Interativo</span>
      </button>

      <button onClick={() => onAlternar('LISTA')} className={estiloAba('LISTA')}>
        <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span>
        <span>Lista Detalhada ({totalCaixas})</span>
      </button>
    </div>
  );
};
