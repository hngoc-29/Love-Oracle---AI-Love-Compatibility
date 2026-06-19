import { createRng } from './hash.js';

const OPENERS = [
  'Vũ trụ đã lật mở những lá bài này cho bạn.',
  'Lá bài đã được rút, và đây là điều chúng muốn nói.',
  'Hãy cùng nhìn vào những gì những lá bài vừa hé lộ.',
];
const QUESTION_BRIDGES = [
  (q) => `Với câu hỏi "${q}" trong tâm trí, `,
  (q) => `Khi nghĩ về "${q}", `,
  (q) => `Soi vào điều bạn đang băn khoăn — "${q}" — `,
];
const CLOSERS = [
  'Lá bài chỉ là tấm gương phản chiếu — cách bạn hành động tiếp theo mới là điều quyết định.',
  'Hãy nhớ, đây là một góc nhìn để suy ngẫm, không phải một bản án cố định.',
  'Số phận không được viết sẵn trên những lá bài — nó được viết bởi chính bạn, từng ngày.',
];

function describeCard(card, reversed) {
  const meaning = reversed ? card.reversed : card.upright;
  const orient = reversed ? ' (ngược)' : '';
  return `${card.nameVn}${orient} — ${meaning}`;
}

/**
 * Ghép nghĩa từng lá theo vị trí thành một đoạn văn liền mạch, dùng khi
 * không có AI key hoặc AI lỗi. Không random nội dung lá bài (đã rút random
 * rồi ở engine) — phần random ở đây chỉ là chọn câu mở/câu kết cho đa dạng.
 */
export function generateLocalTarotReading(spread, draws, question) {
  const rng = createRng(Date.now() % 2147483647);
  const opener = OPENERS[Math.floor(rng() * OPENERS.length)];
  const closer = CLOSERS[Math.floor(rng() * CLOSERS.length)];
  const bridge = question
    ? QUESTION_BRIDGES[Math.floor(rng() * QUESTION_BRIDGES.length)](question)
    : '';
  const cardWord = spread.positions.length === 1 ? 'lá bài' : `${spread.positions.length} lá bài`;
  const intro = bridge ? `${bridge}đây là điều ${cardWord} đang kể:` : `Đây là điều ${cardWord} đang kể:`;

  const body = draws.map(({ position, card, reversed }) => {
    const posLabel = spread.positions.length > 1 ? `${position.label}: ` : '';
    return `${posLabel}${describeCard(card, reversed)}`;
  }).join('\n\n');

  return `${opener}\n\n${intro}\n\n${body}\n\n${closer}`;
}
