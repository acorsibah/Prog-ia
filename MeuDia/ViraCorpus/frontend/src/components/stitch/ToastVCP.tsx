// ====================================================================
// Toast de Notificacao Fiel ao Google Stitch
// ====================================================================

import React from 'react';

interface Props {
  mensagem: string | null;
  onFechar: () => void;
}

export const ToastVCP: React.FC<Props> = ({ mensagem, onFechar }) => {
  if (!mensagem) return null;

  return (
    <div className="fixed bottom-20 inset-x-4 max-w-sm mx-auto z-50 bg-primary text-on-primary p-3.5 rounded-xl shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-2.5">
        <span className="material-symbols-outlined text-secondary-fixed text-[22px]">
          check_circle
        </span>
        <span className="text-body-sm font-body-sm leading-snug">{mensagem}</span>
      </div>
      <button onClick={onFechar} className="text-on-primary/70 hover:text-on-primary shrink-0 ml-2">
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};

