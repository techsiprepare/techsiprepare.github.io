let currentPage = 1;
const ITEMS_PER_PAGE = 12;
const ICON_PENCIL = `<svg width="1em" height="1em" fill="#bababa" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>`;
const ICON_FILTER = `<svg class="icon-filter-svg" width="1.1em" height="1.1em" fill="currentColor" viewBox="0 0 16 16"><path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.316L10.33 8.56a1.5 1.5 0 0 0-.43 1.052v4.26a.5.5 0 0 1-.754.434l-2.435-1.39A.5.5 0 0 1 6 12.43v-2.82a1.5 1.5 0 0 0-.43-1.052L1.628 3.816A.5.5 0 0 1 1.5 3.5v-2z"/></svg>`;

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

    setupMobileFiltersToggle();
}

function setupMobileFiltersToggle() {
    const toggleBtn = document.getElementById('toggle-filters-btn');
    const container = document.getElementById('filters-selectors-container');

    if (toggleBtn && container) {
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
    const contadorContainer = document.getElementById('acervo-contador');

    const filtroCurso = document.getElementById('filter-curso')?.value || 'all';
    const filtroTipo = document.getElementById('filter-tipo')?.value || 'all';
    const filtroAno = document.getElementById('filter-ano')?.value || 'all';
    const filtroModalidade = document.getElementById('filter-modalidade')?.value || 'all';

    const abaStatusAtiva = document.querySelector('.status-tab.active');
    const filtroStatus = abaStatusAtiva ? abaStatusAtiva.getAttribute('data-status') : 'all';

    grid.innerHTML = '';
    if (pagContainer) pagContainer.innerHTML = '';

    let filtrados = acervoCruze.filter(item => {
        let matchCurso = (filtroCurso === 'all') || (item.curso === filtroCurso);
        let matchTipo = (filtroTipo === 'all') || (item.tipo === filtroTipo);
        let matchAno = (filtroAno === 'all') || (String(item.ano) === filtroAno);
        let matchStatus = (filtroStatus === 'all') || (item.status === filtroStatus);
        let matchModalidade = (filtroModalidade === 'all') || (item.modalidade === filtroModalidade);

        return matchCurso && matchTipo && matchAno && matchStatus && matchModalidade;
    });

    if (contadorContainer) {
        const temFiltroAtivo = filtroCurso !== 'all' || filtroTipo !== 'all' || filtroAno !== 'all' || filtroStatus !== 'all' || filtroModalidade !== 'all';

        if (filtrados.length === 0) {
            contadorContainer.innerHTML = `Nenhuma questão encontrada.`;
        } else {
            contadorContainer.innerHTML = `Identificamos <strong>${filtrados.length}</strong> ${filtrados.length === 1 ? 'questão' : 'questões'}${temFiltroAtivo ? ' para os filtros aplicados' : ''}.`;
        }
    }

    if (filtrados.length === 0) {
        grid.innerHTML = '<p class="grid-empty-message">Nenhuma questão encontrada com esses filtros.</p>';
        return;
    }

    grid.style.opacity = '0';
    grid.style.transform = 'translateY(8px)';
    grid.style.transition = 'none';

    setTimeout(() => {
        grid.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';
        grid.style.opacity = '1';
        grid.style.transform = 'translateY(0)';
    }, 30);

    const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtrados.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    pageItems.forEach(item => {
        const isDone = item.status === 'done';

        let midiaVisual = '';
        if (isDone) {
            midiaVisual = `<div class="card-media-wrapper card-media-video">
                <iframe src="${item.video_url}" class="card-media-iframe" allowfullscreen></iframe>
            </div>`;
        } else {
            const novoIconeLapis = `<svg width="28" height="28" fill="#94a3b8" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/></svg>`;
            midiaVisual = `
                <div class="card-media-wrapper card-media-empty">
                    ${novoIconeLapis}
                </div>`;
        }

        const statusLabel = isDone ? 'RESOLVIDO' : 'EM ABERTO';
        const badgeClass = isDone ? 'badge-done' : 'badge-open';

        const paginaDestino = item.pagina_pdf ? parseInt(item.pagina_pdf, 10) : 1;

        const textoBotaoPdf = item.pagina_pdf
            ? `Ver página daquestão`
            : 'Visualizar caderno de prova';

        const numeroFormatado = String(item.numero).padStart(2, '0');
        const modalidadeFormatada = item.modalidade ? ` (${item.modalidade})` : '';

        let tipoExibicao = item.tipo ? item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1) : 'Objetiva';
        if (tipoExibicao.endsWith('s')) {
            tipoExibicao = tipoExibicao.slice(0, -1);
        }
        if (tipoExibicao.toLowerCase().includes('percepcao')) {
            tipoExibicao = 'Percepção';
        }

        const card = document.createElement('div');
        card.className = 'card-questao';

        const cliqueVisualizador = `window.abrirNoVisualizadorLocal('${item.id_prova}', ${paginaDestino}, '${item.ano}', '${item.curso}', '${numeroFormatado}', '${tipoExibicao}')`;

        card.innerHTML = `
            ${midiaVisual}
            
            <div class="card-content">
                
                <div class="card-header">
                    <span class="card-ano">Enade ${item.ano}</span>
                    <span class="card-badge ${badgeClass}">${statusLabel}</span>
                </div>

                <div class="card-curso">
                    ${item.curso}${modalidadeFormatada}
                </div>
                
                <div class="card-caderno">
                    Caderno ${item.caderno}
                </div>

                <h3 class="card-title">Q. ${numeroFormatado} - ${tipoExibicao}</h3>

                <div class="card-actions">
                    ${isDone
                ? `<p class="card-author">Resolvida por: <strong>${item.autor}</strong></p>`
                : `<a href="#instrucoes" onclick="navigate('instrucoes')" class="btn btn-primary">Quero resolver essa questão</a>`
            }
                    <button onclick="event.preventDefault(); ${cliqueVisualizador}" class="btn btn-outline">
                        ${textoBotaoPdf}
                    </button>
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
    btnPrev.className = 'btn btn-outline btn-pagination';
    btnPrev.disabled = currentPage === 1;
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
    info.className = 'pagination-info';
    container.appendChild(info);

    const btnNext = document.createElement('button');
    btnNext.textContent = '»';
    btnNext.className = 'btn btn-outline btn-pagination';
    btnNext.disabled = currentPage === totalPages;
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
        <p class="error-message">
            ⚠️ Erro ao carregar o acervo em tempo real. Verifique a conexão ou a publicação da planilha.
        </p>`;
}