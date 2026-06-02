// IMPORTANTE: Importar o utilitário que removemos daqui
import { csvParaObjetos } from '../utils/csvParser.js'; 

const URLS = {
    provas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJReAH_Mb7aiBg3aJdIIWXxxcPcN4cvcQ1Jpj1JMAneQvdbYPIiLjr9U1yWwB4ZOonaQVX_EjvuXKF/pub?gid=46332207&single=true&output=csv",
    questoes: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJReAH_Mb7aiBg3aJdIIWXxxcPcN4cvcQ1Jpj1JMAneQvdbYPIiLjr9U1yWwB4ZOonaQVX_EjvuXKF/pub?gid=76285532&single=true&output=csv",
    respostas: "https://docs.google.com/spreadsheets/d/e/2PACX-1vTJReAH_Mb7aiBg3aJdIIWXxxcPcN4cvcQ1Jpj1JMAneQvdbYPIiLjr9U1yWwB4ZOonaQVX_EjvuXKF/pub?gid=264106829&single=true&output=csv"
};

export let estadoApp = {}; // Mantém o estado global na memória 

export async function inicializarDados() {
    try {
        console.log("Buscando dados das planilhas..."); 
        const [resProvas, resQuestoes, resRespostas] = await Promise.all([
            fetch(URLS.provas).then(r => r.text()),
            fetch(URLS.questoes).then(r => r.text()),
            fetch(URLS.respostas).then(r => r.text())
        ]); 

        // 1. Processar Provas
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

        // 2. Mapear Questões
        csvParaObjetos(resQuestoes).forEach(q => { 
            if (estadoApp[q.ID_Prova]) {
                const questaoId = `${q.Questao_Num}-${q.Tipo}`;
                estadoApp[q.ID_Prova].questoes[questaoId] = {
                    id: questaoId,
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

        // 3. Acoplar as Respostas
        csvParaObjetos(resRespostas).forEach(r => { 
            const prova = estadoApp[r.ID_Prova];
            const questaoId = `${r.Questao_Num}-${r.Tipo}`;
            if (prova && prova.questoes[questaoId]) {
                const questao = prova.questoes[questaoId];
                questao.status = "Resolvida";
                questao.assunto = r.Assunto || questao.assunto; 
                questao.videoUrl = r.URL_Video_Oficial;
                questao.autor = r.Nome_Aluno; 
            }
        }); 

        console.log("Ecossistema de dados carregado!", estadoApp); 
    } catch (erro) {
        console.error("Erro crítico ao processar dados do Google Sheets:", erro); 
    }
}