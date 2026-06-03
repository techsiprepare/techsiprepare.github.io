export function stepTimeline({ numero, icone, titulo, descricao }) {
    return `
        <div class="step">
            <div class="step-num"><i data-lucide="${icone}"></i></div>
            <div class="step-content">
                <h3>${numero}. ${titulo}</h3>
                <div class="step-desc">${descricao}</div>
            </div>
        </div>
    `;
}
