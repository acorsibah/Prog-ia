// ====================================================================
// Card Informativo do Ponto de Descarte
// Exibe separadamente a ultima troca e a ultima destinacao confirmada
// ====================================================================

import React from 'react';
import { PontoDescarte } from '../../types/pontoDescarte';
import { CalendarClock, CheckCircle2, MapPin, Info } from 'lucide-react';

interface Props {
  ponto: PontoDescarte;
}

// Formata data ISO para exibicao amigavel
const formatarData = (dataIso: string | null): string => {
  if (!dataIso) return 'Sem registro';
  return new Date(dataIso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const CardPontoDescarte: React.FC<Props> = ({ ponto }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-3 transition hover:shadow-md">
      <div className="flex justify-between items-start gap-2 mb-2">
        <div>
          <span className="text-[11px] font-semibold tracking-wider text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded">
            {ponto.codigoSetor}
          </span>
          <h2 className="font-semibold text-slate-800 text-sm mt-1">{ponto.nome}</h2>
        </div>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
          ponto.disponivel ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
        }`}>
          {ponto.disponivel ? 'Disponível' : 'Cheia / Indisponível'}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
        <MapPin size={13} className="text-slate-400 shrink-0" />
        <span className="truncate">{ponto.descricaoAcesso}</span>
      </div>

      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3 text-xs">
        <p className="text-slate-700 font-medium">
          Caixa: {ponto.tipoCaixa} • Capacidade: <span className="font-bold">{ponto.capacidadeM3} m³</span>
        </p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {ponto.materiaisAceitos.map((mat: string) => (
            <span key={mat} className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
              {mat}
            </span>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
        <div className="flex flex-col">
          <span className="flex items-center gap-1 text-amber-700 font-medium">
            <CalendarClock size={12} /> Última Troca
          </span>
          <span className="text-slate-700 font-semibold mt-0.5">
            {formatarData(ponto.dataUltimaTroca)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="flex items-center gap-1 text-emerald-700 font-medium">
            <CheckCircle2 size={12} /> Última Destinação
          </span>
          <span className="text-slate-700 font-semibold mt-0.5">
            {formatarData(ponto.dataUltimaDestinacaoConfirmada)}
          </span>
        </div>
      </div>
    </div>
  );
};

