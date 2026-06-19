/**
 * Deterministic hash utilities for Love Oracle
 * Ensures A+B always equals B+A by sorting inputs first
 */

function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

export function createLoveCacheKey(personA, personB, tone = 'tho-mong') {
  const seed = generateSeed(personA, personB);
  return `love:${tone}:${seed.toString(36)}`;
}

/**
 * Generate a deterministic seed from two people's data.
 * Order-independent: (A, B) === (B, A)
 * Dùng ngày sinh (day/month/year) thay vì age để seed unique hơn.
 *
 * @param {{ name: string, day: number, month: number, year: number }} personA
 * @param {{ name: string, day: number, month: number, year: number }} personB
 * @returns {number}
 */
export function generateSeed(personA, personB) {
  const entries = [
    `${personA.name.trim().toLowerCase()}:${personA.day}/${personA.month}/${personA.year}`,
    `${personB.name.trim().toLowerCase()}:${personB.day}/${personB.month}/${personB.year}`,
  ].sort(); // Sort ensures A+B == B+A

  return djb2Hash(entries.join('|'));
}

/**
 * Seeded pseudo-random number generator (Mulberry32)
 * @param {number} seed
 * @returns {() => number}
 */
export function createRng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0;
    s = s + 0x6d2b79f5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function pickRandom(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

export function pickUniqueN(arr, n, rng) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}
