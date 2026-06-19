/**
 * Zodiac — Thần số học · Chiêm tinh học · Tử vi phương Đông
 * 100% deterministic từ ngày tháng năm sinh — không dùng hash tên.
 */

// ═══════════════════════════════════════════════════════════
// CHIÊM TINH HỌC TÂY PHƯƠNG (Western Astrology)
// ═══════════════════════════════════════════════════════════
const ZODIAC_SIGNS = {
  aquarius:    { id:'aquarius',    name:'Bảo Bình',   symbol:'♒', element:'air',   ruling:'Thiên Vương Tinh', traits:'sáng tạo, nhân đạo, độc lập' },
  pisces:      { id:'pisces',      name:'Song Ngư',   symbol:'♓', element:'water', ruling:'Hải Vương Tinh',  traits:'nhạy cảm, trực giác, mộng mơ' },
  aries:       { id:'aries',       name:'Bạch Dương', symbol:'♈', element:'fire',  ruling:'Hỏa Tinh',        traits:'tiên phong, nhiệt huyết, dũng cảm' },
  taurus:      { id:'taurus',      name:'Kim Ngưu',   symbol:'♉', element:'earth', ruling:'Kim Tinh',        traits:'kiên định, trung thành, thực tế' },
  gemini:      { id:'gemini',      name:'Song Tử',    symbol:'♊', element:'air',   ruling:'Thủy Tinh',       traits:'linh hoạt, tò mò, khéo giao tiếp' },
  cancer:      { id:'cancer',      name:'Cự Giải',    symbol:'♋', element:'water', ruling:'Mặt Trăng',       traits:'chăm sóc, trực cảm, gắn bó gia đình' },
  leo:         { id:'leo',         name:'Sư Tử',      symbol:'♌', element:'fire',  ruling:'Mặt Trời',        traits:'tự tin, hào phóng, lãnh đạo' },
  virgo:       { id:'virgo',       name:'Xử Nữ',      symbol:'♍', element:'earth', ruling:'Thủy Tinh',       traits:'tỉ mỉ, phân tích, cầu toàn' },
  libra:       { id:'libra',       name:'Thiên Bình', symbol:'♎', element:'air',   ruling:'Kim Tinh',        traits:'công bằng, lãng mạn, hài hòa' },
  scorpio:     { id:'scorpio',     name:'Bọ Cạp',     symbol:'♏', element:'water', ruling:'Diêm Vương Tinh', traits:'sâu sắc, quyết tâm, bí ẩn' },
  sagittarius: { id:'sagittarius', name:'Nhân Mã',    symbol:'♐', element:'fire',  ruling:'Mộc Tinh',        traits:'phiêu lưu, lạc quan, triết học' },
  capricorn:   { id:'capricorn',   name:'Ma Kết',     symbol:'♑', element:'earth', ruling:'Thổ Tinh',        traits:'tham vọng, kỷ luật, trách nhiệm' },
};

const SIGN_ORDER = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces'];

export function getZodiacSign(day, month) {
  const md = month * 100 + day;
  if (md >= 120 && md <= 218) return ZODIAC_SIGNS.aquarius;
  if (md >= 219 && md <= 320) return ZODIAC_SIGNS.pisces;
  if (md >= 321 && md <= 419) return ZODIAC_SIGNS.aries;
  if (md >= 420 && md <= 520) return ZODIAC_SIGNS.taurus;
  if (md >= 521 && md <= 620) return ZODIAC_SIGNS.gemini;
  if (md >= 621 && md <= 722) return ZODIAC_SIGNS.cancer;
  if (md >= 723 && md <= 822) return ZODIAC_SIGNS.leo;
  if (md >= 823 && md <= 922) return ZODIAC_SIGNS.virgo;
  if (md >= 923 && md <= 1022) return ZODIAC_SIGNS.libra;
  if (md >= 1023 && md <= 1121) return ZODIAC_SIGNS.scorpio;
  if (md >= 1122 && md <= 1221) return ZODIAC_SIGNS.sagittarius;
  return ZODIAC_SIGNS.capricorn;
}

export function getSignIndex(sign) { return SIGN_ORDER.indexOf(sign.id); }

