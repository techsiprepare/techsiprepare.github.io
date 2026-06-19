/**
 * @file questoesProva.js
 * @description Renderiza a lista de questões associadas a uma prova específica.
 */

import { estadoApp } from '../api/sheets.js';
import { questaoItem } from '../components/questao-item.js';
import { backLink } from '../components/back-link.js';
import { provaHeader } from '../components/prova-header.js';

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

function criarTemplateProvaHtml(prova, questoesHtml) {
    return `
        ${backLink({ destino: "#acervo", texto: "Voltar para Provas" })}
        
        ${provaHeader({ prova })}

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

    return criarTemplateProvaHtml(prova, questoesHtml);
}