import { estadoApp } from '../api/sheets.js';
import { ComponenteQuestaoItem } from '../components/questaoItem.js';

export function viewQuestoesProva(idProva) {
    const prova = estadoApp[idProva];
    if (!prova) return `<h2>Prova não encontrada!</h2><a href="#acervo">Voltar ao acervo</a>`;

    const questoesHtml = Object.values(prova.questoes).map(q =>
        ComponenteQuestaoItem({
            q,
            idProva,
            exibirBotao: true
        })
    ).join('');

    return `
        <div class="back-link"><a href="#acervo">← Voltar para Provas</a></div>
        <div class="lista-questoes">
            ${questoesHtml || '<p>Nenhuma questão mapeada para esta prova.</p>'}
        </div>
    `;
}