// Tương hợp nguyên tố Tây phương
const W_ELEM_COMPAT = {
  fire:  { fire:80, earth:52, air:88, water:40 },
  earth: { fire:52, earth:78, air:56, water:76 },
  air:   { fire:88, earth:56, air:74, water:58 },
  water: { fire:40, earth:76, air:58, water:80 },
};
const W_SIGN_ADJ = {
  'aries-leo':12,'aries-sagittarius':10,'leo-sagittarius':12,
  'taurus-virgo':12,'taurus-capricorn':10,'virgo-capricorn':12,
  'gemini-libra':12,'gemini-aquarius':10,'libra-aquarius':12,
  'cancer-scorpio':14,'cancer-pisces':12,'scorpio-pisces':14,
  'aries-libra':5,'taurus-scorpio':4,'gemini-sagittarius':5,
  'cancer-capricorn':4,'leo-aquarius':5,'virgo-pisces':4,
};
function pairKey(a,b) { return [a.id,b.id].sort().join('-'); }

export function getZodiacElementCompatibility(signA, signB) {
  const base = W_ELEM_COMPAT[signA.element]?.[signB.element] ?? 60;
  return Math.min(100, base + (W_SIGN_ADJ[pairKey(signA,signB)] ?? 0));
}

// Góc cung (Aspect)
export function getZodiacAspect(idxA, idxB) {
  const diff = Math.min(Math.abs(idxA-idxB), 12-Math.abs(idxA-idxB));
  return [
    { diff:0, name:'Hội Tụ',       emoji:'☀️', score:76, meaning:'Cùng tần số — mãnh liệt và bùng cháy' },
    { diff:1, name:'Bán Lục Phân', emoji:'↗️', score:55, meaning:'Gần nhau nhưng cần điều chỉnh' },
    { diff:2, name:'Lục Phân',     emoji:'✦',  score:82, meaning:'Góc 60° thuận — cơ hội và hòa hợp nhẹ nhàng' },
    { diff:3, name:'Vuông Góc',    emoji:'⚡', score:46, meaning:'Góc 90° căng — thách thức nhau để cùng lớn' },
    { diff:4, name:'Tam Giác',     emoji:'🔺', score:92, meaning:'Góc vàng 120° — dòng chảy tự nhiên, hòa hợp nhất' },
    { diff:5, name:'Quincunx',     emoji:'🌀', score:50, meaning:'Góc 150° lạ — cần nỗ lực để hiểu nhau' },
    { diff:6, name:'Đối Xứng',    emoji:'🌕', score:64, meaning:'Đối diện 180° — thu hút cực mạnh, cần cân bằng' },
  ][diff];
}

export function getZodiacCompatLabel(score) {
  if (score >= 85) return { label:'Đại Hòa Hợp', emoji:'🔥' };
  if (score >= 70) return { label:'Thuận Hợp',   emoji:'✨' };
  if (score >= 55) return { label:'Trung Hòa',   emoji:'🌙' };
  return               { label:'Thử Thách',  emoji:'⚡' };
}

// ═══════════════════════════════════════════════════════════
// TỬ VI PHƯƠNG ĐÔNG — THIÊN CAN (Heavenly Stems)
// ═══════════════════════════════════════════════════════════
export const HEAVENLY_STEMS = [
  // index 0 = Giáp (năm cuối số 4)
  { name:'Giáp', char:'甲', polarity:'dương', element:'wood',  emoji:'🌲', meaning:'Mộc Dương — mạnh mẽ, tiên phong, năng động như cây đại thụ' },
  { name:'Ất',   char:'乙', polarity:'âm',    element:'wood',  emoji:'🌿', meaning:'Mộc Âm — nhẹ nhàng, linh hoạt, bền bỉ như dây leo' },
  { name:'Bính', char:'丙', polarity:'dương', element:'fire',  emoji:'☀️', meaning:'Hỏa Dương — nhiệt huyết, tự tin, tỏa sáng như mặt trời' },
  { name:'Đinh', char:'丁', polarity:'âm',    element:'fire',  emoji:'🕯️', meaning:'Hỏa Âm — ấm áp, sâu sắc, khéo léo như ngọn nến' },
  { name:'Mậu',  char:'戊', polarity:'dương', element:'earth', emoji:'⛰️', meaning:'Thổ Dương — vững chắc, đáng tin, bảo hộ như núi lớn' },
  { name:'Kỷ',   char:'己', polarity:'âm',    element:'earth', emoji:'🌾', meaning:'Thổ Âm — nuôi dưỡng, kiên nhẫn, màu mỡ như đất đồng bằng' },
  { name:'Canh', char:'庚', polarity:'dương', element:'metal', emoji:'⚔️', meaning:'Kim Dương — quyết đoán, chính trực, sắc bén như kiếm thép' },
  { name:'Tân',  char:'辛', polarity:'âm',    element:'metal', emoji:'💎', meaning:'Kim Âm — tinh tế, nhạy bén, sắc sảo như kim cương' },
  { name:'Nhâm', char:'壬', polarity:'dương', element:'water', emoji:'🌊', meaning:'Thủy Dương — trí tuệ, bao dung, sâu thẳm như biển cả' },
  { name:'Quý',  char:'癸', polarity:'âm',    element:'water', emoji:'💧', meaning:'Thủy Âm — tinh tế, nhạy cảm, thấu hiểu như sương mai' },
];

