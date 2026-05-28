import { URL_PROVAS, URL_QUESTOES, URL_RESPOSTAS } from './config.js';
import { parsearCSV, formatarUrlEmbed } from './utils.js';

export async function buscarDadosPlanilha() {
    try {
        const [resProvas, resQuestoes, resRespostas] = await Promise.all([
            fetch(URL_PROVAS).then(r => r.text()),
            fetch(URL_QUESTOES).then(r => r.text()),
            fetch(URL_RESPOSTAS).then(r => r.text())
        ]);

        const dadosProvas = parsearCSV(resProvas);
        const dadosQuestoes = parsearCSV(resQuestoes);
        const dadosRespostas = parsearCSV(resRespostas);

        const provasMap = new Map();
        for (let i = 1; i < dadosProvas.length; i++) {
            const row = dadosProvas[i];
            if (row.length >= 4) {
                provasMap.set(row[0], {
                    ano: row[1],
                    area: row[2],
                    caderno: row[3],
                    link: row[4] || '#'
                });
            }
        }

        const respostasMap = new Map();
        for (let i = 1; i < dadosRespostas.length; i++) {
            const row = dadosRespostas[i];
            if (row.length >= 4) {
                respostasMap.set(row[0], {
                    aluno: row[1],
                    assunto: row[2],
                    urlVideo: row[3]
                });
            }
        }

        const bancoDadosFormatado = [];

        for (let i = 1; i < dadosQuestoes.length; i++) {
            const row = dadosQuestoes[i];
            if (row.length < 4) continue;

            const idQuestao = row[0];
            const idProva = row[1];
            const numQuestao = row[2];
            const tipoBruto = row[3];
            const pagPDF = row[4] || "";

            const provaInfo = provasMap.get(idProva) || { ano: '', area: 'Desconhecida', caderno: 'UNICO', link: '#' };
            const respostaInfo = respostasMap.get(idQuestao) || null;

            let tipoFormatado = 'objetivas';
            const tipoLower = tipoBruto.toLowerCase();

            if (tipoLower.includes('discursiva')) {
                tipoFormatado = 'discursivas';
            } else if (tipoLower.includes('percepcao') || tipoLower.includes('questionario')) {
                tipoFormatado = 'percepcao';
            }
            
            let pdfPathMontado = provaInfo.link;
            if (pagPDF && pdfPathMontado.includes('.pdf')) {
                pdfPathMontado = `${pdfPathMontado}#page=${pagPDF}`;
            }

            bancoDadosFormatado.push({
                id: idQuestao,
                numero: numQuestao,
                tipo: tipoFormatado,
                curso: provaInfo.area,
                ano: provaInfo.ano,
                caderno: provaInfo.caderno,
                pdf_path: pdfPathMontado,
                pagina_pdf: pagPDF,
                status: respostaInfo ? 'done' : 'open',
                autor: respostaInfo ? respostaInfo.aluno : null,
                video_url: respostaInfo ? formatarUrlEmbed(respostaInfo.urlVideo) : null
            });
        }

        return bancoDadosFormatado;

    } catch (erro) {
        console.error("Erro técnico ao processar banco de dados das planilhas:", erro);
        throw erro;
    }
}