import { ComponenteBadge } from './badge.js';

export function ComponenteQuestaoItem({ q, idProva, exibirBotao = true }) {
    const iconTipo = q.tipo === "Objetiva" ? "file-text" : "edit-3";

    if (q.status === "Resolvida") {
        return `
            <div class="questao-item-card-detalhado resolvida">
                <div class="q-card-main-content">
                    <div class="q-card-meta">
                        <strong class="q-numero-tag">Q-${q.numero}</strong>
                        <i data-lucide="${iconTipo}" title="${q.tipo}"></i>
                        <i data-lucide="tag"></i>
                        ${ComponenteBadge({ status: q.status })}
                    </div>
                    
                    <div class="q-card-text">
                        <span class="autor-txt">Resolvido por <strong>${q.autor}</strong>.</span>
                        <a href="${q.videoUrl}" target="_blank" rel="noopener noreferrer" class="btn-assistir-video">
                            <i data-lucide="video"></i> Ver vídeo
                        </a>
                    </div>
                </div>

                ${exibirBotao ? `
                    <div class="q-card-actions">
                        <a href="#visualizar?prova=${idProva}&questao=${q.id}" class="btn-abrir-questao" title="Visualizar Questão">
                            <i data-lucide="external-link"></i>
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
    }

    return `
        <div class="questao-item-compacto">
            <div class="q-card-main-content">
                <div class="q-card-meta">
                    <strong class="q-numero-tag">Q-${q.numero}</strong>
                    <i data-lucide="${iconTipo}"></i>
                    <i data-lucide="tag"></i>
                    ${ComponenteBadge({ status: q.status })}
                </div>
            </div>
            ${exibirBotao ? `
                <div class="q-card-actions">
                    <a href="#visualizar?prova=${idProva}&questao=${q.id}" class="btn-abrir-questao">
                        <i data-lucide="external-link"></i>
                    </a>
                </div>
            ` : ''}
        </div>
    `;
}