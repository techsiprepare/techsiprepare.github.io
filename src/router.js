const PAGINAS_VALIDAS = new Set(['home', 'acervo', 'instrucoes']);

export function navigate(pageId) {
    if (!PAGINAS_VALIDAS.has(pageId)) return;

    document.querySelectorAll('.page.active, .nav-links a.active').forEach(elemento => {
        elemento.classList.remove('active');
    });
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    const activeLink = document.querySelector(`.nav-links a[href="#${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    window.location.hash = pageId;
    window.scrollTo({ top: 0, behavior: 'instant' });
}

export function initRouter() {
    const obterHashAtual = () => window.location.hash.substring(1);

    window.addEventListener('hashchange', () => {
        const hash = obterHashAtual();
        if (PAGINAS_VALIDAS.has(hash)) {
            navigate(hash);
        }
    });

    const hashInicial = obterHashAtual();
    navigate(PAGINAS_VALIDAS.has(hashInicial) ? hashInicial : 'home');
}