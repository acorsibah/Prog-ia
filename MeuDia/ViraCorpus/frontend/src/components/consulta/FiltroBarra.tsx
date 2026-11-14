// ====================================================================
// Barra de Filtros de Pesquisa - ViraCorpus
// ====================================================================

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { FiltrosConsulta } from '../../types/pontoDescarte';

interface Props {
  filtros: FiltrosConsulta;
  onChangeFiltros: (novos: FiltrosConsulta) => void;
  materiaisDisponiveis: string[];
}

export const FiltroBarra: React.FC<Props> = ({ filtros, onChangeFiltros, materiaisDisponiveis }) => {
  // Atualiza termo de busca textual
  const handleBusca = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFiltros({ ...filtros, termoBusca: e.target.value });
  };

  // Atualiza filtro de material aceito
  const handleMaterial = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeFiltros({ ...filtros, material: e.target.value });
  };

  // Atualiza filtro de capacidade da caixa
  const handleCapacidade = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value ? Number(e.target.value) : null;
    onChangeFiltros({ ...filtros, capacidade: valor });
  };

  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-3 space-y-2">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar ponto, setor ou terminal..."
          value={filtros.termoBusca}
          onChange={handleBusca}
          className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <select
          value={filtros.material}
          onChange={handleMaterial}
          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="">Todos os Materiais</option>
          {materiaisDisponiveis.map((mat) => (
            <option key={mat} value={mat}>{mat}</option>
          ))}
        </select>

        <select
          value={filtros.capacidade || ''}
          onChange={handleCapacidade}
          className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="">Todas Capacidades</option>
          <option value="40">40 m³ (Roll-on)</option>
          <option value="26">26 m³ (Roll-on)</option>
          <option value="15">15 m³ (Poli)</option>
          <option value="5">5 m³ (Poli)</option>
        </select>
      </div>
    </div>
  );
};

