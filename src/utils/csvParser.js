export function csvParaObjetos(csvTexto) { 
    const textoLimpo = csvTexto.replace(/\r/g, ""); 
    const linhas = textoLimpo.split("\n").map(l => l.trim()).filter(l => l); 
    if (linhas.length === 0) return []; 

    const cabecalhos = linhas[0].split(",").map(c => c.trim()); 
    return linhas.slice(1).map(linha => { 
        const valores = linha.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || linha.split(","); 
        const obj = {};
        cabecalhos.forEach((cabecalho, i) => {
            let valor = valores[i] ? valores[i].trim() : ""; 
            if (valor.startsWith('"') && valor.endsWith('"')) { 
                valor = valor.slice(1, -1); 
            }
            obj[cabecalho] = valor;
        });
        return obj;
    }); 
}