import { viewHome } from './views/home.js';
import { viewAcervo } from './views/acervo.js';
import { viewQuestoesProva } from './views/questoesProva.js'; 
import { viewVisualizar } from './views/visualizar.js';
import { viewTutorial } from './views/tutorial.js';
import { gerarThumbnailPdf } from './pdfViewer.js';
import { estadoApp } from './api/sheets.js';
import { ComponenteNavbar, atualizarNavActive, inicializarDrawerMobile } from './components/navbar.js';

export function inicializarRoteador() {
    // Injeta a navbar no DOM antes de qualquer rota
    const navWrapper = document.getElementById('nav-wrapper');
    if (navWrapper) {
        navWrapper.innerHTML = ComponenteNavbar();
        // requestAnimationFrame garante que o browser processou os novos nós
        // antes de tentarmos buscar #nav-menu-btn, #nav-drawer, etc.
        requestAnimationFrame(() => {
            if (window.lucide) window.lucide.createIcons();
            inicializarDrawerMobile();
        });
    }

    window.addEventListener("hashchange", lidarComRoteamento);
    lidarComRoteamento();
}

function lidarComRoteamento() {
    const root = document.getElementById("app-root");
    const hashCompleta = window.location.hash || "#";
    const [caminhoComHash, stringParametros] = hashCompleta.split("?");
    const rota = caminhoComHash.replace("#", "");

    const parametros = {};
    if (stringParametros) {
        stringParametros.split("&").forEach(p => {
            const [chave, valor] = p.split("=");
            parametros[chave] = decodeURIComponent(valor);
        });
    }

    if (rota === "" || rota === "home") {
        root.innerHTML = viewHome();
    } else if (rota === "acervo") {
        if (parametros.prova) {
            root.innerHTML = viewQuestoesProva(parametros.prova);
        } else {
            root.innerHTML = viewAcervo();
            
            // --- NOVA LÓGICA PARA RENDERIZAR AS THUMBNAILS ---
            // Aguarda um micro-instante para garantir que o Lucide e os elementos estejam no DOM
            setTimeout(() => {
                Object.values(estadoApp).forEach(prova => {
                    // O caminhoPdf gerado no sheets.js é 'assets/provas/ID_PROVA.pdf'
                    const urlPdf = prova.caminhoPdf; 
                    const idCanvas = `thumb-${prova.id}`;
                    gerarThumbnailPdf(urlPdf, idCanvas);
                });
            }, 50);
        }
    } else if (rota === "visualizar") {
        root.innerHTML = (parametros.prova && parametros.questao) 
            ? viewVisualizar(parametros.prova, parametros.questao) 
            : `<h2>Parâmetros inválidos.</h2>`;
    } else if (rota === "tutorial") {
        root.innerHTML = viewTutorial();
    } else {
        root.innerHTML = `<h2>Página não encontrada (Erro 404).</h2>`;
    }

    if (window.lucide) window.lucide.createIcons();
    atualizarNavActive();
}