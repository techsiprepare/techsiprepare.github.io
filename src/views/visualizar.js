/**
 * @file visualizar.js
 * @description Gerencia a visualização assíncrona de páginas de PDF de provas.
 */

import { estadoApp } from '../api/sheets.js';
import { renderizarPaginaPdf } from '../utils/pdfViewer.js';
import { loadingPdf } from '../components/loading-pdf.js';
import { questaoItem } from '../components/questao-item.js';
import { backLink } from '../components/back-link.js';
import { provaHeader } from '../components/prova-header.js';

function extrairQuestoesDaPagina(prova, numeroPagina) {
    return Object.values(prova?.questoes || {})
        .filter(questao => questao.paginaPdf === numeroPagina);
}

function renderizarListaQuestoesHtml(prova, numeroPagina) {
    const questoes = extrairQuestoesDaPagina(prova, numeroPagina);

    if (questoes.length === 0) {
        return `<p class="text-muted">Nenhuma questão mapeada para esta página.</p>`;
    }

    return questoes.map(questao => questaoItem({
        q: questao,
        idProva: prova.id,
        exibirBotao: false
    })).join('');
}

function atualizarIndicadoresDomi(paginaAtual, totalPaginasPdf) {
    const textoIndicador = totalPaginasPdf > 0 ? `${paginaAtual}/${totalPaginasPdf}` : `${paginaAtual}/?`;

    const txtPagina = document.getElementById('pdf-page-indicator-txt');
    const txtTituloLista = document.getElementById('sidebar-page-title-txt');

    if (txtPagina) txtPagina.textContent = textoIndicador;
    if (txtTituloLista) txtTituloLista.textContent = paginaAtual;
}

function atualizarListaQuestoesDomi(prova, paginaAtual) {
    const containerLista = document.getElementById('sidebar-questoes-dinamica');
    if (!containerLista) return;

    containerLista.innerHTML = renderizarListaQuestoesHtml(prova, paginaAtual);

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

async function processarRenderizacaoPdf(prova, paginaAtual, callbackTotalPaginas) {
    const total = await renderizarPaginaPdf(prova.caminhoPdf, paginaAtual);
    if (total && total > 0) {
        callbackTotalPaginas(total);
        atualizarIndicadoresDomi(paginaAtual, total);
    }
}

function criarTemplateHtml(prova, paginaAtual, questoesHtml) {
    return `
        ${backLink({ destino: `#acervo?prova=${prova.id}`, texto: "Voltar para Lista de Questões" })}
        
        ${provaHeader({ prova, sufixoContexto: "(Visualizando PDF)" })}

        <div class="pdf-toolbar">
            <button onclick="window._mudarPaginaPdf(-1)" class="btn btn-sm">
                <i data-lucide="chevron-left"></i>
            </button>
            <span class="pdf-page-indicator" id="pdf-page-indicator-txt">${paginaAtual}/?</span>
            <button onclick="window._mudarPaginaPdf(1)" class="btn btn-sm">
                <i data-lucide="chevron-right"></i>
            </button>
        </div>

        <div class="split-view">
            ${loadingPdf()}
            <div class="sidebar-context">
                <div class="side-box">
                    <h4>Questões na página <span id="sidebar-page-title-txt">${paginaAtual}</span>:</h4>
                    <div id="sidebar-questoes-dinamica" class="lista-questoes side-lista-questoes">
                        ${questoesHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function visualizar(idProva, numQuestao) {
    const prova = estadoApp[idProva];
    const questao = prova?.questoes[numQuestao];
    if (!questao) return `<h2>Questão não encontrada!</h2>`;

    let paginaAtual = questao.paginaPdf;
    let totalPaginasPdf = 0;

    window._mudarPaginaPdf = async (direcao) => {
        const novaPagina = paginaAtual + direcao;
        if (novaPagina < 1 || (totalPaginasPdf > 0 && novaPagina > totalPaginasPdf)) return;

        paginaAtual = novaPagina;
        window.scrollTo({ top: 0, behavior: 'smooth' });

        atualizarIndicadoresDomi(paginaAtual, totalPaginasPdf);
        atualizarListaQuestoesDomi(prova, paginaAtual);

        await processarRenderizacaoPdf(prova, paginaAtual, (total) => {
            totalPaginasPdf = total;
        });
    };

    setTimeout(() => {
        processarRenderizacaoPdf(prova, paginaAtual, (total) => {
            totalPaginasPdf = total;
        });
    }, 50);

    const questoesIniciaisHtml = renderizarListaQuestoesHtml(prova, paginaAtual);
    return criarTemplateHtml(prova, paginaAtual, questoesIniciaisHtml);
}