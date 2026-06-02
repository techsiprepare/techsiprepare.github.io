const URLS = {
    provas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJReAH_Mb7aiBg3aJdIIWXxxcPcN4cvcQ1Jpj1JMAneQvdbYPIiLjr9U1yWwB4ZOonaQVX_EjvuXKF/pub?gid=46332207&single=true&output=csv",
    questoes: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJReAH_Mb7aiBg3aJdIIWXxxcPcN4cvcQ1Jpj1JMAneQvdbYPIiLjr9U1yWwB4ZOonaQVX_EjvuXKF/pub?gid=76285532&single=true&output=csv",
    respostas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJReAH_Mb7aiBg3aJdIIWXxxcPcN4cvcQ1Jpj1JMAneQvdbYPIiLjr9U1yWwB4ZOonaQVX_EjvuXKF/pub?gid=264106829&single=true&output=csv"
};

export let estadoApp = {};

function csvParaObjetos(csvTexto) {
    // Remove retornos de carro (\r) para evitar problemas com arquivos gerados no Windows
    const textoLimpo = csvTexto.replace(/\r/g, "");
    const linhas = textoLimpo.split("\n").map(l => l.trim()).filter(l => l);
    if (linhas.length === 0) return [];

    const cabecalhos = linhas[0].split(",").map(c => c.trim());
    return linhas.slice(1).map(linha => {
        // Expressão regular para lidar com campos que possuem vírgulas entre aspas
        const valores = linha.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || linha.split(",");
        const obj = {};
        cabecalhos.forEach((cabecalho, i) => {
            let valor = valores[i] ? valores[i].trim() : "";
            // Remove aspas extras se o campo veio encapsulado do Sheets
            if (valor.startsWith('"') && valor.endsWith('"')) {
                valor = valor.slice(1, -1);
            }
            obj[cabecalho] = valor;
        });
        return obj;
    });
}

export async function inicializarDados() {
    try {
        console.log("Buscando dados das planilhas...");
        const [resProvas, resQuestoes, resRespostas] = await Promise.all([
            fetch(URLS.provas).then(r => r.text()),
            fetch(URLS.questoes).then(r => r.text()),
            fetch(URLS.respostas).then(r => r.text())
        ]);

        // 1. Processar e estruturar as Provas
        csvParaObjetos(resProvas).forEach(p => {
            if (!p.ID_Prova) return;
            estadoApp[p.ID_Prova] = {
                id: p.ID_Prova,
                ano: p.Ano,
                curso: p.Area_Prova,
                modalidade: p.Modalidade,
                caderno: p.Numero_Caderno,
                caminhoPdf: `assets/provas/${p.ID_Prova}.pdf`,
                questoes: {}
            };
        });

        // 2. Mapear as Questões dentro de suas respectivas provas
        csvParaObjetos(resQuestoes).forEach(q => {
            if (estadoApp[q.ID_Prova]) {
                estadoApp[q.ID_Prova].questoes[q.Questao_Num] = {
                    numero: q.Questao_Num,
                    tipo: q.Tipo,
                    paginaPdf: parseInt(q.Pagina_PDF),
                    assunto: "Aguardando catálogo de assunto",
                    status: "Em Aberto",
                    videoUrl: null,
                    autor: null
                };
            }
        });

        // 3. Cruzar e acoplar as Respostas Aprovadas da comunidade
        csvParaObjetos(resRespostas).forEach(r => {
            const prova = estadoApp[r.ID_Prova];
            if (prova && prova.questoes[r.Questao_Num]) {
                const questao = prova.questoes[r.Questao_Num];
                
                // Atualiza os dados da questão com as informações da resolução aprovada
                questao.status = "Resolvida";
                questao.assunto = r.Assunto || questao.assunto;
                questao.videoUrl = r.URL_Video_Oficial;
                questao.autor = r.Nome_Aluno;
            }
        });

        console.log("Ecossistema de dados carregado com sucesso!", estadoApp);
    } catch (erro) {
        console.error("Erro crítico ao processar dados do Google Sheets:", erro);
    }
}