// "A · B / C" -> ["A ·", "B /", "C"], so no line starts with a separator.
export function titleLines(title: string): string[] {
  const parts = title.split(/\s+([·/])\s+/);
  const lines: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    lines.push(parts[i + 1] ? `${parts[i]} ${parts[i + 1]}` : parts[i]);
  }
  return lines;
}
