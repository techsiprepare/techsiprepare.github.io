import { obterUrlEmbedYoutube } from '../utils/youtube.js';

export function ComponenteVideoPlayer({ status, videoUrl, autor }) {
    if (status === "Resolvida") {
        const urlVideoFormatada = obterUrlEmbedYoutube(videoUrl);
        return `
            <div class="video-wrapper">
                <iframe src="${urlVideoFormatada}" frameborder="0" allowfullscreen></iframe>
            </div>
            <p class="autor-txt">Resolvido por: <strong>${autor}</strong></p>
        `;
    }

    return `
        <div class="video-placeholder"> 
            <i data-lucide="video-off"></i> 
            <p>Esta questão ainda não possui uma resolução em vídeo.</p> 
            <a href="#tutorial" class="btn btn-primary">Seja o primeiro a gravar!</a> 
        </div>
    `;
}