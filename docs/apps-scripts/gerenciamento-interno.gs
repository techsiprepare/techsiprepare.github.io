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
  SpreadsheetApp.getUi()
    .createMenu('📊 Gerenciamento Interno')
    .addItem('Abrir Sistema para gerenciamento', 'abrirAplicacao')
    .addToUi();

  exibirModalInstrucoes();
}

/**
 * Função executada via menu superior para acionar diretamente o modal.
 */
function abrirAplicacao() {
  exibirModalInstrucoes();
}

/**
 * Função executada no servidor para recuperar a URL. 
 * Se houver conflito de sessão/permissão, o Apps Script lançará uma exceção aqui.
 */
function obterUrlAplicacao() {
  const url = PropertiesService.getScriptProperties().getProperty(PROPERTY_KEY);
  if (!url) {
    throw new Error('A URL do sistema não foi configurada nas propriedades do script.');
  }
  return url;
}

/**
 * Exibe o modal explicativo e orientações de acesso.
 */
function exibirModalInstrucoes() {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          * {
            box-sizing: border-box;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 0;
          }
          
          html, body {
            height: 100%;
            background-color: #ffffff;
            color: #1f2937;
            font-size: 14px;
          }

          .container {
            display: flex;
            flex-direction: column;
            height: 100%;
            padding-top: 24px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e5e7eb;
          }

          .header h2 {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
          }

          /* Stepper / Indicador de progresso */
          .stepper {
            display: flex;
            gap: 6px;
          }
          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #e5e7eb;
            transition: background-color 0.3s ease;
          }
          .dot.active {
            background-color: #2563eb;
          }

          /* Área de conteúdo dos steps */
          .content-area {
            flex: 1;
            position: relative;
          }

          .step {
            display: none;
            animation: fadeIn 0.3s ease-in-out;
          }
          .step.active {
            display: block;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .step-title {
            font-size: 15px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 12px;
          }

          .step-description {
            font-size: 14px;
            line-height: 1.6;
            color: #4b5563;
          }

          .step-description strong {
            color: #111827;
            font-weight: 600;
          }

          .list-box {
            margin-top: 12px;
            background-color: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 16px;
          }

          .list-box ul {
            margin-top: 8px;
            padding-left: 20px;
            color: #4b5563;
          }

          .list-box li {
            margin-bottom: 6px;
          }
          .list-box li:last-child {
            margin-bottom: 0;
          }

          /* Estilo para exibição do erro capturado */
          .access-denied-box {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 6px;
            padding: 16px;
            margin-top: 12px;
          }

          .access-denied-title {
            color: #991b1b;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 6px;
          }

          .access-denied-text {
            color: #7f1d1d;
            font-size: 13px;
            line-height: 1.5;
          }

          /* Rodapé com botões */
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: auto;
            padding-top: 16px;
          }

          .btn-group {
            display: flex;
            gap: 12px;
            margin-left: auto;
          }

          .btn {
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .btn-outline {
            background-color: transparent;
            color: #4b5563;
            border: 1px solid #d1d5db;
          }
          .btn-outline:hover {
            background-color: #f3f4f6;
            color: #111827;
          }

          .btn-primary {
            background-color: #2563eb;
            color: #ffffff;
          }
          .btn-primary:hover {
            background-color: #1d4ed8;
          }
          .btn-primary:disabled {
            background-color: #93c5fd;
            cursor: not-allowed;
          }

          .btn-cancel {
            background-color: transparent;
            color: #6b7280;
            padding: 10px 0;
          }
          .btn-cancel:hover {
            color: #111827;
          }

          .spinner {
            width: 14px;
            height: 14px;
            border: 2px solid #ffffff;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            display: none;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .error-msg {
            color: #dc2626;
            font-size: 12px;
            margin-top: 8px;
            display: none;
            text-align: right;
            width: 100%;
          }
        </style>
      </head>
      <body>
        <div class="container">
          
          <div class="header">
            <h2>Instruções de Uso</h2>
            <div class="stepper">
              <span class="dot active" id="dot-1"></span>
              <span class="dot" id="dot-2"></span>
              <span class="dot" id="dot-3"></span>
            </div>
          </div>

          <div class="content-area">
            
            <!-- STEP 1 -->
            <div class="step active" id="step-1">
              <div class="step-title">Gerenciamento Exclusivo</div>
              <div class="step-description">
                Bem-vindo ao sistema de controle. Para garantir a organização dos dados, 
                toda interação de validação, alteração de status e inserção de dados deve 
                ser feita exclusivamente através do nosso <strong>Painel de Gerenciamento Interno</strong>.
              </div>
            </div>

            <!-- STEP 2 -->
            <div class="step" id="step-2">
              <div class="step-title">Integridade da Planilha</div>
              <div class="step-description">
                Não altere, renomeie ou exclua colunas estruturais das abas. Também evite alterar 
                os valores das células diretamente pelo Google Sheets. Isso
                pode causar falhas e inconsistências.
              </div>
            </div>

            <!-- STEP 3 -->
            <div class="step" id="step-3">
              <div class="step-title" id="step3-title">Conflito de Múltiplas Contas</div>
              <div class="step-description" id="step3-content">
                O navegador pode tentar abrir o sistema utilizando a sua conta padrão do Google, 
                o que resultará em erro de permissão.
                <div class="list-box">
                  Tente uma das seguintes abordagens:
                  <ul>
                    <li>Utilizar <strong>Perfis do Chrome distintos</strong> (um específico para a conta do projeto de extensão).</li>
                    <li>Abrir a planilha em uma <strong>Janela Anônima</strong>, fazendo login apenas com a conta do projeto de extensão.</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>

          <div class="error-msg" id="errorMsg">A URL do sistema não foi configurada nas propriedades do script.</div>

          <div class="footer">
            <button class="btn btn-cancel" onclick="google.script.host.close()">Cancelar</button>
            
            <div class="btn-group">
              <button class="btn btn-outline" id="btn-back" style="display: none;" onclick="changeStep(-1)">Voltar</button>
              <button class="btn btn-primary" id="btn-next" onclick="changeStep(1)">Próximo</button>
              <button class="btn btn-primary" id="btn-open" style="display: none;" onclick="executarAberturaSistema()">
                <span class="spinner" id="spinner"></span>
                <span id="btnText">Abrir Sistema</span>
              </button>
            </div>
          </div>

        </div>

        <script>
          let urlTarget = "";
          let currentStep = 1;
          const totalSteps = 3;

          function changeStep(direction) {
            // Oculta o step atual
            document.getElementById('step-' + currentStep).classList.remove('active');
            document.getElementById('dot-' + currentStep).classList.remove('active');
            
            // Atualiza o índice
            currentStep += direction;
            
            // Mostra o novo step
            document.getElementById('step-' + currentStep).classList.add('active');
            document.getElementById('dot-' + currentStep).classList.add('active');

            // Lógica dos botões
            const btnBack = document.getElementById('btn-back');
            const btnNext = document.getElementById('btn-next');
            const btnOpen = document.getElementById('btn-open');

            // Voltar
            if (currentStep === 1) {
              btnBack.style.display = 'none';
            } else {
              btnBack.style.display = 'inline-flex';
            }

            // Próximo / Abrir
            if (currentStep === totalSteps) {
              btnNext.style.display = 'none';
              btnOpen.style.display = 'inline-flex';
            } else {
              btnNext.style.display = 'inline-flex';
              btnOpen.style.display = 'none';
            }
          }

          function tratarExcecaoAcesso(error) {
            const btnOpen = document.getElementById('btn-open');
            const btnText = document.getElementById('btnText');
            const btnBack = document.getElementById('btn-back');
            
            // Esconde o botão de voltar após a falha de permissão
            btnBack.style.display = 'none';

            // Desabilita o botão de abertura
            btnOpen.disabled = true;
            btnText.innerText = 'Acesso Bloqueado';

            // Altera dinamicamente o conteúdo do Step 3 para exibir o alerta de Acesso Negado
            document.getElementById('step3-content').innerHTML = \`
              <div class="access-denied-box">
                <div class="access-denied-title">Acesso Negado / Conflito de Contas</div>
                <div class="access-denied-text">
                  Não foi possível validar as credenciais do sistema devido a uma falha de permissão.
                  <br><br>
                  <strong>Como resolver:</strong>
                  <ul style="margin-top: 6px; padding-left: 18px;">
                    <li>Abra uma <strong>Janela Anônima</strong> ou um <strong>Perfil Isolado do Chrome</strong>.</li>
                    <li>Faça login exclusivamente com a conta do projeto de extensão e tente novamente.</li>
                  </ul>
                </div>
              </div>
            \`;
          }

          function executarAberturaSistema() {
            const btn = document.getElementById('btn-open');
            const btnBack = document.getElementById('btn-back');
            const spinner = document.getElementById('spinner');
            const btnText = document.getElementById('btnText');

            btn.disabled = true;
            btnBack.disabled = true;
            spinner.style.display = 'inline-block';
            btnText.innerText = 'Validando...';

            // Executa a função no servidor e trata exceções capturadas pelo withFailureHandler
            google.script.run
              .withSuccessHandler(function(url) {
                if (!url) {
                  document.getElementById('errorMsg').style.display = 'block';
                  btn.disabled = false;
                  btnBack.disabled = false;
                  spinner.style.display = 'none';
                  btnText.innerText = 'Abrir Sistema';
                  return;
                }
                btnText.innerText = 'Redirecionando...';
                setTimeout(function() {
                  window.open(url, "_blank");
                  google.script.host.close();
                }, 600);
              })
              .withFailureHandler(function(error) {
                spinner.style.display = 'none';
                tratarExcecaoAcesso(error);
              })
              .obterUrlAplicacao();
          }
        </script>
      </body>
    </html>
  `;

  const htmlOutput = HtmlService.createHtmlOutput(htmlContent)
    .setWidth(520)
    .setHeight(420);

  SpreadsheetApp.getUi().showModalDialog(htmlOutput, ' ');
}