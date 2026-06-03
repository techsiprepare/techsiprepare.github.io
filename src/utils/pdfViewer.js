/**
 * @file pdfViewer.js
 * @description Módulo de gerenciamento e renderização de arquivos PDF utilizando a biblioteca PDF.js.
 * Oferece suporte a renderização responsiva de páginas com sistema de cache em memória e geração de thumbnails.
 */

import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs';

// --- ESTADO LOCAL E CONTROLE DE CACHE ---

const cachePdf = {
    url: null,
    documento: null,
    promessaEmAndamento: null
};

let tarefaRenderizacaoAtiva = null;

// --- FUNÇÕES PRINCIPAIS ---

/**
 * Renderiza uma página específica do PDF em um canvas responsivo com controle de estado de carregamento.
 * @param {string} urlPdf - URL do arquivo PDF.
 * @param {number} numeroPagina - Número da página a ser renderizada.
 * @returns {Promise<number>} Total de páginas do PDF ou 0 em caso de erro.
 */
export async function renderizarPaginaPdf(urlPdf, numeroPagina) {
    const canvas = document.getElementById('pdf-canvas');
    if (!canvas) return 0;

    alternarEstadoCarregamento(true);

    try {
        const pdf = await obterInstanciaPdf(urlPdf);

        if (numeroPagina < 1 || numeroPagina > pdf.numPages) {
            alternarEstadoCarregamento(false);
            return pdf.numPages;
        }

        const pagina = await pdf.getPage(numeroPagina);
        const contexto = canvas.getContext('2d');
        const viewport = calcularViewportResponsivo(pagina, canvas.parentElement?.clientWidth);

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await executarRenderizacaoSegura(pagina, contexto, viewport);

        atualizarIndicadorPagina(numeroPagina);
        alternarEstadoCarregamento(false);

        return pdf.numPages;
    } catch (erro) {
        if (erro.name === 'RenderingCancelledException') return 0;

        tratarErroRenderizacao(erro);
        return 0;
    }
}

/**
 * Gera uma miniatura (thumbnail) da primeira página de um PDF em um canvas específico.
 * @param {string} urlPdf - URL do arquivo PDF.
 * @param {string} idCanvas - ID do elemento canvas de destino.
 */
export async function gerarThumbnailPdf(urlPdf, idCanvas) {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return;

    try {
        const pdf = await obterInstanciaPdf(urlPdf);
        const pagina = await pdf.getPage(1);
        const contexto = canvas.getContext('2d');

        const LARGURA_THUMBNAIL = 250;
        const viewportOriginal = pagina.getViewport({ scale: 1.0 });
        const escala = LARGURA_THUMBNAIL / viewportOriginal.width;
        const viewportFinal = pagina.getViewport({ scale: escala });

        canvas.height = viewportFinal.height;
        canvas.width = viewportFinal.width;

        await pagina.render({ canvasContext: contexto, viewport: viewportFinal }).promise;
    } catch (erro) {
        console.error(`Erro ao gerar thumbnail para ${urlPdf}:`, erro);
        canvas.style.display = 'none';
    }
}

// --- FLUXO INTERNO E AUXILIARES ---

async function obterInstanciaPdf(urlPdf) {
    if (cachePdf.url === urlPdf && cachePdf.documento) {
        return cachePdf.documento;
    }

    if (cachePdf.url === urlPdf && cachePdf.promessaEmAndamento) {
        return cachePdf.promessaEmAndamento;
    }

    cachePdf.url = urlPdf;
    cachePdf.documento = null;
    cachePdf.promessaEmAndamento = pdfjsLib.getDocument(urlPdf).promise.then(pdf => {
        cachePdf.documento = pdf;
        cachePdf.promessaEmAndamento = null;
        return pdf;
    }).catch(erro => {
        limparCache();
        throw erro;
    });

    return cachePdf.promessaEmAndamento;
}

function calcularViewportResponsivo(pagina, larguraContainer) {
    const viewportOriginal = pagina.getViewport({ scale: 1.0 });

    if (!larguraContainer) {
        return pagina.getViewport({ scale: 1.2 });
    }

    const escalaAdaptativa = (larguraContainer - 20) / viewportOriginal.width;
    return pagina.getViewport({ scale: escalaAdaptativa || 1.2 });
}

async function executarRenderizacaoSegura(pagina, contexto, viewport) {
    if (tarefaRenderizacaoAtiva) {
        tarefaRenderizacaoAtiva.cancel();
    }

    tarefaRenderizacaoAtiva = pagina.render({ canvasContext: contexto, viewport });

    await tarefaRenderizacaoAtiva.promise;
    tarefaRenderizacaoAtiva = null;
}

function alternarEstadoCarregamento(exibir) {
    const loadingDiv = document.getElementById('pdf-loading');
    if (loadingDiv) {
        loadingDiv.style.display = exibir ? 'flex' : 'none';
    }
}

function atualizarIndicadorPagina(numeroPagina) {
    const indicador = document.getElementById('pdf-page-current');
    if (indicador) {
        indicador.textContent = numeroPagina;
    }
}

function tratarErroRenderizacao(erro) {
    console.error("Erro ao renderizar PDF:", erro);
    const loadingDiv = document.getElementById('pdf-loading');
    if (loadingDiv) {
        loadingDiv.style.display = 'flex';
        loadingDiv.innerHTML = `<p style="color:#ef4444;">Não foi possível carregar o PDF.</p>`;
    }
}

function limparCache() {
    cachePdf.url = null;
    cachePdf.documento = null;
    cachePdf.promessaEmAndamento = null;
}
