import { buscarDadosPlanilha } from './api.js';
import { renderAcervoGrid, renderErro } from './ui.js';
import { navigate, initRouter } from './router.js';

let acervoCruze = [];

window.navigate = navigate;
window.renderAcervo = () => renderAcervoGrid(acervoCruze);

async function initApp() {
    initRouter();
    
    try {
        acervoCruze = await buscarDadosPlanilha();
        
        window.renderAcervo();
    } catch (error) {
        renderErro();
    }
}

window.onload = initApp;