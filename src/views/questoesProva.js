/**
 * @file questoesProva.js
 * @description Renderiza a lista de questões associadas a uma prova específica,
 * validando a existência da prova no estado global da aplicação.
 */

import { estadoApp } from '../api/sheets.js';
import { questaoItem } from '../components/questao-item.js';
import { backLink } from '../components/back-link.js';

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
        ${backLink({ destino: "#acervo", texto: "Voltar para Provas" })}
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