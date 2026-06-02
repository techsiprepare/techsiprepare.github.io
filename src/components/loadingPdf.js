export function ComponenteLoadingPdf({ mensagem = "Carregando página oficial do ENADE..." } = {}) { 
    return `
        <div class="pdf-container custom-pdf-scroll">
            <div id="pdf-loading" class="pdf-loading">
                <div class="spinner"></div>
                <p>${mensagem}</p>
            </div>
            <canvas id="pdf-canvas"></canvas> 
        </div>
    `; 
}