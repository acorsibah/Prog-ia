// ====================================================================
// Componente de Mapa Interativo (Leaflet) - ViraCorpus
// Exibe pontos autorizados de descarte no complexo de Viracopos
// ====================================================================

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { PontoDescarte } from '../../types/pontoDescarte';

// Marcador estilizado para o ponto de descarte
const criarIconeMarcador = (disponivel: boolean) => {
  const cor = disponivel ? '#10B981' : '#EF4444';
  return L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background-color: ${cor}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

interface Props {
  pontos: PontoDescarte[];
}

export const MapaLeaflet: React.FC<Props> = ({ pontos }) => {
  // Coordenadas centrais aproximadas do Aeroporto Internacional de Viracopos
  const centroViracopos: [number, number] = [-23.0074, -47.1345];

  return (
    <div className="h-[420px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
      <MapContainer
        center={centroViracopos}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {pontos.map((ponto) => (
          <Marker
            key={ponto.id}
            position={[ponto.latitude, ponto.longitude]}
            icon={criarIconeMarcador(ponto.disponivel)}
          >
            <Popup>
              <div className="text-xs p-1 min-w-[180px]">
                <p className="font-bold text-slate-800">{ponto.nome}</p>
                <p className="text-slate-500 text-[10px] mb-1">{ponto.codigoSetor}</p>
                <p className="text-slate-700">
                  <strong>Caixa:</strong> {ponto.tipoCaixa} ({ponto.capacidadeM3} m³)
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {ponto.materiaisAceitos.map((mat: string) => (
                    <span key={mat} className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

