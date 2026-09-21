// Copy text to the clipboard. The async Clipboard API needs a secure context and
// a user gesture, and can be refused by permissions policy, so a textarea
// selection fallback covers the rest. Resolves true when something was copied.
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return selectionCopy(text);
    }
  }
  return selectionCopy(text);
}

function selectionCopy(text: string): boolean {
  if (typeof document === "undefined") return false;
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  const area = document.createElement("textarea");
  area.value = text;
  area.readOnly = true;
  area.setAttribute("aria-hidden", "true");
  area.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0;";
  document.body.appendChild(area);
  try {
    area.select();
    area.setSelectionRange(0, text.length);
    return document.execCommand("copy");
  } catch (err) {
    console.warn("Clipboard fallback failed", err);
    return false;
  } finally {
    document.body.removeChild(area);
    previous?.focus();
  }
}
