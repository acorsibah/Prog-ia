/**
 * Camada de Dados e Regras de Negócio (Serviço de Demandas)
 * Controla persistência assíncrona, caixas de giro, exportação de planilha e oficina.
 */
class ServicoDemandas {
  static CHAVE_STORAGE = 'demandas_operacionais_db';
  static LIMITE_GIRO = 2;

  // Obtém todas as demandas salvas tratando falhas com resiliência
  static async obterTodas() {
    return new Promise((resolve) => {
      try {
        const dados = localStorage.getItem(ServicoDemandas.CHAVE_STORAGE);
        resolve(dados ? JSON.parse(dados) : []);
      } catch (erro) {
        console.error('Falha ao ler dados locais:', erro);
        resolve([]);
      }
    });
  }

  // Localiza uma demanda específica pelo seu identificador
  static async obterPorId(id) {
    const demandas = await ServicoDemandas.obterTodas();
    return demandas.find((item) => item.id === id) || null;
  }

  // Encaminha a demanda para criação ou atualização
  static async salvar(dados) {
    const demandas = await ServicoDemandas.obterTodas();
    if (dados.id) {
      return ServicoDemandas.atualizar(demandas, dados);
    }
    return ServicoDemandas.inserir(demandas, dados);
  }

  // Cria um novo registro tratando pendência de troca na base
  static async inserir(demandas, dados) {
    const pendencia = dados.tipo === 'troca' ? 'pendente_base' : 'nenhuma';
    const novaDemanda = {
      ...dados,
      id: Date.now().toString(),
      statusPendencia: pendencia,
      criadoEm: new Date().toISOString()
    };
    demandas.unshift(novaDemanda);
    ServicoDemandas.persistir(demandas);
    return novaDemanda;
  }

  // Atualiza os dados de uma demanda já cadastrada
  static async atualizar(demandas, dados) {
    const indice = demandas.findIndex((item) => item.id === dados.id);
    if (indice === -1) throw new Error('Demanda não encontrada.');
    demandas[indice] = { ...demandas[indice], ...dados };
    ServicoDemandas.persistir(demandas);
    return demandas[indice];
  }

  // Remove uma demanda pelo seu identificador
  static async excluir(id) {
    const demandas = await ServicoDemandas.obterTodas();
    const filtradas = demandas.filter((item) => item.id !== id);
    ServicoDemandas.persistir(filtradas);
    return true;
  }

  // Grava com segurança o conjunto de demandas no LocalStorage
  static persistir(demandas) {
    localStorage.setItem(ServicoDemandas.CHAVE_STORAGE, JSON.stringify(demandas));
  }

  // Retorna caixas de troca paradas na base aguardando destinação
  static async obterPendenciasBase() {
    const demandas = await ServicoDemandas.obterTodas();
    return demandas.filter((item) => item.tipo === 'troca' && item.statusPendencia === 'pendente_base');
  }

  // Monta o objeto padronizado de destinação de resíduos
  static montarObjetoDestinacao(troca, destinoCTR) {
    return {
      id: (Date.now() + 1).toString(),
      tipo: 'destinacao',
      descricao: `Destinação: ${troca.descricao}`,
      quantidade: troca.quantidade || 1,
      data: new Date().toISOString().split('T')[0],
      observacoes: `Destinada para: ${destinoCTR}. Ref. troca original.`,
      statusPendencia: 'nenhuma',
      criadoEm: new Date().toISOString()
    };
  }

  // Dá baixa na pendência da base e gera a movimentação de destinação
  static async destinarCaixaPendente(idTroca, destinoCTR) {
    const demandas = await ServicoDemandas.obterTodas();
    const troca = demandas.find((item) => item.id === idTroca);
    if (!troca) return null;

    troca.statusPendencia = 'destinada';
    const novaDestinacao = ServicoDemandas.montarObjetoDestinacao(troca, destinoCTR);
    demandas.unshift(novaDestinacao);
    ServicoDemandas.persistir(demandas);
    return novaDestinacao;
  }

  // Exporta todas as informações cadastradas para planilha CSV (Excel)
  static async exportarPlanilha() {
    const demandas = await ServicoDemandas.obterTodas();
    const cabecalho = 'ID;Data;Tipo de Operacao;Descricao / Local;Qtd;Litros;KM;Motivo Manutencao;Observacoes;Status Base\n';
    let linhas = '';
    if (demandas.length === 0) {
      linhas = '1;' + new Date().toLocaleDateString('pt-BR') + ';Sem Registros;Nenhuma demanda realizada ainda;0;;;;;';
    } else {
      linhas = demandas.map((d) => ServicoDemandas.formatarLinhaCSV(d)).join('\n');
    }
    ServicoDemandas.dispararDownload(cabecalho + linhas);
  }

