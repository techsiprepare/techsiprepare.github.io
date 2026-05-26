export function parsearCSV(texto) {
    const linhas = texto.split(/\r?\n/);
    if (linhas.length <= 1) return [];

    const separador = linhas[0].includes(';') ? ';' : ',';
    const resultados = [];

    for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        if (!linha) continue;

        const colunas = linha.split(new RegExp(`\\s*${separador}\\s*(?=(?:[^\\"]*\\"[^\\"]*\\")*[^\\"]*$)`));

        if (colunas.length >= 4) {
            const statusVal = colunas[4] ? colunas[4].replace(/"/g, "").trim().toLowerCase() : "";

            resultados.push({
                idUnico: colunas[0].replace(/"/g, "").trim(),   // Coluna A
                autor: colunas[1].replace(/"/g, "").trim(),     // Coluna B
                assunto: colunas[2].replace(/"/g, "").trim(),   // Coluna C
                video_url: colunas[3].replace(/"/g, "").trim(), // Coluna D
                statusValidacao: statusVal                      // Coluna E
            });
        }
    }
    return resultados;
}

export function formatarUrlEmbed(url) {
    if (!url) return "";
    if (url.includes("youtube.com/embed/")) return url;
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) {
        const urlSemQuery = url.split('?')[0];
        const idVideo = urlSemQuery.substring(urlSemQuery.lastIndexOf('/') + 1);
        return `https://www.youtube.com/embed/${idVideo}`;
    }
    return url;
}