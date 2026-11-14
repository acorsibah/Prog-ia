// ====================================================================
// Painel de Consciencia Ambiental - Google Stitch
// ====================================================================

import React from 'react';

export const PainelSustentabilidade: React.FC = () => {
  return (
    <section className="bg-secondary text-white rounded-2xl p-4 shadow-md space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#acf4a4] text-[#1a531f] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">nature</span>
        </div>
        <div>
          <h3 className="text-sm font-bold text-white leading-tight">Viracopos Sustentável</h3>
          <p className="text-[11px] text-[#acf4a4]">Indicador Coletivo Anual 2024</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex flex-col justify-center border border-white/10">
          <span className="text-[11px] text-white/80 font-medium">Desvio de Aterro</span>
          <span className="text-xl text-white font-extrabold tracking-tight">89.4%</span>
          <span className="text-[10px] text-[#acf4a4] mt-0.5">Meta Aeroporto: 85%</span>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex flex-col justify-center border border-white/10">
          <span className="text-[11px] text-white/80 font-medium">MTRs Auditados</span>
          <span className="text-xl text-white font-extrabold tracking-tight">1.420</span>
          <span className="text-[10px] text-[#acf4a4] mt-0.5">100% Homologados</span>
        </div>
      </div>
    </section>
  );
};
