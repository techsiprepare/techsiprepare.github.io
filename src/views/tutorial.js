import { ComponentePassoTimeline } from '../components/stepTimeline.js';

const ETAPAS_TUTORIAL = [
    { numero: 1, icone: "search", titulo: "Escolha uma Questão", descricao: "Navegue pelo nosso Acervo, selecione uma prova e busque por exercícios marcados com a tag amarela de 'Em Aberto'." },
    { numero: 2, icone: "book-open", titulo: "Estude e Prepare seu Roteiro", descricao: "Abra o visualizador integrado da questão. Analise o enunciado oficial no caderno de provas e elabore o passo a passo de maneira clara." },
    { numero: 3, icone: "video", titulo: "Grave e Suba no YouTube", descricao: "Grave a tela do seu dispositivo explicando a lógica de resolução e configure o vídeo como Público." },
    { numero: 4, icone: "send", titulo: "Envie o Formulário", descricao: "Acesse o formulário oficial do projeto e envie seus dados junto com o link do vídeo." }
];

export function viewTutorial() {
    const timelineHtml = ETAPAS_TUTORIAL.map(etapa => ComponentePassoTimeline(etapa)).join('');

    return `
        <h2>Como Funciona o Projeto de Extensão?</h2>
        <p class="subtitle">Siga as 4 etapas abaixo para validar suas horas complementares de forma autônoma.</p>
        <div class="timeline">
            ${timelineHtml}
        </div>
    `;
}