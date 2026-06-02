import { viewHome } from './views/home.js';
import { viewAcervo } from './views/acervo.js';
import { viewQuestoesProva } from './views/questoesProva.js';
import { viewVisualizar } from './views/visualizar.js';
import { viewTutorial } from './views/tutorial.js';

export function inicializarRoteador() {
    window.addEventListener("hashchange", lidarComRoteamento);
    lidarComRoteamento();
}

function lidarComRoteamento() {
    const root = document.getElementById("app-root");
    const hashCompleta = window.location.hash || "#";
    const [caminhoComHash, stringParametros] = hashCompleta.split("?");
    const rota = caminhoComHash.replace("#", "");

    const parametros = {};
    if (stringParametros) {
        stringParametros.split("&").forEach(p => {
            const [chave, valor] = p.split("=");
            parametros[chave] = decodeURIComponent(valor);
        });
    }

    if (rota === "" || rota === "home") {
        root.innerHTML = viewHome();
    } else if (rota === "acervo") {
        root.innerHTML = parametros.prova ? viewQuestoesProva(parametros.prova) : viewAcervo();
    } else if (rota === "visualizar") {
        root.innerHTML = (parametros.prova && parametros.questao) 
            ? viewVisualizar(parametros.prova, parametros.questao) 
            : `<h2>Parâmetros inválidos.</h2>`;
    } else if (rota === "tutorial") {
        root.innerHTML = viewTutorial();
    } else {
        root.innerHTML = `<h2>Página não encontrada (Erro 404).</h2>`;
    }

    if (window.lucide) window.lucide.createIcons();
}