  // Trata e formata uma linha única para o arquivo CSV
  static formatarLinhaCSV(d) {
    const tipo = ControladorUI.obterRotulo(d.tipo);
    const dataFmt = ControladorUI.formatarData(d.data);
    const desc = (d.descricao || '').replace(/;/g, ',');
    const obs = (d.observacoes || '').replace(/;/g, ',').replace(/\n/g, ' ');
    const mot = (d.motivoManutencao || '').replace(/;/g, ',');
    const lit = d.litros ? String(d.litros).replace('.', ',') : '';
    const km = d.km !== null ? d.km : '';
    return `${d.id};${dataFmt};${tipo};${desc};${d.quantidade};${lit};${km};${mot};${obs};${d.statusPendencia || ''}`;
  }

  // Cria o arquivo Blob com codificação UTF-8 e inicia o download
  static dispararDownload(conteudo) {
    const nome = `Agenda_EcoLog_Demandas_${new Date().toISOString().split('T')[0]}.csv`;
    try {
      const blob = new Blob(['\uFEFF' + conteudo], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nome;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 3000);
    } catch (erro) {
      window.open('data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(conteudo), '_blank');
    }
  }
}

/**
 * Camada de Interface do Usuário (Controlador DOM)
 * Gerencia a agenda, estilização por cores específicas e validações.
 */
class ControladorUI {
  // Inicializa o sistema ao carregar a página
  static inicializar() {
    ControladorUI.configurarDataAtual();
    ControladorUI.definirDataPadrao();
    ControladorUI.registrarEventos();
    ControladorUI.atualizarInterface();
  }

  // Registra os ouvintes de eventos da interface
  static registrarEventos() {
    document.getElementById('formulario-demanda').addEventListener('submit', ControladorUI.aoSubmeterFormulario);
    document.getElementById('btn-cancelar').addEventListener('click', ControladorUI.cancelarEdicao);
    document.getElementById('campo-tipo').addEventListener('change', ControladorUI.aoAlterarTipo);
    document.getElementById('filtro-data').addEventListener('change', ControladorUI.atualizarLista);
    document.getElementById('filtro-tipo').addEventListener('change', ControladorUI.atualizarLista);
    document.getElementById('btn-limpar-filtros').addEventListener('click', ControladorUI.limparFiltros);
    document.getElementById('btn-exportar-planilha').addEventListener('click', () => ServicoDemandas.exportarPlanilha());
  }

  // Alterna a visibilidade dos blocos específicos de acordo com o tipo
  static aoAlterarTipo() {
    const tipo = document.getElementById('campo-tipo').value;
    document.getElementById('bloco-abastecimento').classList.toggle('oculto', tipo !== 'abastecimento');
    document.getElementById('bloco-manutencao').classList.toggle('oculto', tipo !== 'manutencao');
    ControladorUI.ajustarRotulosDinamicos(tipo);
  }

  // Configura placeholders e rótulos com base na operação selecionada
  static ajustarRotulosDinamicos(tipo) {
    const rotulo = document.getElementById('rotulo-descricao');
    const campo = document.getElementById('campo-descricao');
    if (tipo === 'abastecimento') {
      rotulo.textContent = 'Posto / Placa do Caminhão *';
      campo.placeholder = 'Ex: Posto BR-101 / Placa ABC-1234';
    } else if (tipo === 'manutencao') {
      rotulo.textContent = 'Caminhão / Oficina / Mecânica *';
      campo.placeholder = 'Ex: Caminhão RO-03 (Placa ABC-1234) / Oficina São Jorge';
    } else {
      rotulo.textContent = 'Cliente / Obra / Identificação *';
      campo.placeholder = 'Ex: Obra Vale Verde - Caixa Roll-On 28m³';
    }
  }

  // Exibe a data atual formatada no cabeçalho
  static configurarDataAtual() {
    const opcoes = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
    const texto = new Intl.DateTimeFormat('pt-BR', opcoes).format(new Date());
    document.getElementById('data-atual-rotulo').textContent = texto;
  }

  // Define a data de hoje como valor inicial no campo de data
  static definirDataPadrao() {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('campo-data').value = hoje;
  }

