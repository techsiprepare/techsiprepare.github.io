/**
 * Extrai o ID do vídeo do YouTube de qualquer formato de link e retorna o formato embed.
 */
export function obterUrlEmbedYoutube(urlOriginal) {
    if (!urlOriginal) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOriginal.match(regExp);

    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return urlOriginal;
}