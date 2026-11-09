// The element a #hash points at, or null (also for a malformed hash).
export function targetOf(hash: string) {
  try {
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    return id ? document.getElementById(id) : null;
  } catch {
    return null;
  }
}