  // Processa a submissão validando dados e capacidade de giro
  static async aoSubmeterFormulario(evento) {
    evento.preventDefault();
    const dados = ControladorUI.obterValoresFormulario();
    const pendencias = await ServicoDemandas.obterPendenciasBase();

    if (!ControladorUI.validarDados(dados, pendencias)) return;

    await ServicoDemandas.salvar(dados);
    ControladorUI.limparFormulario();
    await ControladorUI.atualizarInterface();
  }

  // Captura os valores informados nos campos do formulário
  static obterValoresFormulario() {
    return {
      id: document.getElementById('campo-id').value || null,
      tipo: document.getElementById('campo-tipo').value,
      descricao: document.getElementById('campo-descricao').value.trim(),
      quantidade: parseInt(document.getElementById('campo-quantidade').value, 10),
      data: document.getElementById('campo-data').value,
      observacoes: document.getElementById('campo-observacoes').value.trim(),
      litros: parseFloat(document.getElementById('campo-litros').value) || null,
      km: parseInt(document.getElementById('campo-km').value, 10) || null,
      motivoManutencao: document.getElementById('campo-motivo-manutencao').value.trim()
    };
  }

  // Valida campos gerais, tamanhos seguros e limite de giro
  static validarDados(dados, pendencias) {
    if (!dados.tipo || !dados.descricao || !dados.data || dados.quantidade <= 0) {
      alert('Preencha os campos obrigatórios com valores válidos.');
      return false;
    }
    if (dados.descricao.length > 200 || dados.observacoes.length > 1000) {
      alert('O tamanho do texto inserido excedeu o limite seguro.');
      return false;
    }
    if (dados.tipo === 'troca' && !dados.id && pendencias.length >= ServicoDemandas.LIMITE_GIRO) {
      alert('Limite de giro atingido! Destine uma caixa parada antes de novas trocas.');
      return false;
    }
    return ControladorUI.validarCamposEspecificos(dados);
  }

  // Valida regras específicas para abastecimento e manutenção
  static validarCamposEspecificos(dados) {
    if (dados.tipo === 'abastecimento' && (!dados.litros || dados.litros <= 0 || dados.km === null || dados.km < 0)) {
      alert('Para abastecimento, informe os litros (>0) e o KM atual do momento.');
      return false;
    }
    if (dados.tipo === 'manutencao' && !dados.motivoManutencao) {
      alert('Para parada do caminhão, informe o motivo ou tipo de manutenção.');
      return false;
    }
    return true;
  }

