export function badge({ status }) {
    const isResolvida = status === "Resolvida";
    const badgeClass = isResolvida ? "badge-success" : "badge-warning";
    const badgeIcon = isResolvida ? "check-circle" : "circle-question-mark";

    return `
        <span class="badge ${badgeClass}">
            <i data-lucide="${badgeIcon}"></i>
        </span>
    `;
}