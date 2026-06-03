/**
 * @file router.js
 * @description Roteador SPA baseado em Hash (Fragmento de URL).
 * Responsabilidade única: mapear rotas, extrair parâmetros de URL,
 * renderizar o HTML da view correspondente no '#app-root' e executar
 * funções genéricas de ciclo de vida de UI (ícones Lucide e navbar).
 */

import { home } from './views/home.js';
import { acervo } from './views/acervo.js';
import { visualizar } from './views/visualizar.js';
import { tutorial } from './views/tutorial.js';
import { navbar, atualizarNavActive, inicializarDrawerMobile } from './components/navbar.js';
import { estadoApp } from './api/sheets.js';

export function inicializarRoteador() {
    configurarNavbar();
    window.addEventListener('hashchange', lidarComRoteamento);
    lidarComRoteamento();
}

function configurarNavbar() {
    const navWrapper = document.getElementById('nav-wrapper');
    if (!navWrapper) return;

    navWrapper.innerHTML = navbar();
    requestAnimationFrame(() => {
        executarCicloDeVidaVisual();
        inicializarDrawerMobile();
    });
}

function lidarComRoteamento() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const root = document.getElementById('app-root');
    if (!root) return;

    const { rota, parametros } = extrairDadosUrl();

    limparInterfaceGlobal();

    root.innerHTML = processarRoteamento(rota, parametros);

    executarCicloDeVidaVisual();
    atualizarNavActive();
}

function extrairDadosUrl() {
    const hashCompleta = window.location.hash || '#';
    const [caminhoComHash, stringParametros] = hashCompleta.split('?');
    const rota = caminhoComHash.replace('#', '');

    const parametros = {};
    if (stringParametros) {
        stringParametros.split('&').forEach(p => {
            const [chave, valor] = p.split('=');
            if (chave) parametros[chave] = decodeURIComponent(valor || '');
        });
    }

    return { rota, parametros };
}

function processarRoteamento(rota, parametros) {
    const rotasPadrao = ['', 'home'];
    if (rotasPadrao.includes(rota)) {
        return home();
    }

    const mapaDeRotas = {
        'acervo': () => gerenciarRotaAcervo(parametros),
        'visualizar': () => gerenciarRotaVisualizar(parametros),
        'tutorial': () => tutorial(),
    };

    const renderizarRota = mapaDeRotas[rota];

    if (!renderizarRota) {
        console.warn(`[Router] Rota não encontrada: "#${rota}". A redirecionar para #home.`);
        window.location.hash = '#home';
        return '';
    }

    return renderizarRota();
}

function gerenciarRotaAcervo(parametros) {
    if (Object.keys(estadoApp).length === 0) {
        window.addEventListener('dadosProntos', () => {
            lidarComRoteamento();
        }, { once: true });

        return `
            <div class="loading-container" style="text-align: center; padding: 40px;">
                <div class="spinner"></div>
                <p>Carregando acervo...</p>
            </div>
        `;
    }
    return acervo(parametros);
}

function gerenciarRotaVisualizar(parametros) {
    if (!parametros.prova || !parametros.questao) {
        return renderMensagemErro('Parâmetros inválidos.');
    }

    if (Object.keys(estadoApp).length === 0) {
        window.addEventListener('dadosProntos', () => {
            lidarComRoteamento();
        }, { once: true });
        return `
            <div class="loading-container" style="text-align: center; padding: 40px;">
                <div class="spinner"></div>
                <p>Carregando informações da questão...</p>
            </div>
        `;
    }

    return visualizar(parametros.prova, parametros.questao);
}

function renderizarMensagemErro(mensagem) {
    return `<h2>${mensagem}</h2>`;
}

function executarCicloDeVidaVisual() {
    if (window.lucide?.createIcons) {
        window.lucide.createIcons();
    }
}

function limparInterfaceGlobal() {
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.checked = false;
    }
}