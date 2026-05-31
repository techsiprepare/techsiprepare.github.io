import { buscarDadosPlanilha } from './api.js';
import { renderAcervoGrid, renderErro, inicializarFiltrosDinamicos } from './ui.js';
import { navigate, initRouter } from './router.js';
import { initPdfViewer, carregarPdfVisualizador } from './pdfViewer.js';

let acervoDados = [];

window.navigate = navigate;
window.renderAcervo = (resetPage = false) => renderAcervoGrid(acervoDados, resetPage);

window.abrirNoVisualizadorLocal = (idProva, pagina, ano, curso, numero, tipo) => {
    navigate('visualizador');
    carregarPdfVisualizador(idProva, pagina, ano, curso, numero, tipo);
};

function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const closeBtn = document.getElementById('mobile-close-btn');
    const navLinks = document.getElementById('main-nav');
    const overlay = document.getElementById('menu-overlay');

    const toggleMenu = () => {
        navLinks.classList.toggle('open');
        overlay.classList.toggle('active');
        
        document.body.classList.toggle('menu-open', navLinks.classList.contains('open'));
    };

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);

    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('open')) {
                toggleMenu();
            }
        });
    });
}

async function initApp() {
    initRouter();
    setupMobileMenu();
    initPdfViewer();
    
    const path = window.location.hash || '#acervo';
    if (path.includes('visualizador')) {
        navigate('acervo');
    }

    try {
        acervoDados = await buscarDadosPlanilha();
        inicializarFiltrosDinamicos(acervoDados);
        
        const abas = document.querySelectorAll('.status-tab');
        abas.forEach(tab => {
            tab.addEventListener('click', (e) => {
                abas.forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
                window.renderAcervo(true);
            });
        });

        window.renderAcervo(true);
    } catch (error) {
        console.error('Erro na inicialização da aplicação:', error);
        renderErro();
    }
}

document.addEventListener('DOMContentLoaded', initApp);