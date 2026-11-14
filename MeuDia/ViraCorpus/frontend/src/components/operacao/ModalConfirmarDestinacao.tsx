// ====================================================================
// Modal de Confirmacao de Destinacao (Painel da Gestao)
// Exige MTR, Ticket de Balanca e Peso Aferido
// ====================================================================

import React, { useState } from 'react';
import { X, ShieldCheck, FileCheck } from 'lucide-react';
import { confirmarDestinacaoApi } from '../../services/api';

interface Props {
  aberto: boolean;
  onFechar: () => void;
  onSucesso: () => void;
}

export const ModalConfirmarDestinacao: React.FC<Props> = ({ aberto, onFechar, onSucesso }) => {
  const [registroId, setRegistroId] = useState('dest-01');
  const [pesoKg, setPesoKg] = useState('4250.00');
  const [mtr, setMtr] = useState('MTR-SP-2026-00441');
  const [ticket, setTicket] = useState('CDR-99120');
  const [destinadora, setDestinadora] = useState('Destinadora Paulínia Resíduos');
  const [mensagem, setMensagem] = useState<string | null>(null);

  if (!aberto) return null;

  // Submete a homologacao da destinacao com evidencias
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await confirmarDestinacaoApi({
        registroDestinacaoId: registroId,
        pesoKg: Number(pesoKg),
        mtrNumero: mtr,
        ticketCdr: ticket,
        destinadora,
        usuarioConfirmacaoId: 'usr-ges-01'
      });
      setMensagem('Destinação confirmada! Caixa liberada no inventário.');
      setTimeout(() => { onSucesso(); onFechar(); }, 1200);
    } catch (err: any) {
      setMensagem(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-4 shadow-xl text-xs space-y-3">
        <div className="flex justify-between items-center border-b pb-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Confirmar Destinação (Gestão)</span>
          </div>
          <button onClick={onFechar} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Destinadora / Instalação Final</label>
            <input type="text" value={destinadora} onChange={(e) => setDestinadora(e.target.value)} className="w-full p-2 border rounded-lg" required />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Nº MTR Oficial</label>
              <input type="text" value={mtr} onChange={(e) => setMtr(e.target.value)} className="w-full p-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Ticket / CDR</label>
              <input type="text" value={ticket} onChange={(e) => setTicket(e.target.value)} className="w-full p-2 border rounded-lg" required />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Peso Líquido Aferido (kg)</label>
            <input type="number" step="0.01" value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} className="w-full p-2 border rounded-lg" required />
          </div>

          <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-emerald-800 flex items-start gap-1.5">
            <FileCheck size={14} className="shrink-0 mt-0.5" />
            <span>A confirmação encerra a pendência e atualiza a data de destinação no mapa.</span>
          </div>

          {mensagem && <p className="text-center font-semibold text-emerald-600">{mensagem}</p>}

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow">
            Homologar e Baixar Carga
          </button>
        </form>
      </div>
    </div>
  );
};

