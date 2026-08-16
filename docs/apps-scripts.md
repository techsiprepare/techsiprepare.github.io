```Javascript
/**
 * Obtém o Pepper do Ticket armazenado nas Propriedades do Script.
 */
function obterTicketPepperSecret() {
  var secret = PropertiesService.getScriptProperties().getProperty("TICKET_PEPPER_SECRET");
  if (!secret) {
    throw new Error("A chave 'TICKET_PEPPER_SECRET' não foi configurada nas Propriedades do Script.");
  }
  return secret;
}

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
    .replace(/\s+/g, "")                        // Remove todos os espaços em branco
    .replace(/[^A-Z0-9_]/g, "");                // Remove caracteres especiais
}

/**
 * Gera um ID_Ticket seguro, curto e determinístico via SHA-256 (HMAC com Pepper).
 */
function gerarIdTicket(timestamp, ra, questaoNum) {
  var dataObj = (timestamp instanceof Date) ? timestamp : new Date(timestamp);
  var dataFormatada = Utilities.formatDate(dataObj, Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");

  var pepperSecret = obterTicketPepperSecret();
  var stringBase = pepperSecret + "_" + String(ra).trim() + "_" + String(questaoNum).trim() + "_" + dataFormatada;

  var rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256, 
    stringBase, 
    Utilities.Charset.UTF_8
  );

  var hexHash = rawHash.map(function(byte) {
    var v = (byte < 0 ? byte + 256 : byte).toString(16);
    return v.length === 1 ? "0" + v : v;
  }).join('');

  return "TK-" + hexHash.substring(0, 8).toUpperCase();
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

  // 1. Geração do ID_Resposta (YYYYMMDD_HHMMSS_RA) - Coluna A
  var formattedDate = Utilities.formatDate(new Date(timestamp), timeZone, "yyyyMMdd_HHmmss");
  var idResposta = normalizarTexto(formattedDate + "_" + ra);

  // 2. Geração do ID_Ticket (Hash Criptografado de Uso Público) - Coluna B
  var idTicket = gerarIdTicket(timestamp, ra, questaoNum);

  // 3. Geração do ID_Prova - Coluna C
  var cursoPart = normalizarTexto(curso);
  var modalidadePart = normalizarTexto(modalidade);
  
  var cadernoTexto = String(caderno).trim().toUpperCase();
  var cadernoPart = "";

  if (cadernoTexto === "CADERNO ÚNICO" || cadernoTexto === "CADERNO UNICO") {
    cadernoPart = "UNICO";
  } else {
    var semCaderno = cadernoTexto.replace("CADERNO", "").trim();
    cadernoPart = normalizarTexto(semCaderno);
  }
  
  var idProva = ano + "_" + cursoPart + "_" + modalidadePart + "_" + cadernoPart;

  // Retorna os dados mapeados para as Colunas A até H
  return {
    idResposta: idResposta,
    idTicket: idTicket,
    idProva: idProva,
    questaoNum: String(questaoNum).trim(),
    tipo: String(tipo).trim().toUpperCase(),
    dados: [idResposta, idTicket, idProva, questaoNum, tipo, nomeCompleto, assunto, urlVideoOriginal]
  };
}

/**
 * Processa a nova resposta vinda do formulário principal (Formulário 1).
 */
function processarNovaResposta(e) {
  // 1. Proteção: Garante que só roda se o evento veio da aba 'Form_Responses'
  if (!e || !e.range || e.range.getSheet().getName() !== "Form_Responses") {
    return;
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetGerenciamento = ss.getSheetByName("Gerenciamento_Respostas");
  
  // 2. Usa os dados do evento direto da resposta submetida (e.values)
  var rowData = e.values; 
  
  // Se por algum motivo e.values não vier preenchido, usa fallback da última linha
  if (!rowData || rowData.length === 0) {
    var sheetForm = ss.getSheetByName("Form_Responses");
    var lastRow = sheetForm.getLastRow();
    rowData = sheetForm.getRange(lastRow, 1, 1, 16).getValues()[0];
  }
  
  var resultado = criarLinhaDestino(rowData, ss.getSpreadsheetTimeZone());
  var linhaCompleta = resultado.dados;
  
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
    
    rowsToAppend.push(resultado.dados);
  }
  
  if (rowsToAppend.length > 0) {
    var nextRow = obterProximaLinhaVazia(sheetGerenciamento, 1);
    sheetGerenciamento.getRange(nextRow, 1, rowsToAppend.length, 8).setValues(rowsToAppend);
    Logger.log(rowsToAppend.length + " respostas antigas foram importadas com sucesso!");
  } else {
    Logger.log("Tudo atualizado! Nenhuma resposta nova para importar retroativamente.");
  }
}

/**
 * FUNÇÃO AUXILIAR: Encontra a próxima linha vazia real com base na coluna de ID_Resposta (Coluna A).
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
  
  var range = sheetGerenciamento.getRange(2, 3, lastRow - 1, 3);
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

/**
 * Acionador disparado ao enviar o Formulário de Reenvio (Formulário 2).
 */
function aoEnviarReenvio(e) {
  // Proteção: Garante que só roda se o evento veio da aba 'Reenvios'
  if (!e || !e.range || e.range.getSheet().getName() !== "Reenvios") {
    return;
  }

  var respostas = e.namedValues;
  if (!respostas) return;
  
  // Lê o valor digitado na pergunta "Ticket" do formulário de reenvio
  var idTicketEnviado = respostas["Ticket"] ? respostas["Ticket"][0].toString().trim() : "";
  if (!idTicketEnviado) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var abaGerenciamento = ss.getSheetByName("Gerenciamento_Respostas");
  
  var lastRowGere = abaGerenciamento.getLastRow();
  if (lastRowGere <= 1) return;

  // Busca os dados da Coluna B (Ticket) e Coluna L (Status - Coluna 12)
  var dadosPlanilha = abaGerenciamento.getRange(2, 2, lastRowGere - 1, 11).getValues();
  
  for (var i = 0; i < dadosPlanilha.length; i++) {
    var ticketAtual = dadosPlanilha[i][0].toString().trim(); // Coluna B
    var statusAtual = dadosPlanilha[i][10].toString().trim(); // Coluna L

    if (ticketAtual === idTicketEnviado) {
      // Confere se o status atual está como "devolvido para ajustes"
      if (statusAtual.toLowerCase() === "devolvido para ajustes") {
        abaGerenciamento.getRange(i + 2, 12).setValue("Pronto p/ Reanálise");
        
        atualizarValidacaoFormularioReenvio();
      }
      break;
    }
  }
}

/**
 * Atualiza dinamicamente a validação da pergunta "Ticket" no Formulário de Reenvio.
 * Permite apenas a digitação de tickets cujo status seja "Devolvido para ajustes".
 */
function atualizarValidacaoFormularioReenvio() {
  // ATENÇÃO: Substitua pelo ID que você copiou no Passo 1
  var FORM_ID = "1G9sXl7A-zjnA43bvj95t0qgUXuJeAGG5xEOrjvi57uM"; 
  
  var form;
  try {
    form = FormApp.openById(FORM_ID);
  } catch (e) {
    Logger.log("Erro ao abrir formulário. Verifique se o ID está correto: " + e.toString());
    return;
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var abaGerenciamento = ss.getSheetByName("Gerenciamento_Respostas");
  
  if (!abaGerenciamento) {
    Logger.log("Aba 'Gerenciamento_Respostas' não encontrada.");
    return;
  }

  var lastRow = abaGerenciamento.getLastRow();
  var ticketsPermitidos = [];

  if (lastRow > 1) {
    // Pega da Coluna B (Ticket - col 2) até a Coluna L (Status - col 12)
    var dados = abaGerenciamento.getRange(2, 2, lastRow - 1, 11).getValues();

    for (var i = 0; i < dados.length; i++) {
      var ticket = dados[i][0].toString().trim();      // Coluna B
      var status = dados[i][10].toString().trim();     // Coluna L
      
      // Filtra apenas os tickets válidos com o status correto
      if (status.toLowerCase() === "devolvido para ajustes" && ticket !== "") {
        ticketsPermitidos.push(ticket);
      }
    }
  }

  // Monta a expressão regular (ex: ^(TK-12345678|TK-87654321)$ )
  var pattern = ticketsPermitidos.length > 0 
    ? "^(" + ticketsPermitidos.join("|") + ")$" 
    : "^$"; // Padrão impossível de casar se não houver tickets pendentes

  // Define a mensagem de erro que vai aparecer para o usuário
  var textValidation = FormApp.createTextValidation()
    .requireTextMatchesPattern(pattern)
    .setHelpText("Ticket inválido, inexistente ou sem solicitação de ajuste ativa.")
    .build();

  // Localiza a pergunta com o título "Ticket" no formulário e aplica a regra
  var items = form.getItems(FormApp.ItemType.TEXT);
  var itemEncontrado = false;

  for (var j = 0; j < items.length; j++) {
    var item = items[j].asTextItem();
    if (item.getTitle().trim().toLowerCase() === "ticket") {
      item.setValidation(textValidation);
      itemEncontrado = true;
      Logger.log("Validação atualizada no Forms para " + ticketsPermitidos.length + " ticket(s) ativo(s).");
      break;
    }
  }

  if (!itemEncontrado) {
    Logger.log("Atenção: Não foi encontrada nenhuma pergunta do tipo 'Resposta curta' com o nome exato 'Ticket'.");
  }
}
```