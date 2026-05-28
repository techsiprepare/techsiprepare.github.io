let currentPage = 1;
const ITEMS_PER_PAGE = 12;
const ICON_PENCIL = `<svg width="1em" height="1em" fill="#bababa" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>`;
const ICON_FILTER = `<svg width="1.1em" height="1.1em" fill="currentColor" viewBox="0 0 16 16" style="margin-right: 6px; vertical-align: middle;"><path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.316L10.33 8.56a1.5 1.5 0 0 0-.43 1.052v4.26a.5.5 0 0 1-.754.434l-2.435-1.39A.5.5 0 0 1 6 12.43v-2.82a1.5 1.5 0 0 0-.43-1.052L1.628 3.816A.5.5 0 0 1 1.5 3.5v-2z"/></svg>`;

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

    // NOVO: Inicialização do Filtro de Modalidade
    const selectModalidade = document.getElementById('filter-modalidade');
    if (selectModalidade) {
        const modalidadesUnicas = [...new Set(acervo.map(item => item.modalidade))].filter(Boolean).sort((a, b) => a.localeCompare(b));
        selectModalidade.innerHTML = '<option value="all">Todas as Modalidades</option>';
        modalidadesUnicas.forEach(mod => {
            const option = document.createElement('option');
            option.value = mod;
            option.textContent = mod;
            selectModalidade.appendChild(option);
        });
    }

    // Configuração do comportamento expansível no Mobile
    setupMobileFiltersToggle();
}

function setupMobileFiltersToggle() {
    const toggleBtn = document.getElementById('toggle-filters-btn');
    const container = document.getElementById('filters-selectors-container');
    
    if (toggleBtn && container) {
        // Remove listeners antigos para evitar duplicação
        const clone = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(clone, toggleBtn);

        clone.addEventListener('click', () => {
            const isExpanded = container.classList.toggle('visible');
            clone.setAttribute('aria-expanded', isExpanded);
            clone.innerHTML = isExpanded 
                ? `${ICON_FILTER} Ocultar Filtros` 
                : `${ICON_FILTER} Filtrar Questões`;
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
    const filtroModalidade = document.getElementById('filter-modalidade')?.value || 'all'; // NOVO

    grid.innerHTML = '';
    if (pagContainer) pagContainer.innerHTML = '';

    let filtrados = acervoCruze.filter(item => {
        let matchCurso = (filtroCurso === 'all') || (item.curso === filtroCurso);
        let matchTipo = (filtroTipo === 'all') || (item.tipo === filtroTipo);
        let matchAno = (filtroAno === 'all') || (String(item.ano) === filtroAno);
        let matchStatus = (filtroStatus === 'all') || (item.status === filtroStatus);
        let matchModalidade = (filtroModalidade === 'all') || (item.modalidade === filtroModalidade); // NOVO

        return matchCurso && matchTipo && matchAno && matchStatus && matchModalidade;
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

        const cliquePdfAction = item.pagina_pdf 
            ? `if(/Mobi|Android|iPhone/i.test(navigator.userAgent)){ event.preventDefault(); window.mostrarToast('Nota: Em celulares, o arquivo pode abrir no início. Role manualmente até a <strong>página ${item.pagina_pdf}</strong>.', this.href); }`
            : '';

        const card = document.createElement('div');
        card.className = 'card-questao';
        card.innerHTML = `
            ${midiaVisual}
            <div class="card-content" style="padding: 18px;">
                
                <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
                    <span class="badge" style="background: #b1b1b1; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">${item.curso}</span>
                    <span class="badge" style="background: #4a5568; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; text-transform: uppercase; font-weight: 600;">${item.modalidade}</span>
                    <span class="badge" style="background: ${tipoColor}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${tipoLabel}</span>                    
                    <span class="badge ${statusClass}" style="padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">${statusLabel}</span>
                </div>
                
                <p class="card-subtitle-origem">Enade ${item.ano} — Caderno ${item.caderno}</p>
                <h3 class="card-title-questao">Questão ${item.numero}</h3>
    
                <div class="card-actions" style="display: flex; flex-direction: column; gap: 10px; margin-top: auto;">
                    ${isDone 
                        ? `<p style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 4px;">Resolvida por: <strong>${item.autor}</strong></p>`
                        : `<a href="#instrucoes" onclick="navigate('instrucoes')" class="btn btn-primary" style="text-align: center; padding: 10px; font-weight: 500;">Quero resolver essa questão</a>`
                    }
                    
                    <a href="${item.pdf_path}" onclick="${cliquePdfAction}" target="_blank" class="btn btn-outline" style="text-align: center; font-size: 0.85rem; padding: 10px; border: 1px solid #cbd5e0; text-decoration: none; color: #4a5568; border-radius: 4px; font-weight: 500;">
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
        const filtersElement = document.querySelector('.filters-wrapper');
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

export function mostrarToast(mensagem, urlParaAbrir = null) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 400px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: #2d3748;
        color: #ffffff;
        padding: 14px 18px;
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        line-height: 1.4;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        gap: 12px;
        pointer-events: auto;
        border-left: 4px solid var(--status-open, #ED8936);
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: flex-start;
    `;

    toast.innerHTML = `
        <svg width="18" height="18" fill="var(--status-open, #ED8936)" viewBox="0 0 16 16" style="flex-shrink: 0;">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
        </svg>
        <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 10px;">
            <span>${mensagem}</span>
            ${urlParaAbrir ? `
                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn-toast-cancel" style="background: transparent; color: #cbd5e0; border: none; padding: 6px 12px; font-weight: 500; font-size: 0.8rem; cursor: pointer;">Cancelar</button>
                    <button class="btn-toast-confirm" style="background: var(--status-open, #ED8936); color: white; border: none; padding: 6px 14px; border-radius: 4px; font-weight: 600; font-size: 0.8rem; cursor: pointer;">Abrir PDF</button>
                </div>
            ` : ''}
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 10);

    const fecharToast = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    };

    if (urlParaAbrir) {
        const btnConfirm = toast.querySelector('.btn-toast-confirm');
        const btnCancel = toast.querySelector('.btn-toast-cancel');

        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                window.open(urlParaAbrir, '_blank');
                fecharToast();
            });
        }
        if (btnCancel) {
            btnCancel.addEventListener('click', fecharToast);
        }
    } else {
        setTimeout(fecharToast, 5000);
    }
}

window.mostrarToast = mostrarToast;