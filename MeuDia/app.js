// ============================================================
// Constantes e referências aos elementos do DOM
// ============================================================
const inputTarefa    = document.getElementById('inputTarefa');
const btnAdicionar   = document.getElementById('btnAdicionar');
const listaTarefas   = document.getElementById('listaTarefas');
const listaVazia     = document.getElementById('listaVazia');
const contadorTexto  = document.getElementById('contadorTexto');

// Chave usada para armazenar as tarefas no LocalStorage
const CHAVE_STORAGE = 'meuDia_tarefas';

// ============================================================
// Carrega as tarefas salvas ao iniciar a página
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const tarefasSalvas = carregarDoStorage();
  tarefasSalvas.forEach(tarefa => renderizarItem(tarefa));
  atualizarVisibilidade();
});

// ============================================================
// Evento do botão "Adicionar"
// ============================================================
btnAdicionar.addEventListener('click', adicionarTarefa);

// Também permite adicionar com a tecla Enter
inputTarefa.addEventListener('keydown', (evento) => {
  if (evento.key === 'Enter') adicionarTarefa();
});

// ============================================================
// Adiciona uma nova tarefa à lista
// ============================================================
function adicionarTarefa() {
  const texto = inputTarefa.value.trim();

  if (!texto) {
    alert('⚠️ Por favor, digite uma tarefa antes de adicionar!');
    inputTarefa.focus();
    return;
  }

  const novaTarefa = {
    id: Date.now(),
    texto,
    concluida: false,
  };

  salvarNoStorage(novaTarefa);
  renderizarItem(novaTarefa);
  atualizarVisibilidade();

  // Limpa e foca o campo após adicionar
  inputTarefa.value = '';
  inputTarefa.focus();
}

// ============================================================
// Renderiza um item na lista a partir de um objeto de tarefa
// ============================================================
function renderizarItem(tarefa) {
  const li = document.createElement('li');
  li.classList.add('item-tarefa');
  li.dataset.id = tarefa.id;

  if (tarefa.concluida) li.classList.add('concluida');

  // Checkbox para marcar como concluída
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.classList.add('checkbox-tarefa');
  checkbox.checked = tarefa.concluida;
  checkbox.addEventListener('change', () => alternarConclusao(tarefa.id, li));

  // Texto da tarefa
  const span = document.createElement('span');
  span.classList.add('texto-tarefa');
  span.textContent = tarefa.texto;

  // Botão de excluir (vermelho)
  const btnExcluir = document.createElement('button');
  btnExcluir.classList.add('btn-excluir');
  btnExcluir.textContent = 'Excluir';
  btnExcluir.addEventListener('click', () => excluirTarefa(tarefa.id, li));

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(btnExcluir);
  listaTarefas.appendChild(li);
}

// ============================================================
// Alterna o estado de conclusão de uma tarefa
// ============================================================
function alternarConclusao(id, elementoLi) {
  const tarefas = carregarDoStorage();
  const tarefa = tarefas.find(t => t.id === id);

  if (!tarefa) return;

  tarefa.concluida = !tarefa.concluida;
  elementoLi.classList.toggle('concluida', tarefa.concluida);

  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(tarefas));
  atualizarVisibilidade();
}

// ============================================================
// Remove uma tarefa da lista e do LocalStorage
// ============================================================
function excluirTarefa(id, elementoLi) {
  // Animação suave antes de remover
  elementoLi.style.opacity = '0';
  elementoLi.style.transform = 'translateX(20px)';
  elementoLi.style.transition = 'opacity 0.2s, transform 0.2s';

  setTimeout(() => {
    elementoLi.remove();

    const tarefas = carregarDoStorage();
    const tarefasAtualizadas = tarefas.filter(t => t.id !== id);
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(tarefasAtualizadas));

    atualizarVisibilidade();
  }, 200);
}

// ============================================================
// Atualiza o contador e exibe/oculta a mensagem de lista vazia
// ============================================================
function atualizarVisibilidade() {
  const tarefas = carregarDoStorage();
  const total = tarefas.length;

  // Atualiza texto do contador
  contadorTexto.textContent = total === 1 ? '1 tarefa' : `${total} tarefas`;

  // Exibe ou oculta a mensagem de lista vazia
  if (total === 0) {
    listaVazia.classList.remove('oculto');
  } else {
    listaVazia.classList.add('oculto');
  }
}

// ============================================================
// Funções auxiliares de LocalStorage
// ============================================================

/** Retorna o array de tarefas salvo no LocalStorage */
function carregarDoStorage() {
  const dados = localStorage.getItem(CHAVE_STORAGE);
  return dados ? JSON.parse(dados) : [];
}

/** Adiciona uma nova tarefa ao array salvo no LocalStorage */
function salvarNoStorage(novaTarefa) {
  const tarefas = carregarDoStorage();
  tarefas.push(novaTarefa);
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(tarefas));
}

