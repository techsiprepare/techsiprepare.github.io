export function navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    const activeLink = document.querySelector(`.nav-links a[href="#${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');
    
    window.scrollTo(0, 0);
    window.location.hash = pageId;
}

export function initRouter() {
    window.addEventListener('hashchange', () => {
        let hash = window.location.hash.substring(1);
        if (['home', 'acervo', 'instrucoes'].includes(hash)) {
            navigate(hash);
        }
    });

    let hash = window.location.hash.substring(1);
    if (['home', 'acervo', 'instrucoes'].includes(hash)) {
        navigate(hash);
    } else {
        navigate('home');
    }
}