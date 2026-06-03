export function sidebarBox({ titulo, conteudo, isSubsecao = false }) {
    const tagTitulo = isSubsecao ? 'h4' : 'h3';

    return `
        <div class="side-box">
            ${titulo ? `<${tagTitulo}>${titulo}</${tagTitulo}>` : ''}
            ${conteudo}
        </div>
    `;
}
