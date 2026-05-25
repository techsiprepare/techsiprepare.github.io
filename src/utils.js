export function parsearCSV(texto) {
    const linhas = texto.split(/\r?\n/);
    if (linhas.length <= 1) return [];

    const separador = linhas[0].includes(';') ? ';' : ',';
    const resultados = [];

    for (let i = 1; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        if (!linha) continue;

        const colunas = linha.split(new RegExp(`\\s*${separador}\\s*(?=(?:[^\\"]*\\"[^\\"]*\\")*[^\\"]*$)`));

        if (colunas.length >= 5) {
            resultados.push({
                ano: colunas[0].replace(/"/g, "").trim(),
                numero: colunas[1].replace(/"/g, "").trim(),
                assunto: colunas[2].replace(/"/g, "").trim(),
                autor: colunas[3].replace(/"/g, "").trim(),
                video_url: colunas[4].replace(/"/g, "").trim()
            });
        }
    }
    return resultados;
}

export function formatarUrlEmbed(url) {
    if (url.includes("watch?v=")) {
        return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
        return url.replace("youtu.be/", "youtube.com/embed/");
    }
    return url;
}