export function getHeavenlyStem(year) {
  const idx = ((year % 10) - 4 + 10) % 10;
  return { ...HEAVENLY_STEMS[idx], index: idx };
}

// ═══════════════════════════════════════════════════════════
// TỬ VI PHƯƠNG ĐÔNG — ĐỊA CHI (Earthly Branches / Con Giáp)
// ═══════════════════════════════════════════════════════════
export const EARTHLY_BRANCHES = [
  { name:'Tý',   char:'子', animal:'Chuột', emoji:'🐀', element:'water', polarity:'dương', traits:'khôn ngoan, nhanh nhẹn, linh hoạt' },
  { name:'Sửu',  char:'丑', animal:'Trâu',  emoji:'🐂', element:'earth', polarity:'âm',    traits:'kiên nhẫn, đáng tin, chăm chỉ' },
  { name:'Dần',  char:'寅', animal:'Hổ',    emoji:'🐅', element:'wood',  polarity:'dương', traits:'dũng cảm, nhiệt huyết, mạnh mẽ' },
  { name:'Mão',  char:'卯', animal:'Mèo',   emoji:'🐇', element:'wood',  polarity:'âm',    traits:'tinh tế, nhẹ nhàng, nhạy cảm' },
  { name:'Thìn', char:'辰', animal:'Rồng',  emoji:'🐉', element:'earth', polarity:'dương', traits:'tự tin, hào phóng, may mắn' },
  { name:'Tị',   char:'巳', animal:'Rắn',   emoji:'🐍', element:'fire',  polarity:'âm',    traits:'bí ẩn, thông minh, trực giác sâu' },
  { name:'Ngọ',  char:'午', animal:'Ngựa',  emoji:'🐎', element:'fire',  polarity:'dương', traits:'tự do, năng động, nhiệt huyết' },
  { name:'Mùi',  char:'未', animal:'Dê',    emoji:'🐐', element:'earth', polarity:'âm',    traits:'sáng tạo, ôn hòa, nghệ thuật' },
  { name:'Thân', char:'申', animal:'Khỉ',   emoji:'🐒', element:'metal', polarity:'dương', traits:'vui tươi, tò mò, thông minh' },
  { name:'Dậu',  char:'酉', animal:'Gà',    emoji:'🐓', element:'metal', polarity:'âm',    traits:'chính xác, trung thực, siêng năng' },
  { name:'Tuất', char:'戌', animal:'Chó',   emoji:'🐕', element:'earth', polarity:'dương', traits:'trung thành, chân thành, bảo vệ' },
  { name:'Hợi',  char:'亥', animal:'Heo',   emoji:'🐖', element:'water', polarity:'âm',    traits:'hào phóng, tốt bụng, kiên trì' },
];

export function getEarthlyBranch(year) {
  const idx = ((year - 2020) % 12 + 12) % 12;
  return { ...EARTHLY_BRANCHES[idx], index: idx };
}

// ═══════════════════════════════════════════════════════════
// NGŨ HÀNH TƯƠNG SINH / TƯƠNG KHẮC
// ═══════════════════════════════════════════════════════════
const NGU_HANH = {
  wood:  { name:'Mộc', emoji:'🌿', char:'木', color:'#4ade80' },
  fire:  { name:'Hỏa', emoji:'🔥', char:'火', color:'#f87171' },
  earth: { name:'Thổ', emoji:'⛰️', char:'土', color:'#fbbf24' },
  metal: { name:'Kim', emoji:'💎', char:'金', color:'#e2e8f0' },
  water: { name:'Thủy',emoji:'💧', char:'水', color:'#60a5fa' },
};

