export function ComponenteBadge({ status }) {
    const isResolvida = status === "Resolvida";
    const badgeClass = isResolvida ? "badge-success" : "badge-warning";
    const badgeIcon = isResolvida ? "check-circle" : "clock";

    return `
        <span class="badge ${badgeClass}">
            <i data-lucide="${badgeIcon}"></i> ${status}
        </span>
    `;
}