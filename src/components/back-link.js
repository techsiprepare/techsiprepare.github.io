export function backLink({ destino, texto = "Voltar" }) {
    return `<div class="back-link"><a href="${destino}"><i data-lucide="arrow-left"></i> ${texto}</a></div>`;
}
