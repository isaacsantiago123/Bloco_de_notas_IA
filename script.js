
const CHAVE_STORAGE = "meu-bloco-notas-diario-v1";

const tituloDia = document.querySelector("#tituloDia");
const textoTarefa = document.querySelector("#textoTarefa");
const periodo = document.querySelector("#periodo");
const botaoAdicionar = document.querySelector("#adicionarTarefa");
const contador = document.querySelector("#contador");
const progresso = document.querySelector("#progresso");

// Carrega as tarefas salvas no navegador.
function carregarDados() {
  try {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);
    return dadosSalvos
      ? JSON.parse(dadosSalvos)
      : { titulo: "", tarefas: [] };
  } catch (erro) {
    return { titulo: "", tarefas: [] };
  }
}

let dados = carregarDados();
let tarefas = dados.tarefas;

// Salva o título e as tarefas.
function salvarDados() {
  localStorage.setItem(
    CHAVE_STORAGE,
    JSON.stringify({
      titulo: tituloDia.value,
      tarefas: tarefas
    })
  );
}

// Adiciona uma nova tarefa.
function adicionarTarefa() {
  const texto = textoTarefa.value.trim();

  if (texto === "") {
    textoTarefa.focus();
    return;
  }

  tarefas.push({
    id: Date.now() + Math.random(),
    texto: texto,
    periodo: periodo.value,
    concluida: false
  });

  textoTarefa.value = "";
  textoTarefa.focus();

  salvarDados();
  renderizarTarefas();
}

// Marca ou desmarca uma tarefa.
function alternarConclusao(id) {
  tarefas = tarefas.map(function(tarefa) {
    if (tarefa.id === id) {
      return {
        ...tarefa,
        concluida: !tarefa.concluida
      };
    }

    return tarefa;
  });

  salvarDados();
  renderizarTarefas();
}

// Exclui uma tarefa.
function excluirTarefa(id) {
  tarefas = tarefas.filter(function(tarefa) {
    return tarefa.id !== id;
  });

  salvarDados();
  renderizarTarefas();
}

// Mostra as tarefas nos períodos corretos.
function renderizarTarefas() {
  const periodos = ["manha", "tarde", "noite"];

  periodos.forEach(function(nomePeriodo) {
    const lista = document.querySelector(
      "#lista-" + nomePeriodo
    );

    const mensagemVazia = document.querySelector(
      "#vazio-" + nomePeriodo
    );

    lista.replaceChildren();

    const tarefasDoPeriodo = tarefas.filter(
      function(tarefa) {
        return tarefa.periodo === nomePeriodo;
      }
    );

    mensagemVazia.hidden = tarefasDoPeriodo.length > 0;

    tarefasDoPeriodo.forEach(function(tarefa) {
      const item = document.createElement("li");
      item.className = "tarefa";

      if (tarefa.concluida) {
        item.classList.add("concluida");
      }

      // Quadradinho para concluir a tarefa.
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = tarefa.concluida;

      checkbox.addEventListener("change", function() {
        alternarConclusao(tarefa.id);
      });

      // Texto da tarefa.
      const texto = document.createElement("span");
      texto.className = "texto-tarefa";
      texto.textContent = tarefa.texto;

      // Botão para excluir a tarefa.
      const botaoExcluir = document.createElement("button");
      botaoExcluir.className = "excluir";
      botaoExcluir.type = "button";
      botaoExcluir.textContent = "×";
      botaoExcluir.title = "Excluir tarefa";

      botaoExcluir.addEventListener("click", function() {
        excluirTarefa(tarefa.id);
      });

      item.append(checkbox, texto, botaoExcluir);
      lista.appendChild(item);
    });
  });

  // Calcula quantas tarefas foram concluídas.
  const concluidas = tarefas.filter(
    function(tarefa) {
      return tarefa.concluida;
    }
  ).length;

  contador.textContent =
    concluidas + " de " + tarefas.length +
    " tarefas concluídas";

  const porcentagem = tarefas.length === 0
    ? 0
    : (concluidas / tarefas.length) * 100;

  progresso.style.width = porcentagem + "%";
}

// Eventos dos botões e campos.
botaoAdicionar.addEventListener("click", adicionarTarefa);

textoTarefa.addEventListener("keydown", function(evento) {
  if (evento.key === "Enter") {
    adicionarTarefa();
  }
});

tituloDia.addEventListener("input", salvarDados);

// Remove somente as tarefas concluídas.
document
  .querySelector("#limparConcluidas")
  .addEventListener("click", function() {
    tarefas = tarefas.filter(function(tarefa) {
      return !tarefa.concluida;
    });

    salvarDados();
    renderizarTarefas();
  });

// Remove todas as tarefas após confirmação.
document
  .querySelector("#limparTudo")
  .addEventListener("click", function() {
    if (tarefas.length === 0) return;

    const confirmar = window.confirm(
      "Deseja realmente apagar todas as tarefas?"
    );

    if (confirmar) {
      tarefas = [];
      salvarDados();
      renderizarTarefas();
    }
  });

// Recupera o título e mostra as tarefas ao abrir a página.
tituloDia.value = dados.titulo;
renderizarTarefas();
