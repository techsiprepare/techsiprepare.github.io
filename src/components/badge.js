export function badge({ status }) {
    const isResolvida = status === "Resolvida";
    const badgeClass = isResolvida ? "badge-success" : "badge-warning";

    return `
        <span class="badge ${badgeClass}">
            <span>
                ${status}
            </span>
        </span>
    `;
}