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
            const prefixoCurso = curso.slice(0, 3).toUpperCase();
            
            const cursoNode = { curso: curso, anos: [] };

            // 2. Varre os Anos
            const anos = fs.readdirSync(caminhoCurso).filter(f => fs.statSync(path.join(caminhoCurso, f)).isDirectory() && !isNaN(f));

            anos.forEach(ano => {
                const caminhoAno = path.join(caminhoCurso, ano);
                const anoNode = { ano: parseInt(ano, 10), cadernos: [] };

                // 3. Varre os Cadernos
                const codigosCaderno = fs.readdirSync(caminhoAno).filter(f => fs.statSync(path.join(caminhoAno, f)).isDirectory());

                codigosCaderno.forEach(codigoCaderno => {
                    const caminhoCaderno = path.join(caminhoAno, codigoCaderno);
                    const idCaderno = codigoCaderno === 'caderno-unico' ? 'UNI' : codigoCaderno;
                    
                    // Nó do Caderno inicializando as chaves garantidamente vazias
                    const cadernoNode = {
                        codigo: codigoCaderno,
                        pdf_arquivo: 'prova.pdf',
                        objetivas: [],
                        discursivas: []
                    };

                    // 4. Varre os arquivos segregando por chave com segurança
                    ['objetivas', 'discursivas'].forEach(tipo => {
                        const caminhoPastaQuestoes = path.join(caminhoCaderno, 'questoes', tipo);
                        
                        if (fs.existsSync(caminhoPastaQuestoes)) {
                            const arquivos = fs.readdirSync(caminhoPastaQuestoes).filter(arq => arq.endsWith('.webp'));
                            
                            arquivos.forEach(arq => {
                                const numeroStr = path.basename(arq, '.webp');
                                const numeroPadrao = numeroStr.replace(/\D/g, '').padStart(2, '0');
                                const sufixoTipo = tipo === 'objetivas' ? 'OBJ' : 'DIS';
                                
                                const idUnico = `${prefixoCurso}-${ano}-${idCaderno}-${sufixoTipo}${numeroPadrao}`;
                                
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
        console.log(`\n✅ Sucesso! O arquivo "${outputPath}" foi gerado e agora suporta cadernos vazios/incompletos.`);

    } catch (erro) {
        console.error("❌ Erro ao gerar o arquivo de dados local:", erro);
    }
}

gerarBancoQuestoes();