// A → B: A sinh B (nourishes)
const SINH = { wood:'fire', fire:'earth', earth:'metal', metal:'water', water:'wood' };
// A → B: A khắc B (controls)
const KHAC = { wood:'earth', earth:'water', water:'fire', fire:'metal', metal:'wood' };

function getNguHanhRelation(elemA, elemB) {
  if (elemA === elemB) return 'same';
  if (SINH[elemA] === elemB) return 'A_sinh_B';
  if (SINH[elemB] === elemA) return 'B_sinh_A';
  if (KHAC[elemA] === elemB) return 'A_khac_B';
  if (KHAC[elemB] === elemA) return 'B_khac_A';
  return 'neutral';
}

// Điểm theo LOẠI quan hệ — không phụ thuộc hướng A↔B (đảm bảo tính đối xứng)
const NGU_HANH_SCORE_BY_TYPE = { sinh:90, same:76, neutral:62, khac:44 };

function scoreForNguHanhRelation(rel) {
  if (rel === 'A_sinh_B' || rel === 'B_sinh_A') return NGU_HANH_SCORE_BY_TYPE.sinh;
  if (rel === 'A_khac_B' || rel === 'B_khac_A') return NGU_HANH_SCORE_BY_TYPE.khac;
  return NGU_HANH_SCORE_BY_TYPE[rel] ?? 60;
}

function getNguHanhLabel(rel, nameA, nameB, elemA, elemB) {
  const nh = NGU_HANH;
  switch (rel) {
    case 'A_sinh_B': return `${nh[elemA].name} sinh ${nh[elemB].name} — Tương Sinh ✓`;
    case 'B_sinh_A': return `${nh[elemB].name} sinh ${nh[elemA].name} — Tương Sinh ✓`;
    case 'same':     return `Đồng ${nh[elemA].name} — Cùng bản chất`;
    case 'neutral':  return `${nh[elemA].name} & ${nh[elemB].name} — Trung Hòa`;
    case 'A_khac_B': return `${nh[elemA].name} khắc ${nh[elemB].name} — Tương Khắc`;
    case 'B_khac_A': return `${nh[elemB].name} khắc ${nh[elemA].name} — Tương Khắc`;
    default: return 'Trung Hòa';
  }
}

export function getNguHanhCompatibility(elemA, elemB) {
  const rel = getNguHanhRelation(elemA, elemB);
  return {
    score: scoreForNguHanhRelation(rel),
    relation: rel,
    label: getNguHanhLabel(rel, '', '', elemA, elemB),
    elemA: NGU_HANH[elemA],
    elemB: NGU_HANH[elemB],
  };
}

// ═══════════════════════════════════════════════════════════
// THIÊN CAN TƯƠNG HỢP (Hợp Can)
// ═══════════════════════════════════════════════════════════
export function getCanCompatibility(stemIdxA, stemIdxB) {
  if (stemIdxA === stemIdxB) return { score:74, label:'Cùng Can — Thân Quen', relation:'same' };
  // Hợp can: khoảng cách đúng 5 (Giáp+Kỷ, Ất+Canh, Bính+Tân, Đinh+Nhâm, Mậu+Quý)
  if (Math.abs(stemIdxA - stemIdxB) === 5) {
    const HOP_RESULT = ['Thổ','Kim','Thủy','Mộc','Hỏa','Thổ','Kim','Thủy','Mộc','Hỏa'];
    const rs = HOP_RESULT[Math.min(stemIdxA,stemIdxB)];
    return { score:92, label:`Hợp Can → Hóa ${rs} — Đại Cát`, relation:'hop_can' };
  }
  // Dùng Ngũ Hành của Can để tính
  const nhA = HEAVENLY_STEMS[stemIdxA].element;
  const nhB = HEAVENLY_STEMS[stemIdxB].element;
  const rel = getNguHanhRelation(nhA, nhB);
  const base = scoreForNguHanhRelation(rel);
  return { score: Math.round(0.6*base + 0.4*60), label: getNguHanhLabel(rel,'','',nhA,nhB), relation: rel };
}

