import { estadoApp } from '../api/sheets.js'; // Corrigido de ../../ para ../
import { ComponenteCardProva } from '../components/card.js'; // Mantido de acordo com seu arquivo real

export function viewAcervo() {
    const provas = Object.values(estadoApp);
    const listasProvasHtml = provas.map(prova => {
        let qtdObjetivas = 0;
        let qtdDiscursivas = 0;
        let qtdResolvidas = 0;

        if (prova.questoes) {
            Object.values(prova.questoes).forEach(q => {
                if (q.tipo === "Objetiva") qtdObjetivas++;
                else if (q.tipo === "Discursiva") qtdDiscursivas++;

                if (q.status === "Resolvida") qtdResolvidas++;
            });
        }

        return ComponenteCardProva({
            id: prova.id,
            curso: prova.curso,
            ano: prova.ano,
            modalidade: prova.modalidade,
            caderno: prova.caderno,
            qtdObjetivas,
            qtdDiscursivas,
            qtdResolvidas
        });
    }).join('');

    return `
        <h2>Acervo de Provas Disponíveis</h2>
        <p class="subtitle">Consulte as questões resolvidas ou encontre uma disponível para gravar seu vídeo.</p>
        <div class="grid-provas">
            ${listasProvasHtml || '<p>Nenhuma prova encontrada ou carregando...</p>'}
        </div>
    `;
}