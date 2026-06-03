export function viewHome() {
    return `
        <div class="hero home-view">
            <h1>Colaboração que gera conhecimento.</h1>
            <p>O TechSI Prepare é um ecossistema focado na resolução colaborativa das questões do ENADE para Sistemas de Informação. Desenvolva suas habilidades explicando, e estude pelo material dos seus colegas.</p>
            
            <a href="#acervo" class="btn btn-hero">Explorar o Acervo</a>
            
            <div class="grid-cards home-cards">
                <div class="card">
                    <h3>Foco e Objetivo</h3>
                    <p>Preparar os estudantes para o exame do ENADE através da técnica de aprendizado ativo. O objetivo é construir uma biblioteca de resoluções em vídeo, clara e acessível, mapeando todas as provas passadas.</p>
                </div>
                <div class="card">
                    <h3>Público Alvo</h3>
                    <p>Estudantes do curso de Sistemas de Informação que desejam se preparar para as provas, e alunos que buscam horas de extensão contribuindo ativamente com a resolução de questões abertas.</p>
                </div>
                <div class="card">
                    <h3>Quem pode participar?</h3>
                    <p>Qualquer estudante regularmente matriculado no IFMG. A submissão de vídeos passa por avaliação e, se aprovada, é publicada no nosso acervo oficial, contabilizando carga horária de extensão.</p>
                </div>
            </div>
        </div>
    `;
}