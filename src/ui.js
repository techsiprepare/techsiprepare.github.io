export function renderAcervoGrid(acervoCruze) {
    const grid = document.getElementById('grid-acervo');
    const filtroAno = document.getElementById('filter-ano').value;
    const filtroStatus = document.getElementById('filter-status').value;
    
    grid.innerHTML = '';

    let filtrados = acervoCruze.filter(item => {
        let matchAno = (filtroAno === 'all') || (item.ano.toString() === filtroAno);
        let matchStatus = (filtroStatus === 'all') || (item.status === filtroStatus);
        return matchAno && matchStatus;
    });

    if (filtrados.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Nenhuma questão corresponde aos filtros selecionados.</p>';
        return;
    }

    filtrados.forEach(item => {
        const isDone = item.status === 'done';
        const tagClass = isDone ? 'tag-done' : 'tag-open';
        const tagText = isDone ? '✓ Resolvida' : 'Em aberto';
        
        const midiaVisual = isDone 
            ? `<div class="card-media-wrapper">
                 <iframe src="${item.video_url}" frameborder="0" allowfullscreen></iframe>
               </div>`
            : `<div class="card-media-wrapper">
                 <img src="${item.img_path}" alt="Questão ${item.numero}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100%\\' height=\\'100%\\' viewBox=\\'0 0 100 100\\'><text x=\\'50%\\' y=\\'50%\\' font-size=\\'8\\' text-anchor=\\'middle\\' fill=\\'%23718096\\'>Enunciado (${item.id}.webp)</text></svg>';">
               </div>`;
        
        const metaInformacao = isDone 
            ? `Solução por: <strong>${item.autor}</strong>`
            : `<strong>Questão Livre!</strong><br><span style="font-size: 0.85rem; color: var(--text-muted);">Grave sua tela e garanta suas horas complementares.</span>`;

        const botaoVisualizar = `<button onclick="window.abrirModalImagem('${item.img_path}')" class="btn btn-secondary" style="width: 100%; font-size: 0.85rem; padding: 10px; display: flex; align-items: center; justify-content: center; gap: 6px;">
            🔍 Ver Enunciado Completo
        </button>`;

        const botaoAcao = isDone
            ? `<div class="card-actions" style="margin-top: auto; display: flex; flex-direction: column; gap: 8px;">
                ${botaoVisualizar}
               </div>` 
            : `<div class="card-actions" style="margin-top: auto; display: flex; flex-direction: column; gap: 8px;">
                <a href="#instrucoes" onclick="navigate('instrucoes')" class="btn btn-primary" style="font-size: 0.85rem; padding: 10px;">Quero Resolver</a>
                ${botaoVisualizar}
               </div>`;

        const card = document.createElement('div');
        card.className = 'card-questao';
        card.innerHTML = `
            ${midiaVisual}
            <div class="card-content">
                <div class="card-header-top">
                    <span class="tag" style="background: #EDF2F7; color: #4A5568;">ENADE ${item.ano}</span>
                    <span class="tag ${tagClass}">${tagText}</span>
                </div>
                <h3 class="card-title">Questão ${item.numero}</h3>
                <p class="card-meta">${metaInformacao}</p>
                ${botaoAcao}
            </div>
        `;
        grid.appendChild(card);
    });
}

export function renderErro() {
    const grid = document.getElementById('grid-acervo');
    grid.innerHTML = `
        <p style="grid-column: 1/-1; text-align: center; color: var(--ifmg-red); padding: 40px;">
            ⚠️ Erro ao carregar o acervo em tempo real. Verifique a conexão ou a publicação da planilha.
        </p>`;
}

function inicializarModalSeNecessario() {
    if (!document.getElementById('modal-preview-imagem')) {
        const modal = document.createElement('div');
        modal.id = 'modal-preview-imagem';
        modal.className = 'modal-preview';
        modal.innerHTML = `
            <div class="modal-preview-content">
                <button class="modal-preview-close" onclick="document.getElementById('modal-preview-imagem').classList.remove('active')">&times;</button>
                <img id="modal-preview-img-element" src="" alt="Enunciado Completo" class="modal-preview-img">
            </div>
        `;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
        
        document.body.appendChild(modal);
    }
}

window.abrirModalImagem = (src) => {
    inicializarModalSeNecessario();
    const modal = document.getElementById('modal-preview-imagem');
    const img = document.getElementById('modal-preview-img-element');
    img.src = src;
    modal.classList.add('active');
};