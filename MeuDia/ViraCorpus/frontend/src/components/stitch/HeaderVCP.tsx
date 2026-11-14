// ====================================================================
// Cabecalho VCP EcoLog - Fiel ao Google Stitch
// ====================================================================

import React from 'react';

interface Props {
  perfilAtivo: 'PUBLICA' | 'MOTORISTA' | 'GESTOR';
  onMudarPerfil: (perfil: 'PUBLICA' | 'MOTORISTA' | 'GESTOR') => void;
}

export const HeaderVCP: React.FC<Props> = ({ perfilAtivo, onMudarPerfil }) => {
  // Retorna estilos do botao de perfil ativo ou inativo
  const estiloPerfil = (perfil: 'PUBLICA' | 'MOTORISTA' | 'GESTOR') => {
    const ativo = perfilAtivo === perfil;
    if (ativo) {
      return 'flex-1 h-8 rounded-md text-xs font-bold bg-white text-primary shadow-sm transition-all flex items-center justify-center';
    }
    return 'flex-1 h-8 rounded-md text-xs font-semibold text-on-surface-variant hover:text-primary transition-all flex items-center justify-center';
  };

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="max-w-md mx-auto px-4 py-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-primary tracking-tight leading-tight">
                VCP EcoLog
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-secondary inline-block animate-pulse"></span>
                Online • Pátio VCP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700 hidden xs:inline">Mapa & Caixas</span>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
          <button onClick={() => onMudarPerfil('PUBLICA')} className={estiloPerfil('PUBLICA')}>
            Pública
          </button>
          <button onClick={() => onMudarPerfil('MOTORISTA')} className={estiloPerfil('MOTORISTA')}>
            Motorista
          </button>
          <button onClick={() => onMudarPerfil('GESTOR')} className={estiloPerfil('GESTOR')}>
            Gestor
          </button>
        </div>
      </div>
    </header>
  );
};
