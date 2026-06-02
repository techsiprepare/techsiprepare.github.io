export function ComponenteCardAcao({ href, icone, titulo, descricao }) {
    return `
        <a href="${href}" class="card card-action">
            <i data-lucide="${icone}" class="icon-lg"></i>
            <h3>${titulo}</h3>
            <p>${descricao}</p>
        </a>
    `;
}