/**
 * @file prova-header.js
 * @description Componente visual para exibir explicitamente o cabeçalho e informações da prova atual.
 */

export function provaHeader({ prova, sufixoContexto = "" }) {
    if (!prova) return '';

    return `
        <div class="prova-context-header">
            <span class="prova-context-tag">Prova Selecionada ${sufixoContexto}</span>
            <h2 class="prova-context-title">${prova.curso} (${prova.ano})</h2>
            <p class="prova-context-meta">
                <strong>Modalidade:</strong> ${prova.modalidade} • <strong>Caderno:</strong> ${prova.caderno}
            </p>
        </div>
    `;
}