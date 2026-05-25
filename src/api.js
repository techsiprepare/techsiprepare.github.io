import { URL_CSV, db_todas_questoes } from './config.js';
import { parsearCSV, formatarUrlEmbed } from './utils.js';

export async function buscarDadosPlanilha() {
    try {
        const resposta = await fetch(URL_CSV);
        if (!resposta.ok) throw new Error('Falha de comunicação com o servidor da planilha.');
        
        const textoCsv = await resposta.text();
        const resolucoesAprovadas = parsearCSV(textoCsv);
        
        return db_todas_questoes.map(questao => {
            const correspondencia = resolucoesAprovadas.find(res => 
                String(res.ano) === String(questao.ano) && 
                String(res.numero) === String(questao.numero)
            );

            if (correspondencia) {
                return {
                    ...questao,
                    status: 'done',
                    autor: correspondencia.autor,
                    video_url: formatarUrlEmbed(correspondencia.video_url)
                };
            } else {
                return {
                    ...questao,
                    status: 'open',
                    autor: null,
                    video_url: null
                };
            }
        });
    } catch (erro) {
        console.error("Erro técnico capturado:", erro);
        throw erro;
    }
}