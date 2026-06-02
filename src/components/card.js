export function ComponenteCardProva({ id, curso, ano, modalidade, caderno }) {
    return `
        <div class="card prova-card">
            <h3>${curso} (${ano})</h3>
            <p class="meta">${modalidade} • Caderno ${caderno}</p>
            <a href="#acervo?prova=${id}" class="btn">Ver Questões</a>
        </div>
    `;
}