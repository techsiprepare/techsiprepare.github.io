/**
 * @file questoesProva.js
 * @description Renderiza a lista de questões associadas a uma prova específica,
 * validando a existência da prova no estado global da aplicação.
 */

import { estadoApp } from '../api/sheets.js';
import { questaoItem } from '../components/questao-item.js';

function criarTemplateErroHtml() {
    return `
        <h2>Prova não encontrada!</h2>
        <a href="#acervo">Voltar ao acervo</a>
    `;
}

function renderizarListaQuestoesHtml(questoes, idProva) {
    if (!questoes || questoes.length === 0) {
        return '<p>Nenhuma questão mapeada para esta prova.</p>';
    }

    return questoes
        .map(questao => questaoItem({
            q: questao,
            idProva,
            exibirBotao: true
        }))
        .join('');
}

function criarTemplateProvaHtml(questoesHtml) {
    return `
        <div class="back-link">
            <a href="#acervo">← Voltar para Provas</a>
        </div>
        <div class="lista-questoes">
            ${questoesHtml}
        </div>
    `;
}

export function questoesProva(idProva) {
    const prova = estadoApp[idProva];
    if (!prova) {
        return criarTemplateErroHtml();
    }

    const listaQuestoes = Object.values(prova.questoes || {});
    const questoesHtml = renderizarListaQuestoesHtml(listaQuestoes, idProva);

    return criarTemplateProvaHtml(questoesHtml);
}