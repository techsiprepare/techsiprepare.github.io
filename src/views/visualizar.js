import { estadoApp } from '../api/sheets.js';
import { renderizarPaginaPdf } from '../pdfViewer.js';
import { ComponenteLoadingPdf } from '../components/loadingPdf.js';
import { ComponenteQuestaoItem } from '../components/questaoItem.js';

// Função auxiliar para gerar o HTML das questões de uma página específica
function gerarQuestoesDaPaginaHtml(prova, numeroPagina) {
    const questoesFiltradas = Object.values(prova.questoes)
        .filter(q => q.paginaPdf === numeroPagina);

    if (questoesFiltradas.length === 0) {
        return `<p class="text-muted">Nenhuma questão mapeada para esta página.</p>`;
    }

    // Força exibirBotao como false para ocultar o botão "Abrir" na tela do PDF
    return questoesFiltradas.map(q => ComponenteQuestaoItem({
        q,
        idProva: prova.id,
        exibirBotao: false
    })).join('');
}

export function viewVisualizar(idProva, numQuestao) {
    const prova = estadoApp[idProva];
    const questao = prova?.questoes[numQuestao];
    if (!questao) return `<h2>Questão não encontrada!</h2>`;

    let paginaAtual = questao.paginaPdf;

    // Injeta a lógica de paginação no escopo global
    window._mudarPaginaPdf = (direcao) => {
        const novaPagina = paginaAtual + direcao;
        if (novaPagina < 1) return; 
        
        paginaAtual = novaPagina;
        
        // 1. Atualiza o número da página nos indicadores de texto
        const txtPagina = document.getElementById('pdf-page-indicator-txt');
        const txtTituloLista = document.getElementById('sidebar-page-title-txt');
        if (txtPagina) txtPagina.textContent = paginaAtual;
        if (txtTituloLista) txtTituloLista.textContent = paginaAtual;
        
        // 2. Atualiza a lista lateral com as questões (e vídeos) da nova página
        const containerLista = document.getElementById('sidebar-questoes-dinamica');
        if (containerLista) {
            containerLista.innerHTML = gerarQuestoesDaPaginaHtml(prova, paginaAtual);
            if (window.lucide) window.lucide.createIcons();
        }
        
        // 3. Renderiza a nova página no Canvas
        renderizarPaginaPdf(prova.caminhoPdf, paginaAtual);
    };

    // Gera a listagem inicial para a página do PDF correspondente
    const questoesMesmaPaginaHtml = gerarQuestoesDaPaginaHtml(prova, paginaAtual);

    // Dispara a renderização assíncrona inicial do arquivo PDF
    setTimeout(() => renderizarPaginaPdf(prova.caminhoPdf, paginaAtual), 50);

    return `
        <div class="back-link">
            <a href="#acervo?prova=${idProva}">← Voltar para Lista de Questões</a>
        </div>
        
        <div class="pdf-toolbar">
            <button onclick="window._mudarPaginaPdf(-1)" class="btn btn-sm">
                <i data-lucide="chevron-left"></i> Página Anterior
            </button>
            <span>
                Página do PDF: <strong id="pdf-page-indicator-txt">${paginaAtual}</strong>
            </span>
            <button onclick="window._mudarPaginaPdf(1)" class="btn btn-sm">
                Próxima Página <i data-lucide="chevron-right"></i>
            </button>
        </div>

        <div class="split-view">
            
            ${ComponenteLoadingPdf()}
            
            <div class="sidebar-context">
                <div class="side-box">
                    <h4>Questões na página <span id="sidebar-page-title-txt">${paginaAtual}</span>:</h4>
                    <div id="sidebar-questoes-dinamica" class="lista-questoes side-lista-questoes">
                        ${questoesMesmaPaginaHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}