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

  // Busca da Coluna A (1: Ticket) até a Coluna S (19: Status)
  var dadosPlanilha = abaGerenciamento.getRange(2, 1, lastRowGere - 1, 19).getValues();
  
  for (var i = 0; i < dadosPlanilha.length; i++) {
    var ticketAtual = dadosPlanilha[i][0].toString().trim();  // Coluna A (índice 0)
    var statusAtual = dadosPlanilha[i][18].toString().trim(); // Coluna S (índice 18)

    if (ticketAtual === idTicketEnviado) {
      if (statusAtual.toLowerCase() === "devolvido para ajustes") {
        // Atualiza o Status na Coluna S (19)
        abaGerenciamento.getRange(i + 2, 19).setValue("Pronto p/ Reanálise");
        atualizarValidacaoFormularioReenvio();
      }
      break;
    }
  }
}

/**
 * Obtém o ID do Formulário de Reenvio armazenado nas Propriedades do Script.
 */
function obterFormReenvioId() {
  var formId = PropertiesService.getScriptProperties().getProperty("FORM_REENVIO_ID");
  if (!formId) {
    throw new Error("A chave 'FORM_REENVIO_ID' não foi configurada nas Propriedades do Script.");
  }
  return formId;
}

/**
 * Atualiza dinamicamente a validação da pergunta "Ticket" no Formulário de Reenvio.
 * Permite apenas a digitação de tickets cujo status seja "Devolvido para ajustes".
 */
function atualizarValidacaoFormularioReenvio() {
  var FORM_ID = obterFormReenvioId(); 
  
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
    // Pega da Coluna A (1) até a Coluna S (19)
    var dados = abaGerenciamento.getRange(2, 1, lastRow - 1, 19).getValues();

    for (var i = 0; i < dados.length; i++) {
      var ticket = dados[i][0].toString().trim();  // Coluna A
      var status = dados[i][18].toString().trim(); // Coluna S
      
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