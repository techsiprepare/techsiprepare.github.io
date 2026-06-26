import { estadoApp } from '../api/sheets.js';

export function shareModalTemplate() {
    return `
        <button id="floating-share-btn" class="floating-share-btn" aria-label="Compartilhar Link" style="display: none;">
            <i data-lucide="share-2"></i>
        </button>

        <div id="share-modal-overlay" class="share-modal-overlay">
            <div class="share-modal">
                <div class="share-modal-header">
                    <h3>Compartilhar</h3>
                    <button id="close-share-modal" class="btn-close-modal"><i data-lucide="x"></i></button>
                </div>
                <div class="share-modal-body">
                    <div class="share-input-group" id="group-link-prova">
                        <label>Link da Prova</label>
                        <div class="share-input-row">
                            <input type="text" id="input-link-prova" readonly>
                            <button class="btn-copy" data-target="input-link-prova" title="Copiar"><i data-lucide="copy"></i></button>
                        </div>
                    </div>
                    <div class="share-input-group" id="group-link-pagina" style="display: none;">
                        <label>Link da Página</label>
                        <div class="share-input-row">
                            <input type="text" id="input-link-pagina" readonly>
                            <button class="btn-copy" data-target="input-link-pagina" title="Copiar"><i data-lucide="copy"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function inicializarShareModal() {
    const btnOpen = document.getElementById('floating-share-btn');
    const overlay = document.getElementById('share-modal-overlay');
    const btnClose = document.getElementById('close-share-modal');
    const copyBtns = document.querySelectorAll('.btn-copy');

    if (!btnOpen || !overlay || !btnClose) return;

    btnOpen.addEventListener('click', () => {
        overlay.classList.add('visivel');
    });

    const fecharModal = () => overlay.classList.remove('visivel');

    btnClose.addEventListener('click', fecharModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) fecharModal();
    });

    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                navigator.clipboard.writeText(input.value).then(() => {
                    const originalIcon = btn.innerHTML;
                    btn.classList.add('copied');
                    btn.innerHTML = '<i data-lucide="check"></i>';
                    if (window.lucide) window.lucide.createIcons();

                    setTimeout(() => {
                        btn.classList.remove('copied');
                        btn.innerHTML = originalIcon;
                        if (window.lucide) window.lucide.createIcons();
                    }, 2000);
                });
            }
        });
    });
}

export function atualizarVisibilidadeShare(parametros, rota) {
    const btnOpen = document.getElementById('floating-share-btn');
    const groupProva = document.getElementById('group-link-prova');
    const inputProva = document.getElementById('input-link-prova');
    const groupPagina = document.getElementById('group-link-pagina');
    const inputPagina = document.getElementById('input-link-pagina');

    if (!btnOpen || !inputProva || !inputPagina) return;

    if (!parametros.prova) {
        btnOpen.style.display = 'none';
        return;
    }

    const baseUrl = window.location.origin + window.location.pathname;

    btnOpen.style.display = 'flex';
    inputProva.value = `${baseUrl}#acervo?prova=${parametros.prova}`;

    if (rota === 'visualizar' && (parametros.questao || parametros.pagina)) {
        groupPagina.style.display = 'block';
        let pagina = parametros.pagina;
        
        if (parametros.questao && estadoApp[parametros.prova]) {
            const questao = estadoApp[parametros.prova].questoes[parametros.questao];
            if (questao) {
                pagina = questao.paginaPdf;
            }
        }
        
        inputPagina.value = `${baseUrl}#visualizar?prova=${parametros.prova}&pagina=${pagina || 1}`;
    } else {
        groupPagina.style.display = 'none';
    }
}
