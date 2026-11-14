// ====================================================================
// Modal de Registro de Troca de Caixa (Painel do Motorista)
// Enfatiza a criacao da pendencia de destinacao
// ====================================================================

import React, { useState } from 'react';
import { X, Truck, AlertTriangle } from 'lucide-react';
import { PontoDescarte } from '../../types/pontoDescarte';
import { registrarTrocaApi } from '../../services/api';

interface Props {
  aberto: boolean;
  pontos: PontoDescarte[];
  onFechar: () => void;
  onSucesso: () => void;
}

export const ModalRegistrarTroca: React.FC<Props> = ({ aberto, pontos, onFechar, onSucesso }) => {
  const [localId, setLocalId] = useState(pontos[0]?.id || '');
  const [caixaRetirada, setCaixaRetirada] = useState('cx-01');
  const [caixaInstalada, setCaixaInstalada] = useState('cx-04');
  const [placa, setPlaca] = useState('BRA2E19');
  const [mensagem, setMensagem] = useState<string | null>(null);

  if (!aberto) return null;

  // Submete o registro da troca para a API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrarTrocaApi({
        localId,
        caixaRetiradaId: caixaRetirada,
        caixaInstaladaId: caixaInstalada,
        motoristaId: 'usr-mot-01',
        veiculoPlaca: placa,
        observacoes: 'Troca de rotina realizada em campo.'
      });
      setMensagem('Troca registrada! Destinação pendente gerada.');
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
            <Truck size={16} className="text-amber-600" />
            <span>Registrar Troca de Caixa</span>
          </div>
          <button onClick={onFechar} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Ponto de Descarte (Local)</label>
            <select value={localId} onChange={(e) => setLocalId(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50">
              {pontos.map((p) => (<option key={p.id} value={p.id}>{p.nome}</option>))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Caixa Retirada (Giro)</label>
              <input type="text" value={caixaRetirada} onChange={(e) => setCaixaRetirada(e.target.value)} className="w-full p-2 border rounded-lg" required />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Caixa Instalada (Nova)</label>
              <input type="text" value={caixaInstalada} onChange={(e) => setCaixaInstalada(e.target.value)} className="w-full p-2 border rounded-lg" required />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Placa do Caminhão</label>
            <input type="text" value={placa} onChange={(e) => setPlaca(e.target.value)} className="w-full p-2 border rounded-lg uppercase" required />
          </div>

          <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-800 flex items-start gap-1.5">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>A troca não destina a carga. A destinação ficará pendente de MTR e balança.</span>
          </div>

          {mensagem && <p className="text-center font-semibold text-blue-600">{mensagem}</p>}

          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg shadow">
            Confirmar Troca Operacional
          </button>
        </form>
      </div>
    </div>
  );
};

