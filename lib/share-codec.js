/**
 * Share-state codec — UTF-8 safe, URL-safe (base64url, no padding).
 *
 * Why not plain btoa/atob: btoa() throws "Invalid character" on any
 * string containing non-Latin1 codepoints — which includes virtually
 * every Vietnamese name with diacritics (á, ư, ệ, …). It also emits
 * '+' and '/' which URLSearchParams can silently mangle ('+' is read
 * back as a space). This codec routes through TextEncoder/TextDecoder
 * so any Unicode text round-trips correctly, and remaps to the
 * URL-safe alphabet so the value never needs percent-encoding.
 */

export function encodeShareState(obj) {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodeShareState(str) {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}
