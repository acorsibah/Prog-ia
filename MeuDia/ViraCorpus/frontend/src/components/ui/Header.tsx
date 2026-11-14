// ====================================================================
// Cabecalho Responsivo do Aplicativo ViraCorpus
// ====================================================================

import React from 'react';
import { Plane, Map, List, Truck, ShieldCheck } from 'lucide-react';

interface Props {
  modoExibicao: 'MAPA' | 'LISTA';
  onAlternarModo: () => void;
  onAbrirTroca: () => void;
  onAbrirDestinacao: () => void;
}

export const Header: React.FC<Props> = ({
  modoExibicao,
  onAlternarModo,
  onAbrirTroca,
  onAbrirDestinacao,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Plane size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">ViraCorpus</h1>
            <p className="text-[10px] text-slate-300">Resíduos • Viracopos</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onAbrirTroca}
            title="Registrar Troca (Motorista)"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-md border border-slate-700"
          >
            <Truck size={16} />
          </button>
          <button
            onClick={onAbrirDestinacao}
            title="Confirmar Destinação (Gestão)"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-md border border-slate-700"
          >
            <ShieldCheck size={16} />
          </button>
          <button
            onClick={onAlternarModo}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-xs font-medium"
          >
            {modoExibicao === 'MAPA' ? <List size={14} /> : <Map size={14} />}
            <span>{modoExibicao === 'MAPA' ? 'Lista' : 'Mapa'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

