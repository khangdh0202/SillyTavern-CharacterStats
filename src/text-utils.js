/* Cheap similarity: case-insensitive containment, prefix, or
   Levenshtein distance ≤ 2 — enough for typo healing. */
export function levenshteinWithin2(a, b) {
    if (Math.abs(a.length - b.length) > 2) return false;

    const m = a.length;
    const n = b.length;
    let previous = Array.from({ length: n + 1 }, (_, i) => i);

    for (let i = 1; i <= m; i++) {
        const row = [i];

        for (let j = 1; j <= n; j++) {
            row[j] = Math.min(
                previous[j] + 1,
                row[j - 1] + 1,
                previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }

        previous = row;
    }

    return previous[n] <= 2;
}

export function escapeHtml(text) {
    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

export function formatNumber(value) {
    if (typeof value !== "number" || !Number.isFinite(value)) return escapeHtml(value);
    return value.toLocaleString("en-US");
}

/* Same as formatNumber for numbers, but NEVER HTML-escapes: for prompt
   text, marker summaries and tool results (plain-text sinks). */
export function formatPlainValue(value) {
    if (typeof value === "number" && Number.isFinite(value)) return value.toLocaleString("en-US");
    return String(value ?? "");
}
