export function grid({ classe, conteudo }) {
    return `
        <div class="grid ${classe}">
            ${conteudo}
        </div>
    `;
}