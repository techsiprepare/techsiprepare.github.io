export function pageHeader({ titulo, subtitulo }) {
    return `
        <h2>${titulo}</h2>
        ${subtitulo ? `<p class="subtitle">${subtitulo}</p>` : ''}
    `;
}
