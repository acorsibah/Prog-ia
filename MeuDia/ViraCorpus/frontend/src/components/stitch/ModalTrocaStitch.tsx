// ====================================================================
// Modal de Solicitacao de Troca - Fiel ao Google Stitch
// ====================================================================

import React, { useState } from 'react';
import { PontoDescarteVCP } from '../../types/pontoDescarte';

interface Props {
  caixa: PontoDescarteVCP | null;
  onFechar: () => void;
  onConfirmar: (caixaId: string, motivo: string) => void;
}

export const ModalTrocaStitch: React.FC<Props> = ({ caixa, onFechar, onConfirmar }) => {
  const [motivo, setMotivo] = useState('Volume Atingiu Capacidade Limite (>85%)');
  const [contato, setContato] = useState('');

  if (!caixa) return null;

  // Processa o envio da ordem para o COA
  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmar(caixa.codigoCaixa, motivo);
    onFechar();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 border border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">local_shipping</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-primary">Solicitar Troca de Caçamba</h3>
              <span className="text-xs font-bold text-slate-500">
                {caixa.codigoCaixa}
              </span>
            </div>
          </div>
          <button onClick={onFechar} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleEnviar} className="space-y-3 text-xs text-slate-800">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-0.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Local de Posicionamento</span>
            <p className="font-bold text-primary text-sm">{caixa.localidade}</p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600 uppercase font-bold">Motivo do Acionamento</label>
            <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-primary outline-none">
              <option>Volume Atingiu Capacidade Limite (&gt;85%)</option>
              <option>Necessidade de Limpeza / Troca Sanitária</option>
              <option>Mudança de Operação na Pista / Pátio</option>
              <option>Dano Estrutural na Caçamba</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600 uppercase font-bold">Ramal / Telefone de Contato em Pátio</label>
            <input value={contato} onChange={(e) => setContato(e.target.value)} placeholder="Ex: Ramal TECA 3192 ou (19) 988..." className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-xs font-medium focus:bg-white focus:ring-2 focus:ring-primary outline-none" type="text" />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button type="button" onClick={onFechar} className="flex-1 min-h-[46px] rounded-xl bg-slate-100 hover:bg-slate-200 text-primary text-xs font-bold border border-slate-200 flex items-center justify-center transition-colors">
              Cancelar
            </button>
            <button type="submit" className="flex-1 min-h-[46px] rounded-xl bg-primary hover:bg-[#0a3d62] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Despachar Ordem</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
