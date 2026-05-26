import { buscarDadosPlanilha } from './api.js';
import { renderAcervoGrid, renderErro, inicializarFiltrosDinamicos } from './ui.js';
import { navigate, initRouter } from './router.js';

let acervoDados = [];

window.navigate = navigate;
window.renderAcervo = (resetPage = false) => renderAcervoGrid(acervoDados, resetPage);

async function initApp() {
    initRouter();
    
    try {
        acervoDados = await buscarDadosPlanilha();
        inicializarFiltrosDinamicos(acervoDados);
        window.renderAcervo(true);
    } catch (error) {
        console.error('Erro na inicialização da aplicação:', error);
        renderErro();
    }
}

document.addEventListener('DOMContentLoaded', initApp);