// ═══════════════════════════════════════════════════════════
// ĐỊA CHI TƯƠNG HỢP (Tam Hợp / Lục Hợp / Xung / Hại / Hình)
// ═══════════════════════════════════════════════════════════
const TAM_HOP = [[2,6,10],[5,9,1],[8,0,4],[11,3,7]];
const TAM_HOP_NAMES = ['Dần-Ngọ-Tuất (Hỏa Cục)','Tị-Dậu-Sửu (Kim Cục)','Thân-Tý-Thìn (Thủy Cục)','Hợi-Mão-Mùi (Mộc Cục)'];
const LUC_HOP = [[0,1],[2,11],[3,10],[4,9],[5,8],[6,7]];
const XUNG    = [[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]];
const HAI     = [[0,7],[1,6],[2,5],[3,4],[8,11],[9,10]];
const HINH_3  = [[2,5,8],[1,10,7]];

export function getChiCompatibility(idxA, idxB) {
  if (idxA === idxB) return { score:72, label:'Đồng Chi — Thân Thuộc', relation:'same' };

  for (let i=0;i<TAM_HOP.length;i++) {
    if (TAM_HOP[i].includes(idxA) && TAM_HOP[i].includes(idxB))
      return { score:92, label:`🔺 Tam Hợp ${TAM_HOP_NAMES[i]}`, relation:'tam_hop' };
  }
  for (const [a,b] of LUC_HOP)
    if ((a===idxA&&b===idxB)||(b===idxA&&a===idxB))
      return { score:88, label:'💠 Lục Hợp — Thuận Hòa Đại Cát', relation:'luc_hop' };
  for (const [a,b] of XUNG)
    if ((a===idxA&&b===idxB)||(b===idxA&&a===idxB))
      return { score:35, label:'⚡ Tương Xung — Xung Đột & Thử Thách', relation:'xung' };
  for (const [a,b] of HAI)
    if ((a===idxA&&b===idxB)||(b===idxA&&a===idxB))
      return { score:42, label:'☁️ Tương Hại — Cần Thận Trọng', relation:'hai' };
  for (const triad of HINH_3)
    if (triad.includes(idxA)&&triad.includes(idxB))
      return { score:46, label:'⚠️ Tương Hình — Cần Dung Hòa', relation:'hinh' };
  if ((idxA===0&&idxB===3)||(idxA===3&&idxB===0))
    return { score:48, label:'⚠️ Tương Hình (Tý-Mão) — Cần Dung Hòa', relation:'hinh' };

  return { score:60, label:'○ Bình Thường — Trung Dung', relation:'neutral' };
}

// ═══════════════════════════════════════════════════════════
// THẦN SỐ HỌC (Numerology)
// ═══════════════════════════════════════════════════════════
function reduceNum(n) {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33)
    n = String(n).split('').reduce((s,d)=>s+parseInt(d,10),0);
  return n;
}

export function getLifePathNumber(day, month, year) {
  return reduceNum(reduceNum(day) + reduceNum(month) + reduceNum(year));
}

export function getDestinyNumber(day) { return reduceNum(day); }

const LP_MEANINGS = {
  1:'Tiên phong — ý chí độc lập, sinh ra để dẫn đường',
  2:'Hòa giải — nhạy cảm, cầu nối giữa người với người',
  3:'Biểu đạt — sáng tạo, truyền cảm hứng, tràn đầy màu sắc',
  4:'Nền tảng — thực tiễn, bền bỉ, xây dựng từng viên gạch',
  5:'Tự do — phiêu lưu, đổi mới, không chịu đứng yên',
  6:'Yêu thương — chăm sóc, trách nhiệm, trái tim ấm áp',
  7:'Trí tuệ — phân tích, tâm linh, tìm sự thật ẩn sâu',
  8:'Quyền năng — tham vọng, quyết đoán, hướng đến đỉnh cao',
  9:'Nhân đạo — lý tưởng, rộng lượng, muốn thay đổi thế giới',
  11:'✦ Thần Số — trực giác phi thường, nhạy cảm tâm linh cao',
  22:'✦ Thần Số — người kiến tạo vĩ đại, biến giấc mơ thành thực',
  33:'✦ Thần Số — người thầy tâm linh, yêu thương vô điều kiện',
};
export function getLifePathMeaning(n) { return LP_MEANINGS[n] ?? LP_MEANINGS[1]; }

