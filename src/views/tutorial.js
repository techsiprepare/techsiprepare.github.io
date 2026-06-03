/**
 * @file tutorial.js
 * @description Renderiza a visualização da linha do tempo do tutorial de participação,
 * mapeando etapas predefinidas para componentes reutilizáveis.
 */

import { stepTimeline } from '../components/step-timeline.js';

const ETAPAS_TUTORIAL = Object.freeze([
    {
        numero: 1,
        icone: "search",
        titulo: "Já Consultou o Acervo?",
        descricao: "<p>Acesse a página Acervo de Resoluções e filtre pelo status \"Em Aberto\".</p><p>Lá você poderá visualizar as que ainda não foram resolvidas e que não possuem vídeos cadastrados.</p>"
    },
    {
        numero: 2,
        icone: "book-open",
        titulo: "Escolha uma Questão",
        descricao: "<p>Veja o enunciado da questão no caderno correpondente e inicie a resolução.</p><p><strong>Atenção:</strong> Não é possível \"reservar\" uma questão. O sistema funciona por ordem de chegada do formulário. Se duas pessoas gravarem a mesma questão, a que enviar o formulário primeiro com a resolução correta terá o vídeo validado. Fique atento(a)!</p>"
    },
    {
        numero: 3,
        icone: "video",
        titulo: "Grave e Publique",
        descricao: `
            <p>Grave a tela do seu computador resolvendo a questão. Certifique-se de que o áudio esteja limpo e a explicação didática. Siga os requisitos obrigatórios:</p>
            <ul style="margin-bottom: 15px; padding-left: 20px;">
                <li><strong>Imagem e voz:</strong> Grave a sua própria imagem no vídeo (pode ser em formato reduzido/picture-in-picture).</li>
                <li><strong>Foco único:</strong> Cada arquivo de vídeo deve conter a resolução de apenas 1 questão.</li>
                <li><strong>Duração:</strong> O vídeo deve ter no máximo 15 minutos.</li>
                <li><strong>Carga Horária:</strong> Cada vídeo validado contabilizará 12 horas de Carga Horária para fins de Curricularização da Extensão.</li>
            </ul>
            <p>Após gravar, publique o vídeo no YouTube (pode ser como "Não Listado" ou "Público", mas nunca "Privado").</p>
        `
    },
    {
        numero: 4,
        icone: "send",
        titulo: "Preencha o Formulário",
        descricao: `
            <p>Clique no botão abaixo para abrir o formulário institucional. Nele você enviará o link do seu vídeo e seus dados básicos para validação da carga horária.</p>
            <p><strong>Atenção:</strong> No formulário, será obrigatório o envio do <strong>Formulário de Autorização de Uso de Imagem e Voz</strong> devidamente preenchido e assinado.</p>
            <a href="https://forms.gle/p4Yrt9yedZF8s4ZA7" target="_blank" class="btn step-btn">Preencher Formulário</a>
        `
    }
]);

function construirTemplateTutorialHtml(timelineHtml) {
    return `
        <div class="hero">
            <h1>Como Participar</h1>
            <p>Siga o fluxo abaixo para gravar sua resolução e garantir suas horas de extensão.</p>
        </div>
        <div class="timeline">
            ${timelineHtml}
        </div>
    `;
}

export function tutorial() {
    const timelineHtml = ETAPAS_TUTORIAL
        .map(etapa => stepTimeline(etapa))
        .join('');

    return construirTemplateTutorialHtml(timelineHtml);
}