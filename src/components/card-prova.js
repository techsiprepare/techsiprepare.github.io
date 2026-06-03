export function cardProva({ id, curso, ano, modalidade, caderno, qtdObjetivas = 0, qtdDiscursivas = 0, qtdResolvidas = 0 }) {
    const totalQuestoes = qtdObjetivas + qtdDiscursivas;
    const progresso = totalQuestoes > 0 ? Math.round((qtdResolvidas / totalQuestoes) * 100) : 0;

    let badgeStatusClass = "badge-warning";
    let iconStatus = "circle-dashed";

    if (progresso === 100 && totalQuestoes > 0) {
        badgeStatusClass = "badge-success";
        iconStatus = "check-circle";
    } else if (progresso > 0) {
        badgeStatusClass = "badge-warning";
        iconStatus = "clock";
    }

    const badgeStyle = "padding: 4px 8px; background-color: var(--color-bg-system); color: var(--color-text-main);";

    return `
        <div class="card prova-card" data-prova-id="${id}">
            <div class="card-thumbnail-wrapper">
                <canvas id="thumb-${id}" class="card-pdf-thumbnail"></canvas>
            </div>
            <div class="card-content-wrapper">
                <h3>${curso} (${ano})</h3>
                <p class="meta">${modalidade} • Caderno ${caderno}</p>
                <div class="prova-stats" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                    <span class="badge" style="${badgeStyle}" title="Questões Objetivas">
                        <i data-lucide="list-todo"></i> ${qtdObjetivas}
                    </span>
                    <span class="badge" style="${badgeStyle}" title="Questões Discursivas">
                        <i data-lucide="edit-3"></i> ${qtdDiscursivas}
                    </span>
                    <span class="badge ${progresso > 0 ? badgeStatusClass : ''}" style="padding: 4px 8px; ${progresso === 0 ? 'background-color: var(--color-bg-system); color: var(--color-text-support);' : ''}" title="Progresso de Resolução">
                        <i data-lucide="${iconStatus}"></i> ${qtdResolvidas}/${totalQuestoes} (${progresso}%)
                    </span>
                </div>
                <a href="#acervo?prova=${id}" class="btn">Ver Questões</a>
            </div>
        </div>
    `;
}
