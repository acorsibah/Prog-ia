// ====================================================================
// Aplicacao Principal ViraCorpus com Estetica Fiel ao Google Stitch
// ====================================================================

import React, { useState, useMemo } from 'react';
import { PontoDescarteVCP, FiltrosStitch } from './types/pontoDescarte';
import { CAIXAS_STITCH_INICIAIS } from './data/dadosStitch';
import { HeaderVCP } from './components/stitch/HeaderVCP';
import { TransparenciaBanner } from './components/stitch/TransparenciaBanner';
import { SeletorVisualizacao } from './components/stitch/SeletorVisualizacao';
import { FiltrosChips } from './components/stitch/FiltrosChips';
import { CardCaixaVCP } from './components/stitch/CardCaixaVCP';
import { MapaStitchLeaflet } from './components/stitch/MapaStitchLeaflet';
import { PainelSustentabilidade } from './components/stitch/PainelSustentabilidade';
import { BottomNavVCP, AbaNavegacao } from './components/stitch/BottomNavVCP';
import { ToastVCP } from './components/stitch/ToastVCP';
import { ModalTrocaStitch } from './components/stitch/ModalTrocaStitch';
import { ModalConfirmarDestinacao } from './components/operacao/ModalConfirmarDestinacao';

export const App: React.FC = () => {
  const [caixas] = useState<PontoDescarteVCP[]>(CAIXAS_STITCH_INICIAIS);
  const [perfil, setPerfil] = useState<'PUBLICA' | 'MOTORISTA' | 'GESTOR'>('PUBLICA');
  const [modoExibicao, setModoExibicao] = useState<'MAPA' | 'LISTA'>('LISTA');
  const [abaNavegacao, setAbaNavegacao] = useState<AbaNavegacao>('MAPA');
  const [caixaParaTroca, setCaixaParaTroca] = useState<PontoDescarteVCP | null>(null);
  const [modalDestinacaoAberto, setModalDestinacaoAberto] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<FiltrosStitch>({
    localidade: 'TODOS',
    material: 'TODOS',
    statusOcupacao: 'TODOS',
    termoBusca: ''
  });

  // Lista dinamica de localidades e materiais
  const localidades = useMemo(() => Array.from(new Set(caixas.map((c) => c.localidade))), [caixas]);
  const materiais = useMemo(() => Array.from(new Set(caixas.flatMap((c) => c.materiaisAceitos))), [caixas]);

  // Filtra as caixas de acordo com os chips
  const caixasFiltradas = useMemo(() => {
    return caixas.filter((c) => {
      const matchLoc = filtros.localidade === 'TODOS' || c.localidade === filtros.localidade;
      const matchMat = filtros.material === 'TODOS' || c.materiaisAceitos.includes(filtros.material);
      const matchStatus = filtros.statusOcupacao === 'TODOS' || c.statusOcupacao === filtros.statusOcupacao;
      return matchLoc && matchMat && matchStatus;
    });
  }, [caixas, filtros]);

  // Manipula confirmacao de troca
  const handleConfirmarTroca = (codigoCaixa: string, _motivo: string) => {
    setToastMsg(`Ordem para ${codigoCaixa} enviada ao Centro de Operações (COA).`);
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] antialiased min-h-screen flex flex-col font-sans">
      <HeaderVCP
        perfilAtivo={perfil}
        onMudarPerfil={(novoPerfil) => {
          setPerfil(novoPerfil);
          if (novoPerfil === 'MOTORISTA') setCaixaParaTroca(caixas[0]);
          if (novoPerfil === 'GESTOR') setModalDestinacaoAberto(true);
        }}
      />

      <main className="flex-1 w-full max-w-md mx-auto pt-28 pb-24 px-4 space-y-4">
        <TransparenciaBanner totalCaixas={caixas.length} />

        <SeletorVisualizacao
          modo={modoExibicao}
          totalCaixas={caixasFiltradas.length}
          onAlternar={setModoExibicao}
        />

        <FiltrosChips
          filtros={filtros}
          onChangeFiltros={setFiltros}
          locais={localidades}
          materiais={materiais}
        />

        {modoExibicao === 'MAPA' && (
          <section className="space-y-3" id="mapViewSection">
            <MapaStitchLeaflet caixas={caixasFiltradas} onSelecionarCaixa={setCaixaParaTroca} />
          </section>
        )}

        <section className="flex flex-col space-y-3" id="cardsListingSection">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[22px]">delete_sweep</span>
              Caçambas Monitoradas
            </h2>
            <span className="text-xs text-slate-500 font-medium">Sincronizado há 3 min</span>
          </div>

          <div className="space-y-3">
            {caixasFiltradas.map((caixa) => (
              <CardCaixaVCP key={caixa.id} caixa={caixa} onSolicitarTroca={setCaixaParaTroca} />
            ))}
          </div>
        </section>

        <PainelSustentabilidade />
      </main>

      <BottomNavVCP
        abaAtiva={abaNavegacao}
        onSelecionarAba={(aba) => {
          setAbaNavegacao(aba);
          if (aba === 'DESTINACAO') setModalDestinacaoAberto(true);
          if (aba === 'TAREFAS') setCaixaParaTroca(caixas[0]);
        }}
      />

      <ModalTrocaStitch
        caixa={caixaParaTroca}
        onFechar={() => setCaixaParaTroca(null)}
        onConfirmar={handleConfirmarTroca}
      />

      <ModalConfirmarDestinacao
        aberto={modalDestinacaoAberto}
        onFechar={() => setModalDestinacaoAberto(false)}
        onSucesso={() => setToastMsg('Destinação confirmada! Caixa liberada no inventário.')}
      />

      <ToastVCP mensagem={toastMsg} onFechar={() => setToastMsg(null)} />
    </div>
  );
};

export default App;