export function getLifePathCompatibility(lpA, lpB) {
  if (lpA === lpB) return 88;
  if ([11,22,33].includes(lpA)||[11,22,33].includes(lpB)) return 82;
  const HARM = [[1,9],[2,8],[3,6],[4,8],[5,7],[3,9],[2,4],[6,9],[1,2]];
  for (const [a,b] of HARM)
    if ((lpA===a&&lpB===b)||(lpA===b&&lpB===a)) return 80;
  const diff = Math.abs((lpA<=9?lpA:5)-(lpB<=9?lpB:5));
  return Math.max(42, 72 - diff*4);
}

export function getDestinyCompatibility(dnA, dnB) {
  if (dnA === dnB) return 86;
  const HARM = [[1,2],[2,6],[3,6],[5,9],[1,9],[4,7],[3,9]];
  for (const [a,b] of HARM)
    if ((dnA===a&&dnB===b)||(dnA===b&&dnB===a)) return 78;
  return Math.max(40, 72 - Math.abs(dnA-dnB)*4);
}

// ═══════════════════════════════════════════════════════════
// MASTER: calculateAstrologyScore — KHÔNG DÙNG HASH
// Score = Thần số học + Chiêm tinh Tây + Tử vi Đông
// ═══════════════════════════════════════════════════════════
export function calculateAstrologyScore(personA, personB) {
  // ── Chiêm tinh Tây ──────────────────────────────────────
  const signA  = getZodiacSign(personA.day, personA.month);
  const signB  = getZodiacSign(personB.day, personB.month);
  const idxA   = getSignIndex(signA);
  const idxB   = getSignIndex(signB);
  const aspect        = getZodiacAspect(idxA, idxB);
  const zodiacElemSc  = getZodiacElementCompatibility(signA, signB);

  // ── Tử vi Đông ──────────────────────────────────────────
  const stemA   = getHeavenlyStem(personA.year);
  const stemB   = getHeavenlyStem(personB.year);
  const branchA = getEarthlyBranch(personA.year);
  const branchB = getEarthlyBranch(personB.year);
  const nguHanhComp = getNguHanhCompatibility(stemA.element, stemB.element);
  const canComp     = getCanCompatibility(stemA.index, stemB.index);
  const chiComp     = getChiCompatibility(branchA.index, branchB.index);

  // ── Thần số học ─────────────────────────────────────────
  const lpA  = getLifePathNumber(personA.day, personA.month, personA.year);
  const lpB  = getLifePathNumber(personB.day, personB.month, personB.year);
  const dnA  = getDestinyNumber(personA.day);
  const dnB  = getDestinyNumber(personB.day);
  const lpSc = getLifePathCompatibility(lpA, lpB);
  const dnSc = getDestinyCompatibility(dnA, dnB);

  // ── Tổng hợp (trọng số) ─────────────────────────────────
  //  Ngũ Hành (Đông) 30%  +  Chi (Đông) 15%  +  Can (Đông) 5%
  //  Cung Tây 20%  +  Góc Tây 10%
  //  Số ĐĐ 15%  +  Số Vận Mệnh 5%
  const raw =
    0.30 * nguHanhComp.score +
    0.15 * chiComp.score     +
    0.05 * canComp.score     +
    0.20 * zodiacElemSc      +
    0.10 * aspect.score      +
    0.15 * lpSc              +
    0.05 * dnSc;

  const total = Math.round(Math.max(5, Math.min(99, raw)));

  return {
    total,
    breakdown: { nguHanh: nguHanhComp, chi: chiComp, can: canComp, aspect, zodiacElem: zodiacElemSc, lifePath: lpSc, destiny: dnSc },
    zodiac: {
      personA: { sign: signA, stem: stemA, branch: branchA, nguHanh: NGU_HANH[stemA.element], lifePath: lpA, lifePathMeaning: getLifePathMeaning(lpA), destinyNum: dnA },
      personB: { sign: signB, stem: stemB, branch: branchB, nguHanh: NGU_HANH[stemB.element], lifePath: lpB, lifePathMeaning: getLifePathMeaning(lpB), destinyNum: dnB },
      compatibility: { nguHanh: nguHanhComp, chi: chiComp, can: canComp, aspect, zodiacElemScore: zodiacElemSc, lpScore: lpSc, total },
    },
  };
}
