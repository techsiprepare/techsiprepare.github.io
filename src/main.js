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

    // Ajustado para usar a classe CSS 'menu-open' controlando tudo de forma centralizada
    const toggleMenu = () => {
        navLinks.classList.toggle('open');
        overlay.classList.toggle('active');
        
        // Ativa/desativa o bloqueio de scroll de forma limpa
        document.body.classList.toggle('menu-open', navLinks.classList.contains('open'));
    };

    if (menuBtn) menuBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);

    // BOA PRÁTICA: Fecha o menu se o usuário clicar em um link interno (mobile)
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