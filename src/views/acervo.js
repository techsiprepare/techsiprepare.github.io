/**
 * @file acervo.js
 * @description View do acervo de provas. Responsável por:
 * - Decidir qual sub-view renderizar com base nos parâmetros de URL (acervo completo ou questões de uma prova).
 * - Calcular as métricas de questões de cada prova.
 * - Agendar a geração assíncrona de thumbnails PDF após a view ser inserida no DOM.
 */

import { estadoApp } from '../api/sheets.js';
import { gerarThumbnailPdf } from '../utils/pdfViewer.js';
import { cardProva } from '../components/card-prova.js';
import { questoesProva } from './questoesProva.js';

/**
 * Ponto de entrada da rota 'acervo'. Decide qual sub-view renderizar
 * com base nos parâmetros extraídos da URL pelo roteador.
 *
 * @param {Object} parametros - Parâmetros extraídos da URL (ex: { prova: 'id-da-prova' }).
 * @returns {string} HTML da view a renderizar.
 */
export function acervo(parametros = {}) {
    if (parametros.prova) {
        return questoesProva(parametros.prova);
    }

    if (!estadoApp || Object.keys(estadoApp).length === 0) {
        const lidarDadosProntos = () => {
            const hash = window.location.hash || '#';
            const [caminho] = hash.split('?');
            const rota = caminho.replace('#', '');
            const temProva = hash.includes('prova=');

            if (rota === 'acervo' && !temProva) {
                const root = document.getElementById('app-root');
                if (root) {
                    root.innerHTML = acervo(parametros);
                }
            }
        };
        window.addEventListener('dadosProntos', lidarDadosProntos, { once: true });

        return criarTemplateAcervoHtml(`
            <div class="loading-container">
                <div class="spinner"></div>
                <p class="loading-text">Carregando acervo...</p>
            </div>
        `);
    }

    agendarRenderizacaoThumbnails();

    return criarTemplateAcervoHtml(
        renderizarListaProvasHtml(Object.values(estadoApp))
    );
}

/**
 * Percorre o estado da aplicação e gera thumbnails para cada prova que
 * possui um PDF associado. O agendamento com setTimeout garante que os
 * elementos <canvas> já estão no DOM quando as funções são chamadas.
 */
function agendarRenderizacaoThumbnails() {
    setTimeout(() => {
        Object.values(estadoApp).forEach(prova => {
            if (prova.caminhoPdf && prova.id) {
                gerarThumbnailPdf(prova.caminhoPdf, `thumb-${prova.id}`);
            }
        });
    }, 50);
}

function calcularMetricasProva(questoes = {}) {
    return Object.values(questoes).reduce((metricas, questao) => {
        if (questao.tipo === 'Objetiva') metricas.qtdObjetivas++;
        if (questao.tipo === 'Discursiva') metricas.qtdDiscursivas++;
        if (questao.status === 'Resolvida') metricas.qtdResolvidas++;

        return metricas;
    }, { qtdObjetivas: 0, qtdDiscursivas: 0, qtdResolvidas: 0 });
}

function renderizarListaProvasHtml(provas) {
    if (!provas || provas.length === 0) {
        return '<p>Nenhuma prova encontrada ou carregando...</p>';
    }

    return provas.map(prova => {
        const metricas = calcularMetricasProva(prova.questoes);

        return cardProva({
            id: prova.id,
            curso: prova.curso,
            ano: prova.ano,
            modalidade: prova.modalidade,
            caderno: prova.caderno,
            ...metricas
        });
    }).join('');
}

function criarTemplateAcervoHtml(conteudoGridHtml) {
    return `
        <h2>Acervo de Provas Disponíveis</h2>
        <p class="subtitle">Consulte as questões resolvidas ou encontre uma disponível para gravar seu vídeo.</p>
        <div class="grid-provas">
            ${conteudoGridHtml}
        </div>
    `;
}