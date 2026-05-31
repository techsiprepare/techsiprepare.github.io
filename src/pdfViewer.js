import { navigate } from './router.js';

let pdfDoc = null;
const scale = 2.0; 
let canvas = null;
let ctx = null;

// VARIÁVEIS DE CONTROLE DA PAGINAÇÃO
let pageNum = 1;

export function initPdfViewer() {
    canvas = document.getElementById('pdf-render-canvas');
    ctx = canvas.getContext('2d');

    const btnVoltar = document.getElementById('btn-voltar-acervo');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => navigate('acervo'));
    }

    // LISTERNERS DOS BOTÕES DE PAGINAÇÃO
    const btnAnterior = document.getElementById('btn-pdf-anterior');
    const btnProximo = document.getElementById('btn-pdf-proximo');

    if (btnAnterior) {
        btnAnterior.addEventListener('click', paginaAnterior);
    }
    if (btnProximo) {
        btnProximo.addEventListener('click', proximaPagina);
    }
}

function renderPage(num) {
    // Atualiza a página atual antes de renderizar
    pageNum = num;

    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = { canvasContext: ctx, viewport: viewport };
        page.render(renderContext);
    });
    
    // Atualiza os textos e estados dos botões na tela
    atualizarInterfacePaginacao();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function carregarPdfVisualizador(idProva, paginaInicial, ano, curso, numero, caderno) {
    const url = `assets/provas/${idProva}.pdf`;
    const loadingIndicator = document.getElementById('pdf-loading-indicator');
    const infoHeader = document.getElementById('pdf-questao-info');
    
    loadingIndicator.style.display = 'block';
    
if (infoHeader) {
    const cadernoTexto = (!caderno || caderno.trim() === "" || caderno.toUpperCase() === "UNICO") 
        ? "Caderno Único" 
        : `Caderno - ${caderno}`;

    infoHeader.innerHTML = `
        <span class="info-tag-ano">${ano}</span>
        <span class="info-txt-curso" title="${curso}">${curso}</span>
        <span class="info-badge-caderno">${cadernoTexto}</span>
    `;
}

    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    const loadingTask = pdfjsLib.getDocument(url);
    
    loadingTask.promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        
        let targetPage = parseInt(paginaInicial, 10);
        if (isNaN(targetPage) || targetPage < 1) targetPage = 1;
        if (targetPage > pdfDoc.numPages) targetPage = pdfDoc.numPages;

        loadingIndicator.style.display = 'none';
        renderPage(targetPage);
        
    }).catch(function(error) {
        console.error("Falha ao abrir PDF Local:", error);
        loadingIndicator.innerHTML = `⚠️ Erro: Não foi possível carregar o PDF.`;
    });
}

// FUNÇÕES AUXILIARES DE NAVEGAÇÃO
function paginaAnterior() {
    if (pdfDoc && pageNum > 1) {
        renderPage(pageNum - 1);
    }
}

function proximaPagina() {
    if (pdfDoc && pageNum < pdfDoc.numPages) {
        renderPage(pageNum + 1);
    }
}

function atualizarInterfacePaginacao() {
    const txtContador = document.getElementById('pdf-paginacao-contador');
    const btnAnterior = document.getElementById('btn-pdf-anterior');
    const btnProximo = document.getElementById('btn-pdf-proximo');

    // Atualiza o texto "Página X de Y"
    if (txtContador && pdfDoc) {
        txtContador.textContent = `${pageNum} de ${pdfDoc.numPages}`;
    }

    // Desativa os botões se chegar nos limites do documento
    if (btnAnterior) {
        btnAnterior.disabled = (pageNum <= 1);
    }
    if (btnProximo) {
        btnProximo.disabled = (pdfDoc && pageNum >= pdfDoc.numPages);
    }
}