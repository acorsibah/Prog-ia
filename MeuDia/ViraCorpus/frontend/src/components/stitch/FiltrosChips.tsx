// ====================================================================
// Filtros em Chips Horizontais Idênticos ao Google Stitch
// ====================================================================

import React from 'react';
import { FiltrosStitch } from '../../types/pontoDescarte';

interface Props {
  filtros: FiltrosStitch;
  onChangeFiltros: (filtros: FiltrosStitch) => void;
  locais: string[];
  materiais: string[];
}

export const FiltrosChips: React.FC<Props> = ({ filtros, onChangeFiltros, locais, materiais }) => {
  // Limpa os filtros
  const handleLimpar = () => {
    onChangeFiltros({ localidade: 'TODOS', material: 'TODOS', statusOcupacao: 'TODOS', termoBusca: '' });
  };

  // Retorna classe para chip
  const classeChip = (ativo: boolean, bgCustom = 'bg-primary text-white') => {
    if (ativo) {
      return `filter-chip shrink-0 h-8 px-3.5 rounded-full text-xs font-bold ${bgCustom} shadow-sm`;
    }
    return 'filter-chip shrink-0 h-8 px-3.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors';
  };

  return (
    <section className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[20px]">filter_list</span>
          <span className="text-xs font-bold text-primary">Filtragem Rápida</span>
        </div>
        <button onClick={handleLimpar} className="text-[11px] font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[16px]">restart_alt</span> Limpar
        </button>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Localidade VCP</span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button onClick={() => onChangeFiltros({ ...filtros, localidade: 'TODOS' })} className={classeChip(filtros.localidade === 'TODOS')}>
            Todos (32)
          </button>
          {locais.map((loc) => (
            <button key={loc} onClick={() => onChangeFiltros({ ...filtros, localidade: loc })} className={classeChip(filtros.localidade === loc)}>
              {loc}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1 pt-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Material Aceito</span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button onClick={() => onChangeFiltros({ ...filtros, material: 'TODOS' })} className={classeChip(filtros.material === 'TODOS')}>
            Todos
          </button>
          {materiais.map((mat) => (
            <button key={mat} onClick={() => onChangeFiltros({ ...filtros, material: mat })} className={classeChip(filtros.material === mat)}>
              {mat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1 pt-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nível & Status</span>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button onClick={() => onChangeFiltros({ ...filtros, statusOcupacao: 'TODOS' })} className={classeChip(filtros.statusOcupacao === 'TODOS')}>
            Todos Status
          </button>
          <button onClick={() => onChangeFiltros({ ...filtros, statusOcupacao: 'LIVRE' })} className={classeChip(filtros.statusOcupacao === 'LIVRE', 'bg-[#acf4a4] text-[#1a531f]')}>
            Livre &lt;75%
          </button>
          <button onClick={() => onChangeFiltros({ ...filtros, statusOcupacao: 'ALERTA' })} className={classeChip(filtros.statusOcupacao === 'ALERTA', 'bg-[#ffddb8] text-[#543300]')}>
            Quase Cheia 85%
          </button>
          <button onClick={() => onChangeFiltros({ ...filtros, statusOcupacao: 'CRITICO' })} className={classeChip(filtros.statusOcupacao === 'CRITICO', 'bg-[#ffdad6] text-[#ba1a1a]')}>
            Troca Imediata 90%+
          </button>
        </div>
      </div>
    </section>
  );
};
