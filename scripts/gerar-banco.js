import fs from 'fs';
import path from 'path';

const baseDir = './img/banco-provas';
const outputPath = './data/questoes.json';

function gerarBancoQuestoes() {
    try {
        if (!fs.existsSync(baseDir)) {
            console.error(`❌ Erro: O diretório base "${baseDir}" não foi encontrado.`);
            return;
        }

        const arvoreBanco = [];

        // 1. Varre os Cursos
        const cursos = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

        cursos.forEach(curso => {
            const caminhoCurso = path.join(baseDir, curso);
            const prefixoCurso = curso
                .toUpperCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^A-Z]/g, "")
                .slice(0, 3);

            const cursoNode = { curso: curso, anos: [] };

            // 2. Varre os Anos
            const anos = fs.readdirSync(caminhoCurso).filter(f => fs.statSync(path.join(caminhoCurso, f)).isDirectory() && !isNaN(f));

            anos.forEach(ano => {
                const caminhoAno = path.join(caminhoCurso, ano);
                const anoNode = { ano: parseInt(ano, 10), cadernos: [] };

                // 3. Varre os Cadernos (Ex: "UNICO" ou "1801")
                const codigosCaderno = fs.readdirSync(caminhoAno).filter(f => fs.statSync(path.join(caminhoAno, f)).isDirectory());

                codigosCaderno.forEach(codigoCaderno => {
                    const caminhoCaderno = path.join(caminhoAno, codigoCaderno);

                    const cadernoNode = {
                        codigo: codigoCaderno, 
                        pdf_arquivo: 'prova.pdf',
                        objetivas: [],
                        discursivas: []
                    };

                    // 4. Varre os Tipos de Questões (objetivas / discursivas)
                    ['objetivas', 'discursivas'].forEach(tipo => {
                        const caminhoTipo = path.join(caminhoCaderno, 'questoes', tipo);

                        if (fs.existsSync(caminhoTipo)) {
                            const arquivosQuestao = fs.readdirSync(caminhoTipo).filter(arq => arq.endsWith('.webp'));

                            arquivosQuestao.forEach(arq => {
                                const numeroStr = path.basename(arq, '.webp');
                                const numeroPadrao = numeroStr.replace(/\D/g, '').padStart(2, '0');
                                const sufixoTipo = tipo === 'objetivas' ? 'OBJ' : 'DIS';

                                // Gera o ID utilizando diretamente o nome da pasta (codigoCaderno)
                                const idUnico = `${prefixoCurso}-${ano}-${codigoCaderno}-${sufixoTipo}${numeroPadrao}`;

                                cadernoNode[tipo].push({
                                    id: idUnico,
                                    numero: parseInt(numeroPadrao, 10),
                                    arquivo: arq
                                });
                            });
                        }
                    });

                    anoNode.cadernos.push(cadernoNode);
                });

                if (anoNode.cadernos.length > 0) cursoNode.anos.push(anoNode);
            });

            if (cursoNode.anos.length > 0) arvoreBanco.push(cursoNode);
        });

        const dirOutput = path.dirname(outputPath);
        if (!fs.existsSync(dirOutput)) fs.mkdirSync(dirOutput, { recursive: true });

        fs.writeFileSync(outputPath, JSON.stringify(arvoreBanco, null, 2), 'utf-8');
        console.log(`\n✅ Sucesso! O arquivo "${outputPath}" foi gerado utilizando o padrão UNICO.`);

    } catch (erro) {
        console.error("❌ Erro ao gerar o arquivo de dados local:", erro);
    }
}

gerarBancoQuestoes();