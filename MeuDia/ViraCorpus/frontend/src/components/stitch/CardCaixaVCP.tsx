// ====================================================================
// Cartao de Caixa de Residuo com Estetica Identica ao Google Stitch
// ====================================================================

import React from 'react';
import { PontoDescarteVCP } from '../../types/pontoDescarte';

interface Props {
  caixa: PontoDescarteVCP;
  onSolicitarTroca: (caixa: PontoDescarteVCP) => void;
  onVerHistorico?: (caixa: PontoDescarteVCP) => void;
}

export const CardCaixaVCP: React.FC<Props> = ({ caixa, onSolicitarTroca, onVerHistorico }) => {
  // Retorna configuracao visual do badge de status
  const badgeConfig = () => {
    if (caixa.statusOcupacao === 'CRITICO') {
      return { bg: 'bg-[#ffdad6] text-[#ba1a1a] border border-[#ffb4ab]', dot: 'bg-[#ba1a1a]', txt: `Crítico (${caixa.ocupacaoPct}%)` };
    }
    if (caixa.statusOcupacao === 'ALERTA') {
      return { bg: 'bg-[#ffddb8] text-[#543300] border border-[#ffb95f]', dot: 'bg-[#e49200]', txt: `Quase Cheia (${caixa.ocupacaoPct}%)` };
    }
    return { bg: 'bg-[#acf4a4] text-[#1a531f] border border-[#91d78a]', dot: 'bg-[#2a6b2c]', txt: `Disponível (${caixa.ocupacaoPct}%)` };
  };

  // Retorna a cor da barra de progresso
  const corBarra = () => {
    if (caixa.statusOcupacao === 'CRITICO') return 'bg-[#ba1a1a]';
    if (caixa.statusOcupacao === 'ALERTA') return 'bg-[#f59e0b]';
    return 'bg-[#2a6b2c]';
  };

  const status = badgeConfig();

  return (
    <article className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3 transition-transform" id={`card-${caixa.id}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary tracking-tight">{caixa.codigoCaixa}</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-primary border border-blue-200">
              {caixa.localidade}
            </span>
          </div>
          <span className="text-xs text-slate-600 mt-0.5">{caixa.setorDescricao}</span>
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${status.bg}`}>
          <span className={`w-2 h-2 rounded-full ${status.dot}`}></span>
          {status.txt}
        </span>
      </div>

      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-800 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-amber-700">inventory_2</span>
            Capacidade e Ocupação Estimada
          </span>
          <span className="text-primary font-bold">{caixa.ocupacaoPct}% ({caixa.volumeM3} m³)</span>
        </div>
        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${corBarra()}`} style={{ width: `${caixa.ocupacaoPct}%` }} />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium pt-0.5">
          <span>Tara: {caixa.taraKg.toLocaleString('pt-BR')} kg</span>
          <span className="font-semibold text-slate-700">{caixa.statusOcupacao === 'CRITICO' ? 'Troca Imediata Obrigatória' : caixa.statusOcupacao === 'ALERTA' ? 'Solicitar Troca Preventiva' : 'Operação Normal'}</span>
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Materiais Autorizados</span>
        <div className="flex flex-wrap gap-1.5">
          {caixa.materiaisAceitos.map((mat) => (
            <span key={mat} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">recycling</span>
              {mat}
            </span>
          ))}
        </div>
      </div>

      <div className={`p-3 rounded-xl flex items-start gap-2.5 border text-xs leading-snug ${caixa.statusOcupacao === 'CRITICO' ? 'bg-red-50 border-red-200 text-red-950' : 'bg-blue-50 border-blue-200 text-blue-950'}`}>
        <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${caixa.statusOcupacao === 'CRITICO' ? 'text-red-700' : 'text-primary'}`}>
          {caixa.statusOcupacao === 'CRITICO' ? 'shield' : 'info'}
        </span>
        <p>
          <strong className={`font-bold ${caixa.statusOcupacao === 'CRITICO' ? 'text-red-800' : 'text-primary'}`}>{caixa.instrucaoTitulo}:</strong> {caixa.instrucaoTexto}
        </p>
      </div>

      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 space-y-2">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">history_edu</span>
          Rastreabilidade em Pátio
        </span>

        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
          </div>
          <div className="flex flex-col min-w-0 text-xs">
            <span className="text-primary font-bold">Última Troca Física Realizada</span>
            <span className="text-slate-800 font-medium">{caixa.ultimaTroca.dataHora} • <strong>{caixa.ultimaTroca.motorista}</strong></span>
            <span className="text-[11px] text-slate-500">Veículo VCP: Placa {caixa.ultimaTroca.veiculoPlaca} ({caixa.ultimaTroca.detalheLocal})</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#1a531f] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">verified</span>
          </div>
          <div className="flex flex-col min-w-0 text-xs">
            <span className="text-emerald-800 font-bold">Última Destinação Confirmada</span>
            <span className="text-slate-800 font-medium">{caixa.ultimaDestinacao.dataHora} • <strong>{caixa.ultimaDestinacao.destinadora}</strong></span>
            <span className="text-[11px] font-semibold text-emerald-700">{caixa.ultimaDestinacao.documentoMtr} ({caixa.ultimaDestinacao.tipoCertificado})</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button className="min-h-[46px] rounded-xl bg-slate-100 hover:bg-slate-200 text-primary text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors">
          <span className="material-symbols-outlined text-[18px]">directions</span>
          <span>Rota Interna</span>
        </button>
        <button onClick={() => onSolicitarTroca(caixa)} className="min-h-[46px] rounded-xl bg-primary hover:bg-[#0a3d62] text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">sync_alt</span>
          <span>Solicitar Troca</span>
        </button>
      </div>

      <button onClick={() => onVerHistorico && onVerHistorico(caixa)} className="w-full min-h-[38px] text-xs font-semibold text-primary hover:text-slate-600 flex items-center justify-center gap-1 transition-colors">
        <span className="material-symbols-outlined text-[16px]">history</span>
        Ver Histórico e Pesagens Anteriores
      </button>
    </article>
  );
};
