/**
 * Copy text to clipboard with a fallback for browsers/contexts where the
 * async Clipboard API isn't available (non-secure context, older mobile
 * WebViews) — falls back to a hidden textarea + execCommand('copy').
 */
export async function crossCopy(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const el = Object.assign(document.createElement('textarea'), { value: text });
    el.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.appendChild(el);
    el.focus();
    el.select();
    const ok = document.execCommand('copy');
    el.remove();
    return ok;
  } catch {
    return false;
  }
}
