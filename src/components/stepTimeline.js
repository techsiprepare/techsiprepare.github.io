export function ComponentePassoTimeline({ numero, icone, titulo, descricao }) {
    return `
        <div class="step">
            <div class="step-num"><i data-lucide="${icone}"></i></div>
            <div class="step-content">
                <h3>${numero}. ${titulo}</h3>
                <p>${descricao}</p>
            </div>
        </div>
    `;
}