import { MAJOR_ARCANA } from './tarot-major.js';
import { WANDS } from './tarot-wands.js';
import { CUPS } from './tarot-cups.js';
import { SWORDS } from './tarot-swords.js';
import { PENTACLES } from './tarot-pentacles.js';

export const TAROT_DECK = [...MAJOR_ARCANA, ...WANDS, ...CUPS, ...SWORDS, ...PENTACLES];

export const SUITS = {
  wands:     { name:'Gậy',  nameEn:'Wands',     element:'Lửa',  emoji:'🔥' },
  cups:      { name:'Cốc',  nameEn:'Cups',      element:'Nước', emoji:'💧' },
  swords:    { name:'Kiếm', nameEn:'Swords',    element:'Khí',  emoji:'🌬️' },
  pentacles: { name:'Tiền', nameEn:'Pentacles', element:'Đất',  emoji:'🌿' },
};

export function getCardById(id) {
  return TAROT_DECK.find(c => c.id === id) ?? null;
}

export function getCardImageUrl(card) {
  return `/tarot/cards/${card.img}`;
}
