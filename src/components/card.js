export function ComponenteCardProva({ id, curso, ano, modalidade, caderno }) {
    return `
        <div class="card prova-card" data-prova-id="${id}">
            <div class="card-thumbnail-wrapper">
                <canvas id="thumb-${id}" class="card-pdf-thumbnail"></canvas>
            </div>
            <div class="card-content-wrapper">
                <h3>${curso} (${ano})</h3>
                <p class="meta">${modalidade} • Caderno ${caderno}</p>
                <a href="#acervo?prova=${id}" class="btn">Ver Questões</a>
            </div>
        </div>
    `;
}