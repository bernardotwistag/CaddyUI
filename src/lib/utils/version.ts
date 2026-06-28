/**
 * Compare two semver-ish version strings (e.g. "1.2.3" or "v1.2.3").
 * Returns 1 if a > b, -1 if a < b, 0 if equal.
 * Pre-release/build metadata is ignored — only major.minor.patch are compared.
 */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string) =>
    v.replace(/^v/, "").split("-")[0].split(".").map((n) => parseInt(n, 10) || 0);

  const pa = parse(a);
  const pb = parse(b);

  for (let i = 0; i < 3; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da > db) return 1;
    if (da < db) return -1;
  }
  return 0;
}

export function isNewerVersion(latest: string, current: string): boolean {
  return compareVersions(latest, current) > 0;
}
