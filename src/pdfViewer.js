import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.min.mjs';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs';

export async function renderizarPaginaPdf(urlPdf, numeroPagina) {
    const canvas = document.getElementById('pdf-canvas');
    const loadingDiv = document.getElementById('pdf-loading');
    if (!canvas) return;

    try {
        const pdf = await pdfjsLib.getDocument(urlPdf).promise;
        const pagina = await pdf.getPage(numeroPagina);
        const containerLargura = canvas.parentElement.clientWidth;
        const viewportOriginal = pagina.getViewport({ scale: 1.0 });
        const escalaAdaptativa = (containerLargura - 20) / viewportOriginal.width;
        const viewportFinal = pagina.getViewport({ scale: escalaAdaptativa || 1.2 });
        const contexto = canvas.getContext('2d');
        
        canvas.height = viewportFinal.height;
        canvas.width = viewportFinal.width;

        await pagina.render({ canvasContext: contexto, viewport: viewportFinal }).promise;
        if (loadingDiv) loadingDiv.style.display = 'none';
    } catch (erro) {
        console.error("Erro ao renderizar PDF:", erro);
        if (loadingDiv) {
            loadingDiv.innerHTML = `<p style="color:#ef4444;">Não foi possível carregar o PDF.</p>`;
        }
    }
}