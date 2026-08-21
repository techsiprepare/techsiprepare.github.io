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
 * Função auxiliar interna para gerar as informações de ID e estruturar os dados da linha.
 */
function criarLinhaDestino(rowData, timeZone) {
  var timestamp        = rowData[0];  // Coluna A (Envios)
  var emailPessoal     = rowData[1];  // Coluna B (Envios)
  var emailInst        = rowData[2];  // Coluna C (Envios)
  var nomeCompleto     = rowData[3];  // Coluna D (Envios)
  var telefone         = rowData[4];  // Coluna E (Envios)
  var ra               = rowData[5];  // Coluna F (Envios)
  var periodo          = rowData[6];  // Coluna G (Envios)
  var curso            = rowData[7];  // Coluna H (Envios)
  var modalidade       = rowData[8];  // Coluna I (Envios)
  var ano              = rowData[9];  // Coluna J (Envios)
  var caderno          = rowData[10]; // Coluna K (Envios)
  var questaoNum       = rowData[11]; // Coluna L (Envios)
  var tipo             = rowData[12]; // Coluna M (Envios)
  var assunto          = rowData[13]; // Coluna N (Envios)
  var urlVideoOriginal = rowData[14]; // Coluna O (Envios)
  var autorizacao      = rowData[15]; // Coluna P (Envios)

  // 1. Geração do Ticket
  var idTicket = gerarIdTicket(timestamp, ra, questaoNum);

  // 2. Geração do ID_Prova
  var cursoPart = normalizarTexto(curso);
  var modalidadePart = normalizarTexto(modalidade);
  var cadernoTexto = String(caderno).trim().toUpperCase();
  var cadernoPart = (cadernoTexto === "CADERNO ÚNICO" || cadernoTexto === "CADERNO UNICO")
    ? "UNICO"
    : normalizarTexto(cadernoTexto.replace("CADERNO", "").trim());
  
  var idProva = ano + "_" + cursoPart + "_" + modalidadePart + "_" + cadernoPart;

  // Formatação de Data/Hora legível
  var dataFormatada = Utilities.formatDate(new Date(timestamp), timeZone, "dd/MM/yyyy HH:mm:ss");

  // Retorna os dados organizados para as Colunas A até N de Gerenciamento_Respostas
  return {
    idTicket: idTicket,
    dados: [
      idTicket,                             // A: Ticket
      dataFormatada,                        // B: Data/Hora
      emailPessoal,                         // C: Endereço de e-mail
      emailInst,                            // D: Email Institucional
      nomeCompleto,                         // E: Nome Completo
      telefone,                             // F: Telefone (WhatsApp)
      String(ra).trim(),                    // G: RA
      periodo,                              // H: Período
      idProva,                              // I: ID_Prova
      String(questaoNum).trim(),            // J: Questao_Num
      String(tipo).trim().toUpperCase(),    // K: Tipo
      assunto,                              // L: Assunto Principal
      urlVideoOriginal,                     // M: URL do Vídeo Original
      autorizacao                           // N: Autorização
    ]
  };
}

/**
 * Processa a nova resposta vinda do formulário principal (Formulário 1).
 */
function processarNovaResposta(e) {
  // 1. Proteção: Garante que só roda se o evento veio da aba 'Envios'
  if (!e || !e.range || e.range.getSheet().getName() !== "Envios") {
    return;
  }
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetGerenciamento = ss.getSheetByName("Gerenciamento_Respostas");
  
  // 2. Usa os dados do evento direto da resposta submetida (e.values)
  var rowData = e.values; 
  
  // Se por algum motivo e.values não vier preenchido, usa fallback da última linha
  if (!rowData || rowData.length === 0) {
    var sheetForm = ss.getSheetByName("Envios");
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
  var sheetForm = ss.getSheetByName("Envios");
  var sheetGerenciamento = ss.getSheetByName("Gerenciamento_Respostas");
  
  var existingTickets = new Set();
  var lastRowGere = sheetGerenciamento.getLastRow();
  if (lastRowGere > 1) {
    // Agora busca na Coluna 1 (A: Ticket) em vez de ID_Resposta
    sheetGerenciamento.getRange(2, 1, lastRowGere - 1, 1).getValues().forEach(function(row) {
      if (row[0]) existingTickets.add(String(row[0]));
    });
  }
  
  var lastRowForm = sheetForm.getLastRow();
  if (lastRowForm < 2) return;
  
  var allFormData = sheetForm.getRange(2, 1, lastRowForm - 1, 16).getValues();
  var rowsToAppend = [];
  var timeZone = ss.getSpreadsheetTimeZone();
  
  for (var i = 0; i < allFormData.length; i++) {
    var rowData = allFormData[i];
    if (!rowData[0]) continue;
    
    var resultado = criarLinhaDestino(rowData, timeZone);
    if (existingTickets.has(resultado.idTicket)) {
      continue; // Evita inserir se o Ticket já existir
    }
    
    rowsToAppend.push(resultado.dados);
  }
  
  if (rowsToAppend.length > 0) {
    var nextRow = obterProximaLinhaVazia(sheetGerenciamento, 1);
    // Insere as 14 colunas geradas
    sheetGerenciamento.getRange(nextRow, 1, rowsToAppend.length, 14).setValues(rowsToAppend);
    Logger.log(rowsToAppend.length + " respostas antigas foram importadas com sucesso!");
  } else {
    Logger.log("Tudo atualizado! Nenhuma resposta nova para importar retroativamente.");
  }
}

/**
 * FUNÇÃO AUXILIAR: Encontra a próxima linha vazia real com base na coluna de Ticket (Coluna A).
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