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

        // Mapeamento de Provas_Enade: ID_Prova | Ano | Area_Prova | Modalidade | Numero_Caderno | Link_Prova
        const provasMap = new Map();
        for (let i = 1; i < dadosProvas.length; i++) {
            const row = dadosProvas[i];
            if (row.length >= 5) {
                provasMap.set(row[0], {
                    ano: row[1],
                    area: row[2],
                    modalidade: row[3],
                    caderno: row[4],
                    link: row[5] || '#'
                });
            }
        }

        // Mapeamento de Respostas_Aprovadas: ID_Prova | Questao_Num | Tipo | Nome_Aluno | Assunto | URL_Video_Oficial
        // Usando chave composta baseada em "IDProva_NumeroQuestao"
        const respostasMap = new Map();
        for (let i = 1; i < dadosRespostas.length; i++) {
            const row = dadosRespostas[i];
            if (row.length >= 6) {
                const idProva = row[0];
                const numQuestao = row[1];
                respostasMap.set(`${idProva}_${numQuestao}`, {
                    tipo: row[2],
                    aluno: row[3],
                    assunto: row[4],
                    urlVideo: row[5]
                });
            }
        }

        const bancoDadosFormatado = [];

        // Processamento de Questoes_Enade: ID_Prova | Questao_Num | TipoPagina_PDF
        for (let i = 1; i < dadosQuestoes.length; i++) {
            const row = dadosQuestoes[i];
            if (row.length < 2) continue;

            const idProva = row[0];
            const numQuestao = row[1];

            // Tratamento inteligente caso 'Tipo' e 'Pagina_PDF' venham separados ou juntos
            let tipoBruto = "";
            let pagPDF = "";

            if (row.length >= 4) {
                tipoBruto = row[2];
                pagPDF = row[3];
            } else if (row.length === 3) {
                pagPDF = row[2];
            }

            const idQuestaoComposite = `${idProva}_${numQuestao}`;
            const provaInfo = provasMap.get(idProva) || { ano: '', area: 'Desconhecida', modalidade: 'N/A', caderno: 'UNICO', link: '#' };
            const respostaInfo = respostasMap.get(idQuestaoComposite) || null;

            // Se o tipo não foi especificado na planilha de questões, herda o tipo da resposta aprovada
            if (!tipoBruto && respostaInfo) {
                tipoBruto = respostaInfo.tipo;
            }

            let tipoFormatado = 'objetivas';
            const tipoLower = (tipoBruto || '').toLowerCase();

            if (tipoLower.includes('discursiva')) {
                tipoFormatado = 'discursivas';
            } else if (tipoLower.includes('percepcao') || tipoLower.includes('questionario') || tipoLower.includes('percepção')) {
                tipoFormatado = 'percepcao';
            }
            
            let pdfPathMontado = provaInfo.link;
            if (pagPDF && pdfPathMontado.includes('.pdf')) {
                pdfPathMontado = `${pdfPathMontado}#page=${pagPDF}`;
            }

            bancoDadosFormatado.push({
                id: idQuestaoComposite,
                numero: numQuestao,
                tipo: tipoFormatado,
                curso: provaInfo.area,
                modalidade: provaInfo.modalidade,
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