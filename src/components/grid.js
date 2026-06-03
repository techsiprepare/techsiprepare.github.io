/**
 * Componente container para listagens em formato de Grid
 * @param {Object} props
 * @param {string} props.classe - Classe CSS específica (ex: 'grid-cards' ou 'grid-provas')
 * @param {string} props.conteudo - Strings HTML dos itens filhos (cards) compilados
 */
export function grid({ classe, conteudo }) {
    return `
        <div class="grid ${classe}">
            ${conteudo}
        </div>
    `;
}