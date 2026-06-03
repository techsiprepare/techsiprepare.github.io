/**
 * @file router.js
 * @description Roteador SPA baseado em Hash (Fragmento de URL).
 * Responsabilidade única: mapear rotas, extrair parâmetros de URL,
 * renderizar o HTML da view correspondente no '#app-root' e executar
 * funções genéricas de ciclo de vida de UI (ícones Lucide e navbar).
 */

import { viewHome } from './views/home.js';
import { viewAcervo } from './views/acervo.js';
import { viewVisualizar } from './views/visualizar.js';
import { viewTutorial } from './views/tutorial.js';
import { ComponenteNavbar, atualizarNavActive, inicializarDrawerMobile } from './components/navbar.js';

// --- PONTO DE ENTRADA (MÉTODO PRINCIPAL) ---

export function inicializarRoteador() {
    configurarNavbar();
    window.addEventListener('hashchange', lidarComRoteamento);
    lidarComRoteamento();
}

// --- CONFIGURAÇÃO E FLUXO DE ROTEAMENTO ---

function configurarNavbar() {
    const navWrapper = document.getElementById('nav-wrapper');
    if (!navWrapper) return;

    navWrapper.innerHTML = ComponenteNavbar();
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

// --- PROCESSAMENTO DE URL ---

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
        return viewHome();
    }

    const mapaDeRotas = {
        'acervo': () => viewAcervo(parametros),
        'visualizar': () => gerenciarRotaVisualizar(parametros),
        'tutorial': () => viewTutorial(),
    };

    const renderizarRota = mapaDeRotas[rota];

    if (!renderizarRota) {
        console.warn(`[Router] Rota não encontrada: "#${rota}". A redirecionar para #home.`);
        window.location.hash = '#home';
        return '';
    }

    return renderizarRota();
}

// --- ROTAS COM VALIDAÇÃO DE PARÂMETROS ---

function gerenciarRotaVisualizar(parametros) {
    if (parametros.prova && parametros.questao) {
        return viewVisualizar(parametros.prova, parametros.questao);
    }
    return renderizarMensagemErro('Parâmetros inválidos.');
}

// --- AUXILIARES ---

function renderizarMensagemErro(mensagem) {
    return `<h2>${mensagem}</h2>`;
}

/**
 * Executa a inicialização de ícones Lucide, se disponíveis.
 */
function executarCicloDeVidaVisual() {
    if (window.lucide?.createIcons) {
        window.lucide.createIcons();
    }
}

/**
 * Limpa elementos de interface global antes de cada transição de rota.
 * Centraliza o comportamento de reset de UI (ex: fechar navbar mobile)
 * para que o roteador não precise conhecer IDs internos de componentes.
 */
function limparInterfaceGlobal() {
    const navToggle = document.getElementById('nav-toggle');
    if (navToggle) {
        navToggle.checked = false;
    }
}