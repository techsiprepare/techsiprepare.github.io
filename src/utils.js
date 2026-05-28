export function parsearCSV(texto) {
    const linhas = texto.split(/\r?\n/);
    if (linhas.length === 0) return [];

    const separador = linhas[0].includes(';') ? ';' : ',';
    
    return linhas
        .filter(linha => linha.trim() !== "")
        .map(linha => {
            const colunas = linha.split(new RegExp(`\\s*${separador}\\s*(?=(?:[^\\"]*\\"[^\\"]*\\")*[^\\"]*$)`));
            return colunas.map(val => val.replace(/^"|"$/g, '').trim());
        });
}

export function formatarUrlEmbed(url) {
    if (!url) return "";
    
    if (url.includes("youtube.com/embed/")) return url;

    try {
        let idVideo = "";

        if (url.includes("youtu.be/")) {
            const parteAposDominio = url.split("youtu.be/")[1];
            idVideo = parteAposDominio.split(/[?#]/)[0];
        } else if (url.includes("shorts/")) {
            const parteAposShorts = url.split("shorts/")[1];
            idVideo = parteAposShorts.split(/[?#]/)[0];
        } else if (url.includes("v=")) {
            const urlObj = new URL(url);
            idVideo = urlObj.searchParams.get("v");
        }

        if (idVideo) {
            return `https://www.youtube.com/embed/${idVideo}`;
        }
    } catch (erro) {
        console.error("Erro ao converter URL do YouTube:", erro);
    }

    return url;
}