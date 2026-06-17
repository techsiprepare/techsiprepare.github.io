/**
 * Função global para normalizar textos removendo acentos e caracteres especiais.
 * Remove TODOS os espaços em branco (junta as palavras), ideal para Curso e Modalidade.
 */
function normalizarTexto(texto) {
  if (!texto) return "";
  return String(texto)
    .normalize("NFD")                           // Separa os acentos das letras
    .replace(/[\u0300-\u036f]/g, "")            // Remove os acentos
    .toUpperCase()                              // Transforma tudo em maiúsculas
    .replace(/\s+/g, "")                        // Remove todos os espaços em branco (junta as palavras)
    .replace(/[^A-Z0-9_]/g, "");                // Remove qualquer caractere que não seja letra, número ou underline
}

/**
 * Função auxiliar interna para gerar as informações de ID e estruturar os dados da linha.
 */
function criarLinhaDestino(rowData, timeZone) {
  var timestamp        = rowData[0];  // Coluna A
  var nomeCompleto     = rowData[3];  // Coluna D
  var ra               = rowData[5];  // Coluna F
  var curso            = rowData[7];  // Coluna H
  var modalidade       = rowData[8];  // Coluna I
  var ano              = rowData[9];  // Coluna J
  var caderno          = rowData[10]; // Coluna K
  var questaoNum       = rowData[11]; // Coluna L
  var tipo             = rowData[12]; // Coluna M
  var assunto          = rowData[13]; // Coluna N
  var urlVideoOriginal = rowData[14]; // Coluna O

  // 1. Geração do ID_Resposta (YYYYMMDD_HHMMSS_RA)
  var formattedDate = Utilities.formatDate(new Date(timestamp), timeZone, "yyyyMMdd_HHmmss");
  var idResposta = normalizarTexto(formattedDate + "_" + ra);

  // 2. Geração do ID_Prova
  var cursoPart = normalizarTexto(curso);           // "TECNOLOGIA EM ANALISE..." vira "TECNOLOGIAEMANALISE..."
  var modalidadePart = normalizarTexto(modalidade); // "TECNOLOGO" vira "TECNOLOGO"
  
  // Tratamento especial para o Caderno
  var cadernoTexto = String(caderno).trim().toUpperCase();
  var cadernoPart = "";

  // Se for Caderno Único (com ou sem acento), vira apenas UNICO
  if (cadernoTexto === "CADERNO ÚNICO" || cadernoTexto === "CADERNO UNICO") {
    cadernoPart = "UNICO";
  } else {
    // Caso seja outro caderno (ex: "Caderno Alfa"), remove a palavra "CADERNO" e limpa o resto
    var semCaderno = cadernoTexto.replace("CADERNO", "").trim();
    cadernoPart = normalizarTexto(semCaderno);
  }
  
  // Junta tudo com um único underline entre as partes principais
  var idProva = ano + "_" + cursoPart + "_" + modalidadePart + "_" + cadernoPart;

  // 3. Montagem da URL para a coluna L (Ver_Questão_Site)
  var tipoUrl = String(tipo).trim();
  if (tipoUrl.length > 0) {
    // Formata para Capitalized (ex: "DISCURSIVA" vira "Discursiva")
    tipoUrl = tipoUrl.charAt(0).toUpperCase() + tipoUrl.slice(1).toLowerCase();
  }
  var urlQuestao = "https://techsiprepare.github.io/#visualizar?prova=" + idProva + "&questao=" + String(questaoNum).trim() + "-" + tipoUrl;

  // Retorna o objeto com o ID para validação e a estrutura exata das colunas (A até G)
  return {
    idResposta: idResposta,
    idProva: idProva,
    questaoNum: String(questaoNum).trim(),
    tipo: String(tipo).trim().toUpperCase(),
    urlQuestao: urlQuestao,
    dados: [idResposta, idProva, questaoNum, tipo, nomeCompleto, assunto, urlVideoOriginal]
  };
}

/**
 * Função interna para carregar os mapas de validação das abas Provas_Enade e Questoes_Enade.
 */
function obterMapasValidacao(ss) {
  var sheetProvas = ss.getSheetByName("Provas_Enade");
  var sheetQuestoes = ss.getSheetByName("Questoes_Enade");
  
  var provasSet = new Set();
  var questoesSet = new Set();
  
  // Carrega Provas existentes (Coluna A)
  if (sheetProvas) {
    var lastRowP = sheetProvas.getLastRow();
    if (lastRowP > 0) {
      sheetProvas.getRange(1, 1, lastRowP, 1).getValues().forEach(function(row) {
        if (row[0]) provasSet.add(String(row[0]).trim());
      });
    }
  }
  
  // Carrega Questões existentes (Coluna A: ID_Prova, Coluna B: Num, Coluna C: Tipo)
  if (sheetQuestoes) {
    var lastRowQ = sheetQuestoes.getLastRow();
    if (lastRowQ > 0) {
      sheetQuestoes.getRange(1, 1, lastRowQ, 3).getValues().forEach(function(row) {
        if (row[0] && row[1] && row[2]) {
          var chaveQuestao = String(row[0]).trim() + "_" + String(row[1]).trim() + "_" + String(row[2]).trim().toUpperCase();
          questoesSet.add(chaveQuestao);
        }
      });
    }
  }
  
  return { provas: provasSet, questoes: questoesSet };
}

