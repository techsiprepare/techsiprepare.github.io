/**
 * Componente para padronizar o topo das páginas/views
 * @param {Object} props
 * @param {string} props.titulo - O título principal da página (h2)
 * @param {string} [props.subtitulo] - Subtítulo opcional
 */
export function pageHeader({ titulo, subtitulo }) {
    return `
        <h2>${titulo}</h2>
        ${subtitulo ? `<p class="subtitle">${subtitulo}</p>` : ''}
    `;
}
