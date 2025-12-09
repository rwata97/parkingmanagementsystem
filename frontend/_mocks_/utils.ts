// src/mocks/utils.ts
export const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
export const id = () => Math.random().toString(36).slice(2, 10);

export function quarterCycle(date = new Date()) {
  const q = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}-Q${q}`;
}

export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
