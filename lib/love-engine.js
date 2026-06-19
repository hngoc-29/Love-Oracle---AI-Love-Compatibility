import { generateSeed, createRng, pickRandom, pickUniqueN } from './hash.js';
import { calculateAstrologyScore } from './zodiac.js';
import personalityData from './data/personalities.json' assert { type: 'json' };
import colorsData      from './data/colors.json'        assert { type: 'json' };
import symbolsData     from './data/symbols.json'        assert { type: 'json' };

const ELEMENTS = ['fire', 'water', 'earth', 'air'];
const ELEMENT_LABELS = {
  fire:  { emoji:'🔥', label:'Lửa',  desc:'Cuồng nhiệt, mãnh liệt, biến đổi' },
  water: { emoji:'💧', label:'Nước', desc:'Chảy nhẹ, sâu thẳm, nhạy cảm cảm xúc' },
  earth: { emoji:'🌿', label:'Đất',  desc:'Ổn định, vững chắc, nuôi dưỡng' },
  air:   { emoji:'🌬️', label:'Gió',  desc:'Tự do, giao tiếp, sôi nổi trí tuệ' },
};
const LOVE_LEVELS = [
  { min:0,  max:19,  label:'Tia Lửa Tò Mò',      emoji:'✨' },
  { min:20, max:39,  label:'Ánh Lửa Bùng Cháy',  emoji:'🌱' },
  { min:40, max:59,  label:'Tâm Đầu Ý Hợp',      emoji:'🌙' },
  { min:60, max:74,  label:'Kết Nối Tâm Hồn',    emoji:'💫' },
  { min:75, max:89,  label:'Tình Yêu Định Mệnh', emoji:'🌹' },
  { min:90, max:100, label:'Ngọn Lửa Song Sinh', emoji:'🔥' },
];

export function analyzeCompatibility(personA, personB, salt = 0) {
  // ── Score: 100% từ chiêm tinh / thần số, không dùng hash ────────────────
  const astrologyResult = calculateAstrologyScore(personA, personB);
  const score = astrologyResult.total;
  const level = LOVE_LEVELS.find(l => score >= l.min && score <= l.max) ?? LOVE_LEVELS[2];

  // ── Các phần narrative dùng hash+salt → đa dạng khi xem lại ─────────────
  const baseSeed = generateSeed(personA, personB);
  const seed     = (baseSeed + salt) >>> 0;
  const rng      = createRng(seed);

  const allTraits = personalityData.traits;
  const traitsA   = pickUniqueN(allTraits, 4 + Math.floor(rng() * 2), rng);
  const traitsB   = pickUniqueN(allTraits, 4 + Math.floor(rng() * 2), rng);

  const strength           = pickRandom(personalityData.strengths,           rng);
  const conflict           = pickRandom(personalityData.conflicts,            rng);
  const communicationStyle = pickRandom(personalityData.communicationStyles,  rng);
  const emotionalConnection= pickRandom(personalityData.emotionalConnections, rng);
  const futurePotential    = pickRandom(personalityData.futurePotentials,     rng);

  const loveColor     = pickRandom(colorsData,  rng);
  const luckyNumber   = Math.floor(rng() * 99) + 1;
  const destinySymbol = pickRandom(symbolsData, rng);
  const elementKey    = pickRandom(ELEMENTS,    rng);
  const element       = { key: elementKey, ...ELEMENT_LABELS[elementKey] };
  const dateIdeas     = pickRandom(personalityData.dateIdeas, rng);

  return {
    score, level,
    traits: { personA: traitsA, personB: traitsB },
    strength, conflict, communicationStyle, emotionalConnection, futurePotential,
    loveColor, luckyNumber, destinySymbol, element, dateIdeas,
    seed,
    zodiac: astrologyResult.zodiac,
    breakdown: astrologyResult.breakdown,
  };
}
