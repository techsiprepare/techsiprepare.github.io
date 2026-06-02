export function viewHome() {
    return `
        <div class="hero">
            <h1>Resoluções Colaborativas do ENADE</h1>
            <p>Aprenda ativamente gravando vídeos ou consulte o acervo oficial de respostas da comunidade acadêmica.</p>
            <div class="grid-cards">
                <a href="#acervo" class="card card-action">
                    <i data-lucide="book-open" class="icon-lg"></i>
                    <h3>Explorar Acervo</h3>
                    <p>Encontre cadernos de prova, questões abertas ou resolvidas por outros estudantes.</p>
                </a>
                <a href="#tutorial" class="card card-action">
                    <i data-lucide="video" class="icon-lg"></i>
                    <h3>Como Participar</h3>
                    <p>Veja o passo a passo para gravar seus vídeos e garantir suas horas de extensão.</p>
                </a>
            </div>
        </div>
    `;
}