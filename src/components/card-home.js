/**
 * @file card-acao.js
 * @description Componente isolado de card de ação/feature da página Home.
 * Usa a classe exclusiva `.card-home`, sem dependência da classe genérica `.card`.
 */

export function cardHome({ icon, title, description }) {
    return `
        <div class="card-home">
            <div class="home-card-icon">
                <i data-lucide="${icon}"></i>
            </div>
            <div class="home-card-body">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        </div>
    `;
}
