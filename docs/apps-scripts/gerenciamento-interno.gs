/**
 * Configuração e inicialização do sistema e modal de instruções.
 */

// Chave da propriedade onde a URL da aplicação interna está salva
const PROPERTY_KEY = 'URL_APLICACAO_INTERNA';

/**
 * Executado automaticamente ao abrir a planilha.
 * Cria o menu personalizado e exibe o modal explicativo com o fluxo de uso.
 */
function abrirModalAoAbrir() {
  // Cria o menu
  SpreadsheetApp.getUi()
    .createMenu('📊 Gerenciamento Interno')
    .addItem('Abrir Sistema para gerenciamento', 'abrirAplicacao')
    .addToUi();

  // Exibe o modal
  exibirModalInstrucoes();
}

/**
 * Exibe o modal explicativo passo a passo sobre a arquitetura e uso da planilha.
 */
function exibirModalInstrucoes() {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          * {
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #202124;
            background-color: #ffffff;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          .header h2 {
            margin: 0;
            color: #1a73e8;
            font-size: 18px;
          }
          .header p {
            margin: 5px 0 0;
            font-size: 12px;
            color: #5f6368;
          }
          .steps-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 20px;
          }
          .step-card {
            display: flex;
            align-items: flex-start;
            background: #f8f9fa;
            border: 1px solid #dadce0;
            border-radius: 6px;
            padding: 10px 12px;
          }
          .step-number {
            background-color: #1a73e8;
            color: #ffffff;
            font-weight: bold;
            font-size: 12px;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
          }
          .step-content {
            font-size: 13px;
            line-height: 1.4;
          }
          .step-content strong {
            color: #202124;
          }
          .notice-box {
            background-color: #fef7e0;
            border-left: 4px solid #f9ab00;
            padding: 10px 12px;
            font-size: 12px;
            color: #3c4043;
            margin-bottom: 20px;
            border-radius: 0 4px 4px 0;
          }
          .footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }
          .btn {
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .btn-secondary {
            background-color: #f1f3f4;
            color: #3c4043;
          }
          .btn-secondary:hover {
            background-color: #e8eaed;
          }
          .btn-primary {
            background-color: #1a73e8;
            color: white;
          }
          .btn-primary:hover {
            background-color: #1557b0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>📌 Fluxo de Gerenciamento da Planilha</h2>
          <p>Siga as etapas abaixo para realizar a manutenção e curadoria de dados.</p>
        </div>

        <div class="steps-container">
          <div class="step-card">
            <div class="step-number">1</div>
            <div class="step-content">
              <strong>Entrada de Submissões:</strong> Respostas de formulários chegam de forma legada nas abas de captação (<code>Envios</code> / <code>Reenvios</code>).
            </div>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <div class="step-content">
              <strong>Tratamento e Triagem:</strong> Os dados são normalizados automaticamente na aba <code>Gerenciamento_Respostas</code> via script (geração de Tickets).
            </div>
          </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <div class="step-content">
              <strong>Gerenciamento Exclusivo:</strong> Toda interação de validação, alteração de status e inserção de mídias deve ser feita exclusivamente via <strong>Sistema Interno</strong>.
            </div>
          </div>
        </div>

        <div class="notice-box">
          <strong>⚠️ Importante:</strong> Evite alterar ou deletar colunas estruturais das abas de banco de dados diretamente pelo Sheets para manter a integridade dos scripts e integrações.
        </div>

        <div class="footer">
          <button class="btn btn-secondary" onclick="google.script.host.close()">Entendi</button>
          <button class="btn btn-primary" onclick="executarAberturaSistema()">Abrir Sistema</button>
        </div>

        <script>
          function executarAberturaSistema() {
            google.script.run
              .withSuccessHandler(function() {
                google.script.host.close();
              })
              .abrirAplicacao();
          }
        </script>
      </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(520)
    .setHeight(460);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, ' ');
}

/**
 * Busca a URL salva e abre uma caixa de diálogo em HTML que realiza o redirecionamento.
 */
function abrirAplicacao() {
  const ui = SpreadsheetApp.getUi();
  
  // Consome a propriedade (estilo .env)
  const urlAplicacao = PropertiesService.getScriptProperties().getProperty(PROPERTY_KEY);

  if (!urlAplicacao) {
    ui.alert(
      'Configuração Ausente',
      'A URL da aplicação não foi configurada. Defina a propriedade "URL_APLICACAO_INTERNA" nas configurações do script.',
      ui.ButtonSet.OK
    );
    return;
  }

  // Conteúdo HTML/JS para abertura da aplicação
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_blank">
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 16px;
            margin: 0;
            color: #333;
            text-align: center;
          }
          p {
            font-size: 14px;
            margin-bottom: 20px;
            line-height: 1.4;
          }
          .btn {
            background-color: #1a73e8;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          .btn:hover {
            background-color: #1557b0;
          }
          .warning {
            color: #d93025;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <p id="mensagem">A aplicação de gerenciamento será aberta em uma nova guia.</p>
        <button id="btnAbrir" class="btn" onclick="executarAbertura()">OK, Abrir Sistema</button>

        <script>
          const urlTarget = "${urlAplicacao}";

          function executarAbertura() {
            const novaJanela = window.open(urlTarget, "_blank");

            if (!novaJanela || novaJanela.closed || typeof novaJanela.closed === 'undefined') {
              const msgElement = document.getElementById('mensagem');
              msgElement.className = 'warning';
              msgElement.innerText = 'O navegador bloqueou a abertura! Por favor, autorize os pop-ups para esta planilha na barra de endereço e tente novamente.';
              
              const btnElement = document.getElementById('btnAbrir');
              btnElement.innerText = 'Tentar Novamente';
            } else {
              google.script.host.close();
            }
          }
        </script>
      </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(380)
    .setHeight(190);

  ui.showModalDialog(htmlOutput, 'Aviso de Redirecionamento');
}