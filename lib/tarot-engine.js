import { TAROT_DECK } from './data/tarot-deck.js';

/**
 * Rút bài tarot là hành động MANG TÍNH NGẪU NHIÊN THẬT theo truyền thống —
 * khác hoàn toàn với điểm tương hợp tình yêu (vốn cố ý tất định, dựa trên
 * chiêm tinh/thần số thật). Ở đây mỗi lần rút PHẢI khác nhau, nên dùng
 * Math.random() trực tiếp, không seed theo tên/ngày sinh.
 */

const SPREADS = {
  single: {
    id: 'single',
    name: 'Lá Bài Hôm Nay',
    count: 1,
    positions: [{ key: 'card', label: 'Thông Điệp Hôm Nay' }],
  },
  yesno: {
    id: 'yesno',
    name: 'Có hay Không?',
    count: 1,
    positions: [{ key: 'answer', label: 'Câu Trả Lời' }],
    isYesNo: true,
  },
  love3: {
    id: 'love3',
    name: 'Trải Bài Tình Yêu',
    count: 3,
    positions: [
      { key: 'you',          label: 'Bạn' },
      { key: 'them',         label: 'Người Ấy' },
      { key: 'relationship', label: 'Mối Quan Hệ' },
    ],
  },
  classic3: {
    id: 'classic3',
    name: 'Quá Khứ – Hiện Tại – Tương Lai',
    count: 3,
    positions: [
      { key: 'past',    label: 'Quá Khứ' },
      { key: 'present', label: 'Hiện Tại' },
      { key: 'future',  label: 'Tương Lai' },
    ],
  },
  celtic10: {
    id: 'celtic10',
    name: 'Celtic Cross',
    count: 10,
    positions: [
      { key: 'present',    label: 'Tình Huống Hiện Tại' },
      { key: 'challenge',  label: 'Thách Thức' },
      { key: 'above',      label: 'Mục Tiêu / Ý Thức' },
      { key: 'below',      label: 'Nền Tảng / Vô Thức' },
      { key: 'past',       label: 'Quá Khứ Gần' },
      { key: 'future',     label: 'Tương Lai Gần' },
      { key: 'self',       label: 'Bạn Trong Tình Huống Này' },
      { key: 'external',   label: 'Ảnh Hưởng Bên Ngoài' },
      { key: 'hopes',      label: 'Hi Vọng / Nỗi Sợ' },
      { key: 'outcome',    label: 'Kết Quả Tổng Thể' },
    ],
  },
};

export function getSpread(id) {
  return SPREADS[id] ?? SPREADS.love3;
}

export function listSpreads() {
  return Object.values(SPREADS);
}

function shuffledIndices(length) {
  const arr = Array.from({ length }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Tính kết quả Có/Không từ một lá bài đã rút.
 * Logic truyền thống: Major Arcana nặng hơn Minor; lá xuôi thiên về Có,
 * lá ngược thiên về Không; nhưng một số lá có tính chất trung tính hoặc
 * "cần suy xét thêm" không phải luôn 100% Có hoặc Không.
 */
const YES_CARDS = new Set([
  'major-01','major-03','major-06','major-07','major-08','major-10',
  'major-11','major-17','major-19','major-20','major-21',
]);
const NO_CARDS = new Set([
  'major-05','major-12','major-13','major-15','major-16','major-18',
]);

export function deriveYesNo(card, reversed) {
  const isMajor = card.arcana === 'major';
  const inYes = YES_CARDS.has(card.id);
  const inNo  = NO_CARDS.has(card.id);

  // Lá Major có phân loại rõ ràng
  if (isMajor && inYes)  return reversed ? 'maybe' : 'yes';
  if (isMajor && inNo)   return reversed ? 'maybe' : 'no';
  if (isMajor)           return reversed ? 'no'    : 'yes'; // Major trung tính → xu hướng Có

  // Minor Arcana: phụ thuộc chủ yếu vào xuôi/ngược, nước/lửa cũng tính
  const positiveElem = card.element === 'fire' || card.element === 'water';
  if (!reversed) return positiveElem ? 'yes' : 'maybe';
  return positiveElem ? 'maybe' : 'no';
}

export const YES_NO_LABELS = {
  yes:   { vi: 'Có ✦',         en: 'Yes',   color: '#4ade80', glow: 'rgba(74,222,128,0.35)' },
  no:    { vi: 'Không ✦',      en: 'No',    color: '#f87171', glow: 'rgba(248,113,113,0.35)' },
  maybe: { vi: 'Có thể... ✦',  en: 'Maybe', color: '#fbbf24', glow: 'rgba(251,191,36,0.35)' },
};

/**
 * Rút N lá duy nhất từ bộ 78 lá, mỗi lá có ~50% là ngược (reversed).
 * Trả về mảng { position, card, reversed } theo đúng thứ tự vị trí của spread.
 */
export function drawSpread(spreadId) {
  const spread = getSpread(spreadId);
  const idx = shuffledIndices(TAROT_DECK.length).slice(0, spread.count);

  return {
    spread,
    draws: spread.positions.map((position, i) => ({
      position,
      card: TAROT_DECK[idx[i]],
      reversed: Math.random() < 0.5,
    })),
  };
}
