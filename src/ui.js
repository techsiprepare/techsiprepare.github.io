let currentPage = 1;
const ITEMS_PER_PAGE = 12;
const ICON_PENCIL = `<svg width="1em" height="1em" fill="#bababa" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>`;

export function inicializarFiltrosDinamicos(acervo) {
    const selectAno = document.getElementById('filter-ano');
    if (selectAno) {
        const anosUnicos = [...new Set(acervo.map(item => item.ano))].sort((a, b) => b - a);
        selectAno.innerHTML = '<option value="all">Todos os Anos</option>';
        anosUnicos.forEach(ano => {
            const option = document.createElement('option');
            option.value = ano;
            option.textContent = `${ano}`;
            selectAno.appendChild(option);
        });
    }

    const selectCurso = document.getElementById('filter-curso');
    if (selectCurso) {
        const cursosUnicos = [...new Set(acervo.map(item => item.curso))].sort((a, b) => a.localeCompare(b));
        selectCurso.innerHTML = '<option value="all">Todos os Cursos</option>';
        cursosUnicos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.textContent = curso;
            selectCurso.appendChild(option);
        });
    }
}

export function renderAcervoGrid(acervoCruze, resetPage = false) {
    if (resetPage) currentPage = 1;

    const grid = document.getElementById('grid-acervo');
    const pagContainer = document.getElementById('pagination-controls');

    const filtroCurso = document.getElementById('filter-curso')?.value || 'all';
    const filtroTipo = document.getElementById('filter-tipo')?.value || 'all';
    const filtroAno = document.getElementById('filter-ano')?.value || 'all';
    const filtroStatus = document.getElementById('filter-status')?.value || 'all';

    grid.innerHTML = '';
    if (pagContainer) pagContainer.innerHTML = '';

    let filtrados = acervoCruze.filter(item => {
        let matchCurso = (filtroCurso === 'all') || (item.curso === filtroCurso);
        let matchTipo = (filtroTipo === 'all') || (item.tipo === filtroTipo);
        let matchAno = (filtroAno === 'all') || (String(item.ano) === filtroAno);
        let matchStatus = (filtroStatus === 'all') || (item.status === filtroStatus);

        return matchCurso && matchTipo && matchAno && matchStatus;
    });

    if (filtrados.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">Nenhuma questão encontrada com esses filtros.</p>';
        return;
    }

    const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtrados.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    pageItems.forEach(item => {
        const isDone = item.status === 'done';

        let midiaVisual = '';
        if (isDone) {
            midiaVisual = `<div class="card-media-wrapper"><iframe src="${item.video_url}" frameborder="0" allowfullscreen></iframe></div>`;
        } else {
            midiaVisual = `
                <div class="card-media-wrapper">
                    <div class="thumb-status-overlay" style="color: var(--status-open, #ED8936);">
                        ${ICON_PENCIL}
                    </div>
                </div>`;
        }

        const statusLabel = isDone ? 'Resolvido' : 'Em Aberto';
        const statusClass = isDone ? 'badge-status-done' : 'badge-status-open';

        let tipoLabel = 'Objetiva';
        let tipoColor = '#b1b1b1';

        if (item.tipo === 'discursivas') {
            tipoLabel = 'Discursiva';
            tipoColor = '#d69e2e';
        } else if (item.tipo === 'percepcao') {
            tipoLabel = 'Percepção';
            tipoColor = '#319795';
        }

        const textoBotaoPdf = item.pagina_pdf 
            ? `Ver questão na página ${item.pagina_pdf} do PDF` 
            : 'Visualizar questão no caderno';

        const avisoMobile = item.pagina_pdf 
        ? `if(/Mobi|Android|iPhone/i.test(navigator.userAgent)){ alert('Nota: Em celulares, o PDF pode abrir na primeira página. Desça manualmente até a página ${item.pagina_pdf}.'); }`
        : '';

        const card = document.createElement('div');
        card.className = 'card-questao';
        card.innerHTML = `
            ${midiaVisual}
            <div class="card-content" style="padding: 18px;">
                
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
                    <span class="badge" style="background: #b1b1b1; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">${item.curso}</span>
                    <span class="badge" style="background: ${tipoColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${tipoLabel}</span>                    
                    <span class="badge ${statusClass}" style="padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${statusLabel}</span>
                </div>
                
                <p class="card-subtitle-origem">Enade ${item.ano} — ${item.caderno === 'UNICO' ? 'Caderno Único' : item.caderno}</p>
                <h3 class="card-title-questao">Questão ${item.numero}</h3>
                
                <div class="card-actions" style="display: flex; flex-direction: column; gap: 10px; margin-top: auto;">
                    ${isDone 
                        ? `<p style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 4px;">Resolvida por: <strong>${item.autor}</strong></p>` 
                        : `<a href="#instrucoes" onclick="navigate('instrucoes')" class="btn btn-primary" style="text-align: center; padding: 10px; font-weight: 500;">Quero resolver essa questão</a>`
                    }

                    <a href="${item.pdf_path}" onclick="${avisoMobile}" target="_blank" class="btn btn-outline" style="text-align: center; font-size: 0.85rem; padding: 10px; border: 1px solid #cbd5e0; text-decoration: none; color: #4a5568; border-radius: 4px; font-weight: 500;">
                        ${textoBotaoPdf}
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    if (pagContainer) {
        renderPaginationControls(totalPages, pagContainer);
    }
}

function renderPaginationControls(totalPages, container) {
    if (totalPages <= 1) return;

    const scrollToGrid = () => {
        const filtersElement = document.querySelector('.filters');
        if (filtersElement) {
            window.scrollTo({ top: filtersElement.offsetTop - 20, behavior: 'smooth' });
        }
    };

    const btnPrev = document.createElement('button');
    btnPrev.textContent = '«';
    btnPrev.className = 'btn btn-outline';
    btnPrev.style.cssText = 'padding: 8px 16px; background: white; border: 1px solid #cbd5e0; border-radius: 4px; color: #4a5568; font-size: 0.85rem;';
    btnPrev.disabled = currentPage === 1;
    btnPrev.style.opacity = btnPrev.disabled ? '0.5' : '1';
    btnPrev.style.cursor = btnPrev.disabled ? 'not-allowed' : 'pointer';
    btnPrev.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            window.renderAcervo(false);
            scrollToGrid();
        }
    };
    container.appendChild(btnPrev);

    const info = document.createElement('span');
    info.textContent = `Página ${currentPage} de ${totalPages}`;
    info.style.cssText = 'display: flex; align-items: center; padding: 0 16px; font-weight: 500; color: #2d3748; font-size: 0.9rem;';
    container.appendChild(info);

    const btnNext = document.createElement('button');
    btnNext.textContent = '»';
    btnNext.className = 'btn btn-outline';
    btnNext.style.cssText = 'padding: 8px 16px; background: white; border: 1px solid #cbd5e0; border-radius: 4px; color: #4a5568; font-size: 0.85rem;';
    btnNext.disabled = currentPage === totalPages;
    btnNext.style.opacity = btnNext.disabled ? '0.5' : '1';
    btnNext.style.cursor = btnNext.disabled ? 'not-allowed' : 'pointer';
    btnNext.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            window.renderAcervo(false);
            scrollToGrid();
        }
    };
    container.appendChild(btnNext);
}

export function renderErro() {
    const grid = document.getElementById('grid-acervo');
    grid.innerHTML = `
        <p style="grid-column: 1/-1; text-align: center; color: var(--ifmg-red, #CD192E); padding: 40px; font-weight: 500;">
            ⚠️ Erro ao carregar o acervo em tempo real. Verifique a conexão ou a publicação da planilha.
        </p>`;
}
