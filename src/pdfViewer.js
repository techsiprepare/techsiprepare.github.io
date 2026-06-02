import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs';

// Cache do documento atual para evitar fetches repetidos ao passar as páginas
let pdfDocumentoCachado = null;
let urlCachada = null;

export async function renderizarPaginaPdf(urlPdf, numeroPagina) {
    const canvas = document.getElementById('pdf-canvas');
    const loadingDiv = document.getElementById('pdf-loading');
    if (!canvas) return;

    try {
        if (loadingDiv) loadingDiv.style.display = 'flex';

        // Só faz o fetch do PDF se mudar de prova/arquivo
        if (urlCachada !== urlPdf || !pdfDocumentoCachado) {
            pdfDocumentoCachado = await pdfjsLib.getDocument(urlPdf).promise;
            urlCachada = urlPdf;
        }

        // Valida se a página solicitada está dentro dos limites do PDF
        if (numeroPagina < 1 || numeroPagina > pdfDocumentoCachado.numPages) return;

        const pagina = await pdfDocumentoCachado.getPage(numeroPagina);
        const containerLargura = canvas.parentElement.clientWidth;
        const viewportOriginal = pagina.getViewport({ scale: 1.0 });
        const escalaAdaptativa = (containerLargura - 20) / viewportOriginal.width;
        const viewportFinal = pagina.getViewport({ scale: escalaAdaptativa || 1.2 });
        const contexto = canvas.getContext('2d');
        
        canvas.height = viewportFinal.height;
        canvas.width = viewportFinal.width;

        await pagina.render({ canvasContext: contexto, viewport: viewportFinal }).promise;
        if (loadingDiv) loadingDiv.style.display = 'none';
        
        // Atualiza os contadores de página globais na interface se eles existirem
        const indicador = document.getElementById('pdf-page-current');
        if (indicador) indicador.textContent = numeroPagina;

    } catch (erro) {
        console.error("Erro ao renderizar PDF:", erro);
        if (loadingDiv) {
            loadingDiv.innerHTML = `<p style="color:#ef4444;">Não foi possível carregar o PDF.</p>`;
        }
    }
}

export async function gerarThumbnailPdf(urlPdf, idCanvas) {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return;

    try {
        // Carrega o documento de forma assíncrona
        const pdf = await pdfjsLib.getDocument(urlPdf).promise;
        // Obtém estritamente a primeira página
        const pagina = await pdf.getPage(1);
        
        const contexto = canvas.getContext('2d');
        const viewportOriginal = pagina.getViewport({ scale: 1.0 });
        
        // Define uma largura fixa desejada para a miniatura no card (ex: 250px)
        const larguraDesejada = 250;
        const escala = larguraDesejada / viewportOriginal.width;
        const viewportFinal = pagina.getViewport({ scale: escala });

        canvas.height = viewportFinal.height;
        canvas.width = viewportFinal.width;

        await pagina.render({ canvasContext: contexto, viewport: viewportFinal }).promise;
    } catch (erro) {
        console.error(`Erro ao gerar thumbnail para ${urlPdf}:`, erro);
        // Fallback visual caso o PDF falhe (opcional): pintar o canvas de cinza ou ocultar
        canvas.style.display = 'none';
    }
}