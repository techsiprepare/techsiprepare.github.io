export function backLink({ destino, texto = "Voltar" }) {
    return `<div class="back-link"><a href="${destino}">← ${texto}</a></div>`;
}
