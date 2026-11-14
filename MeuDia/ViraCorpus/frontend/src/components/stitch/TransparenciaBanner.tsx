// ====================================================================
// Banner de Transparencia Ecologica - Google Stitch
// ====================================================================

import React from 'react';

interface Props {
  totalCaixas: number;
}

export const TransparenciaBanner: React.FC<Props> = ({ totalCaixas }) => {
  return (
    <section className="flex items-center justify-between bg-slate-100 rounded-xl p-3 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full bg-[#acf4a4] text-[#1a531f] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">eco</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
            Acesso Cidadão & Pátio
          </span>
          <span className="text-xs text-slate-800 truncate font-semibold">
            Viracopos Resíduos • Posições VCP
          </span>
        </div>
      </div>

      <span className="inline-flex items-center gap-1.5 bg-white text-primary text-[11px] font-bold px-3 py-1 rounded-full shadow-sm shrink-0 border border-slate-200">
        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
        {totalCaixas} Caixas Ativas
      </span>
    </section>
  );
};
