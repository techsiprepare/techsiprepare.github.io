export function badge({ status }) {
    let badgeClass = "badge-warning";

    if (status === "Resolvida") {
        badgeClass = "badge-success";
    } else if (status && status.includes("Envio")) {
        badgeClass = "badge-info";
    }

    return `
        <span class="badge ${badgeClass}">
            <span>
                ${status}
            </span>
        </span>
    `;
}