const PAGINAS_VALIDAS = new Set(['home', 'acervo', 'instrucoes', 'visualizador']);

function atualizarInterface(pageId) {
    const navLinksObj = document.getElementById('main-nav');
    const overlayObj = document.getElementById('menu-overlay');
    
    if (navLinksObj && navLinksObj.classList.contains('open')) {
        navLinksObj.classList.remove('open');
        if (overlayObj) overlayObj.classList.remove('active');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.page.active, .nav-links a.active').forEach(elemento => {
        elemento.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    const activeLink = document.querySelector(`.nav-links a[href="#${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'instant' });
}

export function navigate(pageId, queryString = '') {
    if (!PAGINAS_VALIDAS.has(pageId)) return;
    window.location.hash = queryString ? `${pageId}?${queryString}` : pageId;
}

export function initRouter(onRouteChanged) {
    const resolverRota = () => {
        const hashCompleto = window.location.hash.substring(1);
        const [pageId, queryString] = hashCompleto.split('?');
        
        const paginaAlvo = PAGINAS_VALIDAS.has(pageId) ? pageId : 'home';
        
        atualizarInterface(paginaAlvo);
        
        if (onRouteChanged) {
            onRouteChanged(paginaAlvo, new URLSearchParams(queryString || ''));
        }
    };

    window.addEventListener('hashchange', resolverRota);
    
    resolverRota();
}