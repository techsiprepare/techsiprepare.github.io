const navItems = [
    { href: '#', icon: 'home', label: 'Home', rota: '' },
    { href: '#acervo', icon: 'book-open', label: 'Acervo', rota: 'acervo' },
    { href: '#tutorial', icon: 'help-circle', label: 'Como Participar', rota: 'tutorial' },
];

function buildLinks(extraClass = '') {
    return navItems.map(item => `
        <a href="${item.href}" class="nav-link ${extraClass}" data-rota="${item.rota}">
            <i data-lucide="${item.icon}"></i>
            ${item.label}
        </a>
    `).join('');
}

export function navbar() {
    return `
        <!-- Overlay do drawer mobile -->
        <div id="nav-overlay" class="nav-overlay" aria-hidden="true"></div>

        <!-- Drawer lateral mobile -->
        <aside id="nav-drawer" class="nav-drawer" aria-label="Menu de navegação" role="navigation">
            <div class="nav-drawer-header">
                <span class="brand-name">TechSI Prepare</span>
                <button id="nav-drawer-close" class="nav-drawer-close" aria-label="Fechar menu">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <nav class="nav-drawer-links">
                ${buildLinks('nav-drawer-link')}
            </nav>
        </aside>

        <!-- Barra de navegação principal -->
        <nav class="navbar" role="navigation" aria-label="Navegação principal">
            <div class="nav-container">
                <a href="#" class="brand">
                    <picture class="brand-logo">
                        <source media="(max-width: 600px)" srcset="img/institucional/logotipos/IFMG-OB-vertical.png">
                        <img src="img/institucional/logotipos/IFMG-OB.png" alt="IFMG Campus Ouro Branco" class="brand-logo-img">
                    </picture>
                    <div class="brand-divider"></div>
                    <div class="brand-text">
                        <span class="brand-name">TechSI Prepare</span>
                        <span class="brand-subtitle">Projeto de Extensão</span>
                    </div>
                </a>
                <div class="nav-links">
                    ${buildLinks()}
                </div>
                <!-- Botão hamburguer (visível apenas no mobile) -->
                <button id="nav-menu-btn" class="nav-menu-btn" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-drawer">
                    <i data-lucide="menu"></i>
                </button>
            </div>
        </nav>
    `;
}

export function atualizarNavActive() {
    const hashCompleta = window.location.hash || '#';
    const [caminhoComHash] = hashCompleta.split('?');
    const rotaAtual = caminhoComHash.replace('#', '');

    document.querySelectorAll('.nav-link').forEach(link => {
        const rotaLink = link.dataset.rota;
        const estaAtivo = rotaLink === rotaAtual || (rotaAtual === 'home' && rotaLink === '');
        link.classList.toggle('active', estaAtivo);
        link.setAttribute('aria-current', estaAtivo ? 'page' : 'false');
    });
}

export function inicializarDrawerMobile() {
    const menuBtn = document.getElementById('nav-menu-btn');
    const drawer = document.getElementById('nav-drawer');
    const overlay = document.getElementById('nav-overlay');
    const closeBtn = document.getElementById('nav-drawer-close');

    if (!menuBtn || !drawer || !overlay || !closeBtn) return;

    function abrirDrawer() {
        drawer.classList.add('aberto');
        overlay.classList.add('visivel');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function fecharDrawer() {
        drawer.classList.remove('aberto');
        overlay.classList.remove('visivel');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', abrirDrawer);
    closeBtn.addEventListener('click', fecharDrawer);
    overlay.addEventListener('click', fecharDrawer);

    drawer.querySelectorAll('.nav-drawer-link').forEach(link => {
        link.addEventListener('click', fecharDrawer);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && drawer.classList.contains('aberto')) fecharDrawer();
    });
}