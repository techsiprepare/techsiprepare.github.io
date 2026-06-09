export function cardProva({ 
    id, 
    curso, 
    ano, 
    modalidade, 
    caderno, 
    qtdObjetivas = 0, 
    qtdDiscursivas = 0,
    qtdObjetivasAtivas = 0, 
    qtdDiscursivasAtivas = 0, 
    qtdResolvidas = 0 
}) {
    const totalQuestoesAtivas = qtdObjetivasAtivas + qtdDiscursivasAtivas;
    const totalQuestoesPlanilha = qtdObjetivas + qtdDiscursivas;
    const temQuestoesBloqueadas = totalQuestoesPlanilha > totalQuestoesAtivas;

    const progresso = totalQuestoesAtivas > 0 ? Math.round((qtdResolvidas / totalQuestoesAtivas) * 100) : 0;

    let badgeStatusClass = "badge-warning";
    let iconStatus = "circle-dashed";

    if (progresso === 100 && totalQuestoesAtivas > 0) {
        badgeStatusClass = "badge-success";
        iconStatus = "check-circle";
    } else if (progresso > 0) {
        badgeStatusClass = "badge-warning";
        iconStatus = "clock";
    }

    const badgeStyle = "padding: 4px 8px; background-color: var(--color-bg-system); color: var(--color-text-main);";
    const estaBloqueadaCompleta = totalQuestoesAtivas === 0;

    return `
        <div class="prova-card ${estaBloqueadaCompleta ? 'prova-bloqueada' : ''}" data-prova-id="${id}" style="${estaBloqueadaCompleta ? 'opacity: 0.6; border-style: dashed;' : ''}">
            <div class="card-thumbnail-wrapper">
                <canvas id="thumb-${id}" class="card-pdf-thumbnail"></canvas>
            </div>
            <div class="card-content-wrapper">
                <h3>${curso} (${ano})</h3>
                <p class="meta">${modalidade} • Caderno ${caderno}</p>
                <div class="prova-stats" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
                    <span class="badge" style="${badgeStyle}" title="Questões Objetivas Disponíveis">
                        <i data-lucide="list-todo"></i> ${qtdObjetivasAtivas}
                    </span>
                    <span class="badge" style="${badgeStyle}" title="Questões Discursivas Disponíveis">
                        <i data-lucide="edit-3"></i> ${qtdDiscursivasAtivas}
                    </span>
                    ${temQuestoesBloqueadas && !estaBloqueadaCompleta ? `
                        <span class="badge" style="${badgeStyle}" title="${totalQuestoesPlanilha - totalQuestoesAtivas} questões deste caderno estão bloqueadas">
                            <i data-lucide="circle-off"></i> ${totalQuestoesPlanilha - totalQuestoesAtivas}
                        </span>
                    ` : ''}
                    <span class="badge ${progresso > 0 ? badgeStatusClass : ''}" style="padding: 4px 8px; ${progresso === 0 ? 'background-color: var(--color-bg-system); color: var(--color-text-support);' : ''}" title="Progresso de Resolução">
                        <i data-lucide="${iconStatus}"></i> ${qtdResolvidas}/${totalQuestoesAtivas} (${progresso}%)
                    </span>
                </div>
                ${estaBloqueadaCompleta 
                    ? `<button class="btn" disabled style="background-color: var(--color-bg-system); color: var(--color-text-support); cursor: not-allowed;">Indisponível</button>`
                    : `<a href="#acervo?prova=${id}" class="btn">Ver Questões</a>`
                }
            </div>
        </div>
    `;
}