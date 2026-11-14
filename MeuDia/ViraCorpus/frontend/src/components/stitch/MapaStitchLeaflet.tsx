// ====================================================================
// Mapa Interativo Fiel ao Design e Animacoes do Google Stitch
// ====================================================================

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { PontoDescarteVCP } from '../../types/pontoDescarte';

interface Props {
  caixas: PontoDescarteVCP[];
  onSelecionarCaixa: (caixa: PontoDescarteVCP) => void;
}

// Cria pin do Stitch com badges e anéis coloridos
const criarIconeStitchHtml = (codigo: string, pct: number, status: 'LIVRE' | 'ALERTA' | 'CRITICO') => {
  let badgeStyle = 'background-color:#acf4a4; color:#1a531f; border:1px solid #91d78a;';
  let dotColor = '#2a6b2c';

  if (status === 'CRITICO') {
    badgeStyle = 'background-color:#ffdad6; color:#ba1a1a; border:1px solid #ffb4ab;';
    dotColor = '#ba1a1a';
  } else if (status === 'ALERTA') {
    badgeStyle = 'background-color:#ffddb8; color:#543300; border:1px solid #ffb95f;';
    dotColor = '#e49200';
  }

  return L.divIcon({
    className: 'stitch-pin-custom',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;">
        <div style="padding:2px 8px; border-radius:6px; font-size:11px; font-weight:800; box-shadow:0 2px 4px rgba(0,0,0,0.15); ${badgeStyle} margin-bottom:3px;">
          ${codigo} • ${pct}%
        </div>
        <div style="width:20px; height:20px; border-radius:50%; background-color:${dotColor}; border:2.5px solid white; box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>
      </div>`,
    iconSize: [84, 52],
    iconAnchor: [42, 50],
  });
};

export const MapaStitchLeaflet: React.FC<Props> = ({ caixas, onSelecionarCaixa }) => {
  const centroViracopos: [number, number] = [-23.00742, -47.13456];

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-md bg-slate-200 h-80 border border-slate-300">
      <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 border border-slate-200 pointer-events-none">
        <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
        <span className="text-[11px] font-bold text-primary uppercase tracking-tight">
          VCP GeoSat • Setor Sul/Norte
        </span>
      </div>

      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1">
        <button className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-md flex items-center justify-center text-primary shadow-sm active:scale-95 transition-transform border border-slate-200" title="Centralizar Pátio">
          <span className="material-symbols-outlined text-[18px]">my_location</span>
        </button>
        <button className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-md flex items-center justify-center text-primary shadow-sm active:scale-95 transition-transform border border-slate-200" title="Camadas de Voo">
          <span className="material-symbols-outlined text-[18px]">layers</span>
        </button>
      </div>

      <MapContainer center={centroViracopos} zoom={14} scrollWheelZoom={false} className="h-full w-full">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {caixas.map((c) => (
          <Marker key={c.id} position={[c.latitude, c.longitude]} icon={criarIconeStitchHtml(c.codigoCaixa, c.ocupacaoPct, c.statusOcupacao)} eventHandlers={{ click: () => onSelecionarCaixa(c) }}>
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-primary">{c.codigoCaixa} • {c.localidade}</p>
                <p className="text-slate-600">{c.setorDescricao}</p>
                <p className="font-bold text-secondary mt-1">Ocupação: {c.ocupacaoPct}%</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-2 inset-x-2 z-[400] bg-white/95 backdrop-blur-md rounded-lg py-1.5 px-3 flex items-center justify-between text-[11px] font-bold text-slate-800 shadow-sm border border-slate-200 pointer-events-none">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> Livre (&lt;75%)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Alerta (85%)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Crítico (90%+)</span>
      </div>
    </div>
  );
};
