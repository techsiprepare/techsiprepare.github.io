/**
 * Componente para blocos de conteúdo da barra lateral
 * @param {Object} props
 * @param {string} [props.titulo] - Título opcional da seção (h3 ou h4)
 * @param {string} props.conteudo - O HTML interno da caixa (vídeo, listas, etc.)
 * @param {boolean} [props.isSubsecao=false] - Se verdadeiro, usa h4 em vez de h3 para hierarquia
 */
export function ComponenteSidebarBox({ titulo, conteudo, isSubsecao = false }) {
    const tagTitulo = isSubsecao ? 'h4' : 'h3';
    
    return `
        <div class="side-box">
            ${titulo ? `<${tagTitulo}>${titulo}</${tagTitulo}>` : ''}
            ${conteudo}
        </div>
    `;
}