/**
 * Função interna que replica a exata lógica da fórmula de validação fornecida.
 */
function calcularStatusValidacao(idProva, questaoNum, tipo, mapas) {
  if (!idProva) return "";
  
  // Verifica se a prova existe na aba Provas_Enade
  if (!mapas.provas.has(idProva)) {
    return "❌ Prova não existe: [" + idProva + "]";
  }
  
  // Monta a chave combinada para checar na aba Questoes_Enade
  var chaveBuscar = idProva + "_" + questaoNum + "_" + tipo;
  if (!mapas.questoes.has(chaveBuscar)) {
    return "⚠️ Qst não existe: [" + idProva + "_" + questaoNum + "_" + tipo + "]";
  }
  
  return "✅ Válido (Prova e Questão existem)";
}

function processarNovaResposta(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetForm = ss.getSheetByName("Form_Responses");
  var sheetGerenciamento = ss.getSheetByName("Gerenciamento_Respostas");
  
  // Obtém a última linha inserida no formulário de respostas
  var lastRow = sheetForm.getLastRow();
  var rowData = sheetForm.getRange(lastRow, 1, 1, 16).getValues()[0];
  
  // Processa e estrutura os dados da nova linha
  var resultado = criarLinhaDestino(rowData, ss.getSpreadsheetTimeZone());
  
  // Obtém os mapas de validação atuais
  var mapas = obterMapasValidacao(ss);
  
  // Calcula o status com base nas regras solicitadas
  var statusValidacao = calcularStatusValidacao(resultado.idProva, resultado.questaoNum, resultado.tipo, mapas);
  
  // Mapeamento das colunas: 
  // resultado.dados (A-G) + H("") + I(status) + J("") + K("") + L(urlQuestao)
  var linhaCompleta = resultado.dados.concat(["", statusValidacao, "", "", resultado.urlQuestao]);
  
  // Encontra a próxima linha disponível na aba de gerenciamento e grava de uma vez (A-L)
  var nextRow = sheetGerenciamento.getLastRow() + 1;
  sheetGerenciamento.getRange(nextRow, 1, 1, linhaCompleta.length).setValues([linhaCompleta]);
}

function preencherRetroativo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetForm = ss.getSheetByName("Form_Responses");
  var sheetGerenciamento = ss.getSheetByName("Gerenciamento_Respostas");
  
  // 1. Mapeia os IDs que JÁ EXISTEM no Gerenciamento usando um Set para busca ultra rápida
  var existingIds = new Set();
  var lastRowGere = sheetGerenciamento.getLastRow();
  if (lastRowGere > 1) {
    sheetGerenciamento.getRange(2, 1, lastRowGere - 1, 1).getValues().forEach(function(row) {
      if (row[0]) existingIds.add(String(row[0]));
    });
  }
  
  // 2. Pega todos os dados históricos da aba Form_Responses
  var lastRowForm = sheetForm.getLastRow();
  if (lastRowForm < 2) {
    Logger.log("Nenhum dado encontrado na aba Form_Responses.");
    return;
  }
  
  var allFormData = sheetForm.getRange(2, 1, lastRowForm - 1, 16).getValues();
  var rowsToAppend = [];
  var timeZone = ss.getSpreadsheetTimeZone();
  
  // Carrega os mapas de validação para processamento em lote
  var mapas = obterMapasValidacao(ss);
  
  // 3. Percorre cada linha histórica do formulário
  for (var i = 0; i < allFormData.length; i++) {
    var rowData = allFormData[i];
    
    // Ignora linhas sem timestamp
    if (!rowData[0]) continue;
    
    // Processa a linha usando a função estruturada
    var resultado = criarLinhaDestino(rowData, timeZone);
    
    // Se o ID já existir no Set da aba Gerenciamento, pula (evita duplicados)
    if (existingIds.has(resultado.idResposta)) {
      continue;
    }
    
    // Calcula a validação para o histórico
    var statusValidacao = calcularStatusValidacao(resultado.idProva, resultado.questaoNum, resultado.tipo, mapas);
    
    // Mapeamento das colunas: 
    // resultado.dados (A-G) + H("") + I(status) + J("") + K("") + L(urlQuestao)
    var linhaCompleta = resultado.dados.concat(["", statusValidacao, "", "", resultado.urlQuestao]);
    
    rowsToAppend.push(linhaCompleta);
  }
  
  // 4. Grava os dados novos em lote (Batch Update) no final da planilha
  if (rowsToAppend.length > 0) {
    var nextRow = sheetGerenciamento.getLastRow() + 1;
    // O range agora considera 12 colunas (de A até L)
    sheetGerenciamento.getRange(nextRow, 1, rowsToAppend.length, 12).setValues(rowsToAppend);
    Logger.log(rowsToAppend.length + " respostas antigas foram importadas, validadas e atualizadas com links na coluna L com sucesso!");
  } else {
    Logger.log("Tudo atualizado! Nenhuma resposta nova para importar retroativamente.");
  }
}

