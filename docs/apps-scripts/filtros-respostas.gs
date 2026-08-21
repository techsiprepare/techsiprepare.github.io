/**
 * Filtra a aba Gerenciamento_Respostas para exibir APENAS as linhas de questões 
 * que possuem 2 ou mais respostas registradas no total.
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
  
  sheetGerenciamento.showRows(1, lastRow);
  
  var range = sheetGerenciamento.getRange(2, 9, lastRow - 1, 3);
  var values = range.getValues();
  
  var contagemQuestoes = {};
  var chavesPorLinha = [];
  
  for (var i = 0; i < values.length; i++) {
    var idProva    = String(values[i][0]).trim(); 
    var questaoNum = String(values[i][1]).trim(); 
    var tipo       = String(values[i][2]).trim().toUpperCase(); 
    
    var chaveQuestao = idProva + "|" + questaoNum + "|" + tipo;
    chavesPorLinha.push(chaveQuestao);
    
    if (!contagemQuestoes[chaveQuestao]) {
      contagemQuestoes[chaveQuestao] = 0;
    }
    contagemQuestoes[chaveQuestao]++;
  }
  
  var inicioBlocoOcultar = -1;
  var tamanhoBloco = 0;
  
  for (var j = 0; j < chavesPorLinha.length; j++) {
    var numLinhaPlanilha = j + 2;
    var chaveAtual = chavesPorLinha[j];
    
    if (contagemQuestoes[chaveAtual] === 1) {
      if (inicioBlocoOcultar === -1) {
        inicioBlocoOcultar = numLinhaPlanilha;
        tamanhoBloco = 1;
      } else {
        tamanhoBloco++;
      }
    } else {
      if (inicioBlocoOcultar !== -1) {
        sheetGerenciamento.hideRows(inicioBlocoOcultar, tamanhoBloco);
        inicioBlocoOcultar = -1;
        tamanhoBloco = 0;
      }
    }
  }
  
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