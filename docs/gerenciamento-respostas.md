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
  var cursoPart = normalizarTexto(curso);
  var modalidadePart = normalizarTexto(modalidade);
  
  // Tratamento especial para o Caderno
  var cadernoTexto = String(caderno).trim().toUpperCase();
  var cadernoPart = "";

  if (cadernoTexto === "CADERNO ÚNICO" || cadernoTexto === "CADERNO UNICO") {
    cadernoPart = "UNICO";
  } else {
    var semCaderno = cadernoTexto.replace("CADERNO", "").trim();
    cadernoPart = normalizarTexto(semCaderno);
  }
  
  var idProva = ano + "_" + cursoPart + "_" + modalidadePart + "_" + cadernoPart;

  // Retorna o objeto com o ID para validação e a estrutura exata das colunas (A até G)
  return {
    idResposta: idResposta,
    idProva: idProva,
    questaoNum: String(questaoNum).trim(),
    tipo: String(tipo).trim().toUpperCase(),
    dados: [idResposta, idProva, questaoNum, tipo, nomeCompleto, assunto, urlVideoOriginal]
  };
}

/**
 * Processa a nova resposta vinda do formulário.
 */
function processarNovaResposta(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetForm = ss.getSheetByName("Form_Responses");
  var sheetGerenciamento = ss.getSheetByName("Gerenciamento_Respostas");
  
  var lastRow = sheetForm.getLastRow();
  var rowData = sheetForm.getRange(lastRow, 1, 1, 16).getValues()[0];
  
  var resultado = criarLinhaDestino(rowData, ss.getSpreadsheetTimeZone());
  
  // Mapeamento reduzido: resultado.dados (A-G) + H("") -> Total: 8 colunas (A coluna I fica a cargo da ArrayFormula)
  var linhaCompleta = resultado.dados.concat([""]);
  
  // Busca a próxima linha vazia real e insere os dados de A até H
  var nextRow = obterProximaLinhaVazia(sheetGerenciamento, 1);
  sheetGerenciamento.getRange(nextRow, 1, 1, linhaCompleta.length).setValues([linhaCompleta]);
}

/**
 * Varre o histórico do formulário e preenche dados retroativos ausentes no gerenciamento.
 */
function preencherRetroativo() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetForm = ss.getSheetByName("Form_Responses");
  var sheetGerenciamento = ss.getSheetByName("Gerenciamento_Respostas");
  
  var existingIds = new Set();
  var lastRowGere = sheetGerenciamento.getLastRow();
  if (lastRowGere > 1) {
    sheetGerenciamento.getRange(2, 1, lastRowGere - 1, 1).getValues().forEach(function(row) {
      if (row[0]) existingIds.add(String(row[0]));
    });
  }
  
  var lastRowForm = sheetForm.getLastRow();
  if (lastRowForm < 2) {
    Logger.log("Nenhum dado encontrado na aba Form_Responses.");
    return;
  }
  
  var allFormData = sheetForm.getRange(2, 1, lastRowForm - 1, 16).getValues();
  var rowsToAppend = [];
  var timeZone = ss.getSpreadsheetTimeZone();
  
  for (var i = 0; i < allFormData.length; i++) {
    var rowData = allFormData[i];
    if (!rowData[0]) continue;
    
    var resultado = criarLinhaDestino(rowData, timeZone);
    if (existingIds.has(resultado.idResposta)) {
      continue;
    }
    
    // Mapeamento reduzido: resultado.dados (A-G) + H("") -> Total: 8 colunas (A coluna I fica a cargo da ArrayFormula)
    var linhaCompleta = resultado.dados.concat([""]);
    
    rowsToAppend.push(linhaCompleta);
  }
  
  if (rowsToAppend.length > 0) {
    // Busca a próxima linha vazia real na coluna A para iniciar o lote
    var nextRow = obterProximaLinhaVazia(sheetGerenciamento, 1);
    // Gravação limitada a 8 colunas de largura (A até H), respeitando a ArrayFormula em I
    sheetGerenciamento.getRange(nextRow, 1, rowsToAppend.length, 8).setValues(rowsToAppend);
    Logger.log(rowsToAppend.length + " respostas antigas foram importadas com sucesso!");
  } else {
    Logger.log("Tudo atualizado! Nenhuma resposta nova para importar retroativamente.");
  }
}

/**
 * FUNÇÃO AUXILIAR: Encontra a próxima linha vazia real com base em uma coluna específica.
 * Essencial para evitar que o script pule linhas caso colunas laterais possuam fórmulas estendidas.
 */
function obterProximaLinhaVazia(sheet, coluna) {
  var col = coluna || 1; 
  var lastRow = sheet.getLastRow();
  if (lastRow === 0) return 1;
  
  var valores = sheet.getRange(1, col, lastRow, 1).getValues();
  
  for (var i = valores.length - 1; i >= 0; i--) {
    if (valores[i][0] !== "") {
      return i + 2; 
    }
  }
  return 1; 
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