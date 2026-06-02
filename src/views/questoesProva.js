import { estadoApp } from '../api.js';
import { ComponenteBadge } from '../components/badge.js';

export function viewQuestoesProva(idProva) {
    const prova = estadoApp[idProva];
    if (!prova) return `<h2>Prova não encontrada!</h2><a href="#acervo">Voltar ao acervo</a>`;

    const questoesHtml = Object.values(prova.questoes).map(q => {
        const iconTipo = q.tipo === "Objetiva" ? "file-text" : "edit-3";
        const assuntoTxt = q.status === "Resolvida" ? q.assunto : 'Aguardando resolução';

        return `
            <div class="questao-item">
                <div class="q-info">
                    <i data-lucide="${iconTipo}" class="text-muted"></i>
                    <span class="q-numero">Questão ${q.numero}</span>
                    <span class="q-tipo">(${q.tipo})</span>
                    <p class="q-assunto">${assuntoTxt}</p>
                </div>
                <div class="q-actions">
                    ${ComponenteBadge({ status: q.status })}
                    <a href="#visualizar?prova=${idProva}&questao=${q.numero}" class="btn btn-sm">Abrir</a>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="back-link"><a href="#acervo">← Voltar para Provas</a></div>
        <h2>${prova.curso} — Ano ${prova.ano}</h2>
        <p class="subtitle">${prova.modalidade} | ID: ${prova.id}</p>
        <div class="lista-questoes">
            ${questoesHtml || '<p>Nenhuma questão mapeada para esta prova.</p>'}
        </div>
    `;
}