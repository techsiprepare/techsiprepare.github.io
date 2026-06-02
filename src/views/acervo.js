import { estadoApp } from '../api.js';
import { ComponenteCardProva } from '../components/card.js';

export function viewAcervo() {
    const provas = Object.values(estadoApp);
    const listasProvasHtml = provas.map(prova => ComponenteCardProva({
        id: prova.id,
        curso: prova.curso,
        ano: prova.ano,
        modalidade: prova.modalidade,
        caderno: prova.caderno
    })).join('');

    return `
        <h2>Acervo de Provas Disponíveis</h2>
        <div class="grid-provas">
            ${listasProvasHtml || '<p>Nenhuma prova encontrada ou carregando...</p>'}
        </div>
    `;
}