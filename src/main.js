import { buscarDadosPlanilha } from './api.js';
import { renderAcervoGrid, renderErro, inicializarFiltrosDinamicos } from './ui.js';
import { navigate, initRouter } from './router.js';

let acervoDados = [];

window.navigate = navigate;
window.renderAcervo = (resetPage = false) => renderAcervoGrid(acervoDados, resetPage);

function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-close-btn');
    const navLinks = document.getElementById('main-nav');
    const overlay = document.getElementById('menu-overlay');

    const toggleMenu = () => {
        navLinks.classList.toggle('open');
        overlay.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    };

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);
}

async function initApp() {
    initRouter();
    setupMobileMenu();
    
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