  // Converte caracteres reservados em entidades seguras contra XSS
  static sanitizarHTML(texto) {
    if (!texto) return '';
    const entidades = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(texto).replace(/[&<>"']/g, (caractere) => entidades[caractere]);
  }

  // Sincroniza todos os módulos visuais da tela
  static async atualizarInterface() {
    const pendencias = await ServicoDemandas.obterPendenciasBase();
    ControladorUI.atualizarMonitorGiro(pendencias);
    ControladorUI.atualizarPendencias(pendencias);
    await ControladorUI.atualizarLista();
  }

  // Atualiza o monitor gráfico compacto das caixas de giro
  static atualizarMonitorGiro(pendencias) {
    const qtdOcupadas = pendencias.length;
    const textoStatus = document.getElementById('texto-status-giro');
    const alerta = document.getElementById('alerta-giro-lotado');
    const p1 = document.getElementById('slot-1-pill');
    const p2 = document.getElementById('slot-2-pill');

    textoStatus.textContent = qtdOcupadas === 0 ? '2 Caixas Livres' : qtdOcupadas === 1 ? '1 Ocupada na Base • 1 Livre' : 'Giro Lotado (2/2 Cheias)';
    alerta.classList.toggle('oculto', qtdOcupadas < ServicoDemandas.LIMITE_GIRO);

    ControladorUI.configurarPillSlot(p1, 1, pendencias[0] || null);
    ControladorUI.configurarPillSlot(p2, 2, pendencias[1] || null);
  }

  // Configura visualmente o pill de cada slot de giro
  static configurarPillSlot(elemento, num, pendencia) {
    if (pendencia) {
      elemento.classList.add('ocupado');
      elemento.textContent = `Caixa ${num}: Ocupada (${pendencia.descricao})`;
    } else {
      elemento.classList.remove('ocupado');
      elemento.textContent = `Caixa ${num}: Livre`;
    }
  }

  // Atualiza a seção visual de caixas pendentes de destinação
  static atualizarPendencias(pendencias) {
    const container = document.getElementById('secao-pendencias-base');
    const grade = document.getElementById('lista-pendencias-base');
    const contador = document.getElementById('contador-pendencias');
    grade.innerHTML = '';
    contador.textContent = `${pendencias.length} na base`;
    container.classList.toggle('oculto', pendencias.length === 0);

    pendencias.forEach((item) => grade.appendChild(ControladorUI.criarItemPendente(item)));
  }

  // Cria o item da lista de caixas paradas na base
  static criarItemPendente(item) {
    const div = document.createElement('div');
    const desc = ControladorUI.sanitizarHTML(item.descricao);
    div.className = 'item-pendente-agenda';
    div.innerHTML = `<div><strong>📦 ${desc}</strong> - Recolhida: ${ControladorUI.formatarData(item.data)}</div>
      <button class="btn-destinar-mini" data-id="${item.id}">♻️ Destinar (Liberar Giro)</button>`;
    div.querySelector('.btn-destinar-mini').addEventListener('click', () => ControladorUI.aoDestinarPendencia(item.id));
    return div;
  }

  // Realiza a destinação da caixa parada liberando o giro
  static async aoDestinarPendencia(id) {
    const destino = prompt('Local de destinação / aterro (ex: CTR Central):', 'CTR Central');
    if (!destino || !destino.trim()) return;

    await ServicoDemandas.destinarCaixaPendente(id, destino.trim());
    alert('Caixa destinada com sucesso! Giro liberado.');
    await ControladorUI.atualizarInterface();
  }

  // Carrega e filtra as demandas cadastradas (RF03)
  static async atualizarLista() {
    const demandas = await ServicoDemandas.obterTodas();
    const filtroData = document.getElementById('filtro-data').value;
    const filtroTipo = document.getElementById('filtro-tipo').value;

    const filtradas = ControladorUI.filtrar(demandas, filtroData, filtroTipo);
    ControladorUI.renderizarLista(filtradas);
  }

  // Aplica filtros de data e tipo às demandas
  static filtrar(demandas, data, tipo) {
    return demandas.filter((item) => {
      const matchData = !data || item.data === data;
      const matchTipo = tipo === 'todos' || item.tipo === tipo;
      return matchData && matchTipo;
    });
  }

  // Renderiza a lista de cards no DOM
  static renderizarLista(demandas) {
    const container = document.getElementById('lista-demandas');
    const msgVazia = document.getElementById('mensagem-vazia');
    container.innerHTML = '';

    if (demandas.length === 0) {
      msgVazia.classList.remove('oculto');
      return;
    }
    msgVazia.classList.add('oculto');
    demandas.forEach((d) => container.appendChild(ControladorUI.criarCard(d)));
  }

  // Monta a estrutura de cada card sanitizando textos (Anti-XSS)
  static criarCard(demanda) {
    const card = document.createElement('div');
    card.className = `item-agenda tipo-${demanda.tipo}`;
    card.innerHTML = ControladorUI.montarHtmlCard(demanda);
    ControladorUI.vincularBotoesCard(card, demanda.id);
    return card;
  }

  // Gera o HTML seguro do corpo do card de demanda no formato agenda
  static montarHtmlCard(demanda) {
    const desc = ControladorUI.sanitizarHTML(demanda.descricao);
    const obs = ControladorUI.sanitizarHTML(demanda.observacoes);
    const chips = ControladorUI.gerarChipsEspecificos(demanda);
    const rotulo = ControladorUI.obterRotulo(demanda.tipo);
    const dataFmt = ControladorUI.formatarData(demanda.data);
    const htmlObs = obs ? `<div class="agenda-obs">📋 ${obs}</div>` : '';
    const acoes = `<div class="acoes-item-agenda"><button class="btn-acao-agenda btn-acao-editar" data-id="${demanda.id}">Editar</button><button class="btn-acao-agenda btn-acao-excluir" data-id="${demanda.id}">Excluir</button></div>`;
    const topo = `<div class="cabecalho-item-agenda"><span class="tag-tipo">${rotulo}</span><span class="agenda-data-hora">📅 ${dataFmt}</span></div>`;
    return `<div class="corpo-agenda">${topo}<div class="agenda-titulo">${desc}</div>${chips}<div class="chip-dado">Qtd / Viagens: <strong>${demanda.quantidade}</strong></div>${htmlObs}</div>${acoes}`;
  }

  // Gera chips informativos para abastecimento (Cinza) ou manutenção (Vermelho)
  static gerarChipsEspecificos(demanda) {
    if (demanda.tipo === 'abastecimento' && demanda.litros) {
      return `<div class="agenda-chips-info">
        <span class="chip-dado">⛽ ${demanda.litros} L</span>
        <span class="chip-dado">🛣️ KM ${demanda.km}</span>
      </div>`;
    }
    if (demanda.tipo === 'manutencao' && demanda.motivoManutencao) {
      const motivo = ControladorUI.sanitizarHTML(demanda.motivoManutencao);
      return `<div class="agenda-chips-info">
        <span class="chip-dado chip-alerta-parada">⚠️ Parada: ${motivo}</span>
      </div>`;
    }
    return '';
  }

  // Associa os cliques de ação do card individual
  static vincularBotoesCard(card, id) {
    card.querySelector('.btn-acao-editar').addEventListener('click', () => ControladorUI.iniciarEdicao(id));
    card.querySelector('.btn-acao-excluir').addEventListener('click', () => ControladorUI.confirmarExclusao(id));
  }

  // Preenche o formulário com os dados da demanda para edição
  static async iniciarEdicao(id) {
    const item = await ServicoDemandas.obterPorId(id);
    if (!item) return;

    ControladorUI.preencherCamposEdicao(item);
    document.getElementById('titulo-formulario').textContent = 'Editar Registro na Agenda';
    document.getElementById('btn-salvar').textContent = 'Atualizar na Agenda';
    document.getElementById('btn-cancelar').classList.remove('oculto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Popula os inputs do formulário com os valores do item
  static preencherCamposEdicao(item) {
    document.getElementById('campo-id').value = item.id;
    document.getElementById('campo-tipo').value = item.tipo;
    ControladorUI.aoAlterarTipo();
    document.getElementById('campo-descricao').value = item.descricao;
    document.getElementById('campo-quantidade').value = item.quantidade;
    document.getElementById('campo-data').value = item.data;
    document.getElementById('campo-observacoes').value = item.observacoes || '';
    document.getElementById('campo-litros').value = item.litros || '';
    document.getElementById('campo-km').value = item.km !== null ? item.km : '';
    document.getElementById('campo-motivo-manutencao').value = item.motivoManutencao || '';
  }

  // Cancela o processo de edição atual
  static cancelarEdicao() {
    ControladorUI.limparFormulario();
  }

  // Restaura o formulário ao seu estado padrão
  static limparFormulario() {
    document.getElementById('formulario-demanda').reset();
    document.getElementById('campo-id').value = '';
    document.getElementById('campo-litros').value = '';
    document.getElementById('campo-km').value = '';
    document.getElementById('campo-motivo-manutencao').value = '';
    ControladorUI.definirDataPadrao();
    ControladorUI.aoAlterarTipo();
    document.getElementById('titulo-formulario').textContent = 'Nova Atividade na Agenda';
    document.getElementById('btn-salvar').textContent = '+ Salvar na Agenda';
    document.getElementById('btn-cancelar').classList.add('oculto');
  }

  // Solicita confirmação e remove a demanda
  static async confirmarExclusao(id) {
    if (confirm('Deseja realmente remover este registro da agenda?')) {
      await ServicoDemandas.excluir(id);
      await ControladorUI.atualizarInterface();
    }
  }

  // Limpa os filtros de pesquisa e restaura listagem
  static limparFiltros() {
    document.getElementById('filtro-data').value = '';
    document.getElementById('filtro-tipo').value = 'todos';
    ControladorUI.atualizarLista();
  }

  // Traduz o identificador do tipo para rótulo legível
  static obterRotulo(tipo) {
    const tipos = {
      troca: 'Troca',
      destinacao: 'Destinação',
      implantacao: 'Implantação',
      transporte_equipamentos: 'Transporte',
      manutencao: 'Parada do Caminhão',
      abastecimento: 'Abastecimento'
    };
    return tipos[tipo] || tipo;
  }

  // Converte data ISO para formato brasileiro
  static formatarData(dataIso) {
    if (!dataIso) return '';
    const [ano, mes, dia] = dataIso.split('-');
    return `${dia}/${mes}/${ano}`;
  }
}

// Inicialização da aplicação após o carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
  ControladorUI.inicializar();
});
