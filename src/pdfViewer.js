import { navigate } from './router.js';

let pdfDoc = null;
const scale = 2.0; 
let canvas = null;
let ctx = null;

export function initPdfViewer() {
    canvas = document.getElementById('pdf-render-canvas');
    ctx = canvas.getContext('2d');

    const btnVoltar = document.getElementById('btn-voltar-acervo');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', () => navigate('acervo'));
    }
}

function renderPage(num) {
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale: scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = { canvasContext: ctx, viewport: viewport };
        page.render(renderContext);
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function carregarPdfVisualizador(idProva, paginaInicial, ano, curso, numero, tipo) {
    const url = `assets/provas/${idProva}.pdf`;
    const loadingIndicator = document.getElementById('pdf-loading-indicator');
    const infoHeader = document.getElementById('pdf-questao-info');
    
    loadingIndicator.style.display = 'block';
    
    if (infoHeader) {
        infoHeader.innerHTML = `
            <div class="viewer-header-info">
                <span class="card-ano">Enade ${ano}</span>
                <span class="card-curso">${curso}</span>
            </div>
            <h2 class="viewer-title">Q. ${numero} - ${tipo}</h2>
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