import { estadoApp } from '../api.js';
import { renderizarPaginaPdf } from '../pdfViewer.js';
import { ComponenteLoadingPdf } from '../components/loading.js';

// Função auxiliar para extrair o ID do vídeo do YouTube de qualquer formato de link
function obterUrlEmbedYoutube(urlOriginal) {
    if (!urlOriginal) return '';
    
    // Expressão regular para capturar o ID do vídeo em diferentes formatos de URL do YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOriginal.match(regExp);

    if (match && match[2].length === 11) {
        const videoId = match[2];
        return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Retorna a URL original como fallback caso já esteja formatada corretamente
    return urlOriginal;
}

export function viewVisualizar(idProva, numQuestao) {
    const prova = estadoApp[idProva];
    const questao = prova?.questoes[numQuestao];
    if (!questao) return `<h2>Questão não encontrada!</h2>`;

    const questoesMesmaPagina = Object.values(prova.questoes)
        .filter(q => q.paginaPdf === questao.paginaPdf)
        .map(q => `
            <a href="#visualizar?prova=${idProva}&questao=${q.numero}" class="side-q-item ${q.numero === numQuestao ? 'active' : ''}">
                <span>Questão ${q.numero}</span>
                <span class="small-status ${q.status === 'Resolvida' ? 'success' : 'warn'}"></span>
            </a>
        `).join('');

    // Agora usamos a nova função para garantir o link no formato /embed/ correto
    const urlVideoFormatada = obterUrlEmbedYoutube(questao.videoUrl);

    const areaVideoHtml = questao.status === "Resolvida"
        ? `<div class="video-wrapper">
                <iframe src="${urlVideoFormatada}" frameborder="0" allowfullscreen></iframe>
           </div>
           <p class="autor-txt">Resolvido por: <strong>${questao.autor}</strong></p>`
        : `<div class="video-placeholder"> 
            <i data-lucide="video-off"></i> 
            <p>Esta questão ainda não possui uma resolução em vídeo.</p> 
            <a href="#tutorial" class="btn btn-primary">Seja o primeiro a gravar!</a> 
           </div>`;

    // Dispara a renderização assíncrona do PDF.js
    setTimeout(() => renderizarPaginaPdf(prova.caminhoPdf, questao.paginaPdf), 50);

    return `
        <div class="back-link"><a href="#acervo?prova=${idProva}">← Voltar para Lista de Questões</a></div>
        <div class="split-view">
            
            ${ComponenteLoadingPdf()}
            
            <div class="sidebar-context"
                <div class="side-box">
                    <h3>Questão ${questao.numero} (${questao.tipo})</h3>
                    <p class="assunto-destaque">${questao.assunto}</p>
                    ${areaVideoHtml}
                </div>
                <div class="side-box">
                    <h4>Questões nesta página (${questao.paginaPdf}):</h4>
                    <div class="side-lista-questoes">${questoesMesmaPagina}</div>
                </div>
            </div>
        </div>
    `;
}