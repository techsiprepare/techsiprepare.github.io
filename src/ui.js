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

    // Seletores normais
    const filtroCurso = document.getElementById('filter-curso')?.value || 'all';
    const filtroTipo = document.getElementById('filter-tipo')?.value || 'all';
    const filtroAno = document.getElementById('filter-ano')?.value || 'all';
    const filtroModalidade = document.getElementById('filter-modalidade')?.value || 'all';

    // NOVO: Captura o valor da aba de status ativa (procura pelo elemento com a classe 'active')
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

    // Aplica efeito de transição/piscar na Grid para indicar atualização
    // Estes estilos inline foram mantidos por fazerem parte da lógica de animação JS
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

        // 1. Área de Mídia Superior (Proporção 16:9)
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

        // Configurações do Badge de Status
        const statusLabel = isDone ? 'RESOLVIDO' : 'EM ABERTO';
        const badgeClass = isDone ? 'badge-done' : 'badge-open';

        const textoBotaoPdf = item.pagina_pdf
            ? `Ver questão na página ${item.pagina_pdf} do PDF`
            : 'Visualizar questão no caderno';

        const cliquePdfAction = item.pagina_pdf
            ? `if(/Mobi|Android|iPhone/i.test(navigator.userAgent)){ event.preventDefault(); window.mostrarToast('Nota: Em celulares, o arquivo pode abrir no início. Role manualmente até a <strong>página ${item.pagina_pdf}</strong>.', this.href); }`
            : '';

        // Formatação para "Questão 08" (Adiciona o zero à esquerda)
        const numeroFormatado = String(item.numero).padStart(2, '0');
        const modalidadeFormatada = item.modalidade ? ` (${item.modalidade})` : '';

        // Tratamento da string do tipo para exibição (ex: 'objetivas' -> 'Objetiva')
        let tipoExibicao = item.tipo ? item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1) : 'Objetiva';
        if (tipoExibicao.endsWith('s')) {
            tipoExibicao = tipoExibicao.slice(0, -1);
        }
        if (tipoExibicao.toLowerCase().includes('percepcao')) {
            tipoExibicao = 'Percepção';
        }

        const card = document.createElement('div');
        card.className = 'card-questao';

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
                : `<a href="#instrucoes" onclick="navigate('instrucoes')" class="btn btn-primary btn-resolver">Quero resolver essa questão</a>`
            }
                    <a href="${item.pdf_path}" onclick="${cliquePdfAction}" target="_blank" class="btn btn-outline btn-pdf">
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

export function mostrarToast(mensagem, urlParaAbrir = null) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';

    toast.innerHTML = `
        <svg class="toast-icon" width="18" height="18" fill="var(--status-open, #ED8936)" viewBox="0 0 16 16">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
        </svg>
        <div class="toast-content">
            <span>${mensagem}</span>
            ${urlParaAbrir ? `
                <div class="toast-actions">
                    <button class="btn-toast-cancel">Cancelar</button>
                    <button class="btn-toast-confirm">Abrir PDF</button>
                </div>
            ` : ''}
        </div>
    `;

    container.appendChild(toast);

    // Usa-se setTimeout e estilos inline aqui para disparar a animação (override no CSS)
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