/**
 * Filtra a aba Gerenciamento_Respostas para exibir APENAS as linhas de questões 
 * que possuem 2 ou mais respostas registradas no total, independentemente de quem respondeu.
 */
function exibirRespostasDaMesmaQuestao() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetGerenciamento = ss.getSheetByName("Gerenciamento_Respostas");
  
  if (!sheetGerenciamento) {
    Logger.log("Aba Gerenciamento_Respostas não encontrada.");
    return;
  }
  
  var lastRow = sheetGerenciamento.getLastRow();
  if (lastRow <= 1) {
    Logger.log("Planilha vazia ou contém apenas o cabeçalho.");
    return; 
  }
  
  // 1. Limpa qualquer ocultação anterior para ler a planilha completa
  sheetGerenciamento.showRows(1, lastRow);
  
  // Pega os dados das colunas B, C e D (ID_Prova, Num, Tipo) onde a questão é definida
  var range = sheetGerenciamento.getRange(2, 2, lastRow - 1, 3);
  var values = range.getValues();
  
  var contagemQuestoes = {};
  var chavesPorLinha = [];
  
  // Passo 1: Mapear e contar quantas respostas cada QUESTÃO recebeu no total
  for (var i = 0; i < values.length; i++) {
    var idProva    = String(values[i][0]).trim(); // Coluna B
    var questaoNum = String(values[i][1]).trim(); // Coluna C
    var tipo       = String(values[i][2]).trim().toUpperCase(); // Coluna D
    
    // A chave agora identifica estritamente A PERGUNTA
    var chaveQuestao = idProva + "|" + questaoNum + "|" + tipo;
    chavesPorLinha.push(chaveQuestao);
    
    if (!contagemQuestoes[chaveQuestao]) {
      contagemQuestoes[chaveQuestao] = 0;
    }
    contagemQuestoes[chaveQuestao]++;
  }
  
  // Passo 2: Ocultar em lotes as linhas das questões que só possuem 1 resposta única
  var inicioBlocoOcultar = -1;
  var tamanhoBloco = 0;
  
  for (var j = 0; j < chavesPorLinha.length; j++) {
    var numLinhaPlanilha = j + 2; // +2 compensa o cabeçalho
    var chaveAtual = chavesPorLinha[j];
    
    // Se a questão só foi respondida uma única vez na planilha toda, ela sai da tela
    if (contagemQuestoes[chaveAtual] === 1) {
      if (inicioBlocoOcultar === -1) {
        inicioBlocoOcultar = numLinhaPlanilha;
        tamanhoBloco = 1;
      } else {
        tamanhoBloco++;
      }
    } else {
      // Se a questão tem 2 ou mais respostas (mesmo ou diferentes alunos), ela fica visível.
      // Caso estivéssemos acumulando um bloco para ocultar, aplica a ação agora.
      if (inicioBlocoOcultar !== -1) {
        sheetGerenciamento.hideRows(inicioBlocoOcultar, tamanhoBloco);
        inicioBlocoOcultar = -1;
        tamanhoBloco = 0;
      }
    }
  }
  
  // Limpa o último bloco pendente se a planilha terminar em linhas ocultas
  if (inicioBlocoOcultar !== -1) {
    sheetGerenciamento.hideRows(inicioBlocoOcultar, tamanhoBloco);
  }
  
  Logger.log("Filtro aplicado! Exibindo apenas perguntas que possuem múltiplas respostas.");
}

/**
 * Remove o filtro de questões, voltando a exibir todas as linhas da planilha.
 */
function mostrarTodasAsRespostas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetGerenciamento = ss.getSheetByName("Gerenciamento_Respostas");
  
  if (!sheetGerenciamento) return;
  
  var lastRow = sheetGerenciamento.getLastRow();
  if (lastRow > 0) {
    sheetGerenciamento.showRows(1, lastRow);
    Logger.log("Filtro removido. Todas as respostas voltaram a ser exibidas.");
  }
}