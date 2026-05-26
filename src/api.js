import { URL_CSV, URL_QUESTOES_JSON } from './config.js';
import { parsearCSV, formatarUrlEmbed } from './utils.js';

export async function buscarDadosPlanilha() {
    try {
        const [respostaPlanilha, respostaJson] = await Promise.all([
            fetch(URL_CSV),
            fetch(URL_QUESTOES_JSON)
        ]);

        if (!respostaPlanilha.ok) throw new Error('Falha ao buscar dados da planilha.');
        if (!respostaJson.ok) throw new Error('Falha ao buscar o arquivo local de questões.');

        const [textoCsv, arvoreQuestoes] = await Promise.all([
            respostaPlanilha.text(),
            respostaJson.json()
        ]);

        const db_todas_questoes = arvoreQuestoes.flatMap(({ curso, anos }) =>
            anos.flatMap(({ ano, cadernos }) =>
                cadernos.flatMap(({ codigo: caderno, pdf_arquivo, objetivas, discursivas }) => {
                    const pdfPathMontado = `img/banco-provas/${curso}/${ano}/${caderno}/${pdf_arquivo}`;

                    return ['objetivas', 'discursivas'].flatMap(tipo => 
                        (tipo === 'objetivas' ? objetivas : discursivas).map(questao => ({
                            id: questao.id,
                            numero: questao.numero,
                            tipo,
                            curso,
                            ano,
                            caderno,
                            img_path: `img/banco-provas/${curso}/${ano}/${caderno}/questoes/${tipo}/${questao.arquivo}`,
                            pdf_path: pdfPathMontado
                        }))
                    );
                })
            )
        );

        // 1. Faz o parse de todas as linhas do CSV vindas da planilha
        const resolucoesBrutas = parsearCSV(textoCsv);

        // 2. FILTRO: Retém apenas os registros que foram marcados estritamente como 'aprovado'
        const resolucoesAprovadas = resolucoesBrutas.filter(res => res.statusValidacao === 'aprovado');

        // 3. Monta o mapa de busca rápida usando apenas as resoluções aprovadas
        const mapaResolucoes = new Map(
            resolucoesAprovadas.map(res => [res.idUnico, res])
        );

        // 4. Executa o cruzamento de dados com a árvore local de questões
        return db_todas_questoes.map(questao => {
            const correspondencia = mapaResolucoes.get(questao.id);

            return correspondencia ? {
                ...questao,
                status: 'done',
                autor: correspondencia.autor,
                video_url: formatarUrlEmbed(correspondencia.video_url)
            } : {
                ...questao,
                status: 'open',
                autor: null,
                video_url: null
            };
        });
    } catch (erro) {
        console.error("Erro técnico capturado:", erro);
        throw erro;
    }
}