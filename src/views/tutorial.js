export function viewTutorial() {
    return `
        <h2>Como Funciona o Projeto de Extensão?</h2>
        <p class="subtitle">Siga as 4 etapas abaixo para validar suas horas complementares de forma autônoma.</p>
        <div class="timeline">
            <div class="step">
                <div class="step-num"><i data-lucide="search"></i></div>
                <div class="step-content">
                    <h3>1. Escolha uma Questão</h3>
                    <p>Navegue pelo nosso <strong>Acervo</strong>, selecione uma prova e busque por exercícios marcados com a tag amarela de <em>"Em Aberto"</em>.</p>
                </div>
            </div>
            <div class="step">
                <div class="step-num"><i data-lucide="book-open"></i></div>
                <div class="step-content">
                    <h3>2. Estude e Prepare seu Roteiro</h3>
                    <p>Abra o visualizador integrado da questão. Analise o enunciado oficial no caderno de provas e elabore o passo a passo de maneira claro.</p>
                </div>
            </div>
            <div class="step">
                <div class="step-num"><i data-lucide="video"></i></div>
                <div class="step-content">
                    <h3>3. Grave e Suba no YouTube</h3>
                    <p>Grave a tela do seu dispositivo explicando a lógica de resolução e configure o vídeo como <strong>Público</strong>.</p>
                </div>
            </div>
            <div class="step">
                <div class="step-num"><i data-lucide="send"></i></div>
                <div class="step-content">
                    <h3>4. Envie o Formulário</h3>
                    <p>Acesse o formulário oficial do projeto e envie seus dados junto com o link do vídeo.</p>
                </div>
            </div>
        </div>
    `;
}