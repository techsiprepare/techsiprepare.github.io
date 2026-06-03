import { ComponenteBadge } from './badge.js';

// Função auxiliar para converter URL do YouTube para URL de Embed
function obterUrlEmbed(videoUrl) {
    if (!videoUrl) return null;
    let videoId = null;
    try {
        const url = new URL(videoUrl);
        if (url.hostname.includes('youtube.com')) {
            videoId = url.searchParams.get('v');
            if (!videoId && url.pathname.startsWith('/shorts/')) {
                videoId = url.pathname.split('/')[2];
            }
        } else if (url.hostname.includes('youtu.be')) {
            videoId = url.pathname.substring(1);
        }
    } catch (e) {
        return null;
    }

    if (videoId && videoId.includes('?')) {
        videoId = videoId.split('?')[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

export function ComponenteQuestaoItem({ q, idProva, exibirBotao = true }) {
    const iconTipo = q.tipo === "Objetiva" ? "list-todo" : "edit-3";

    if (q.bloqueado) {
        return `
            <div class="questao-item-compacto questao-bloqueada">
                <div class="q-card-meta">
                    <strong class="q-numero-tag">Q-${q.numero}</strong>
                    <i data-lucide="${iconTipo}" title="${q.tipo}"></i>
                    <span class="q-bloqueada-msg">Fora dos objetivos do projeto de extensão.</span>
                </div>
            </div>
        `;
    }

    if (q.status === "Resolvida") {
        const embedUrl = obterUrlEmbed(q.videoUrl);

        return `
            <div class="questao-item-card-detalhado resolvida q-layout-novo">
                ${embedUrl ? `
                <div class="q-card-video-embed">
                    <iframe src="${embedUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                ` : ''}

                <div class="q-card-main-content">
                    <div class="q-card-meta">
                        <strong class="q-numero-tag">Q-${q.numero}</strong>
                        <i data-lucide="${iconTipo}" title="${q.tipo}"></i>
                        ${ComponenteBadge({ status: q.status })}
                        
                        ${exibirBotao ? `
                        <div class="q-card-actions-inline">
                            <a href="#visualizar?prova=${idProva}&questao=${q.id}" class="btn-abrir-questao" title="Visualizar Questão">
                                <i data-lucide="external-link"></i>
                            </a>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="q-card-text">
                        <span class="autor-txt">Resolvido por <strong>${q.autor}</strong>.</span>
                        ${!embedUrl && q.videoUrl ? `
                        <a href="${q.videoUrl}" target="_blank" rel="noopener noreferrer" class="btn-assistir-video">
                            <i data-lucide="video"></i> Ver vídeo
                        </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="questao-item-compacto">
            <div class="q-card-main-content">
                <div class="q-card-meta">
                    <strong class="q-numero-tag">Q-${q.numero}</strong>
                    <i data-lucide="${iconTipo}"></i>
                    ${ComponenteBadge({ status: q.status })}
                    
                    ${exibirBotao ? `
                    <div class="q-card-actions-inline">
                        <a href="#visualizar?prova=${idProva}&questao=${q.id}" class="btn-abrir-questao">
                            <i data-lucide="external-link"></i>
                        </a>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}