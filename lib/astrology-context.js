/**
 * Xây dựng ngữ cảnh chiêm tinh để ghép vào prompt lời giải Tarot+chiêm tinh.
 * Tái sử dụng các hàm đã có trong lib/zodiac.js thay vì tính lại từ đầu.
 */
import {
  getZodiacSign,
  getHeavenlyStem,
  getEarthlyBranch,
  getLifePathNumber,
  getLifePathMeaning,
} from './zodiac.js';

export function buildAstrologyContext(person) {
  const { name, day, month, year } = person;
  const zodiac = getZodiacSign(day, month);
  const stem   = getHeavenlyStem(year);
  const branch = getEarthlyBranch(year);
  const lp     = getLifePathNumber(day, month, year);
  const lpMean = getLifePathMeaning(lp);

  return {
    name,
    zodiac:   `${zodiac.name} (${zodiac.element})`,
    tuvi:     `${stem.name} ${branch.name} (${branch.animal})`,
    nguHanh:  stem.element,
    lifePath: lp,
    lpTheme:  typeof lpMean === 'string' ? lpMean.split('—')[0]?.trim() : '',
  };
}

export function formatAstrologyForPrompt(ctx) {
  return `Thông tin chiêm tinh của ${ctx.name}: cung hoàng đạo ${ctx.zodiac}, Tử Vi sinh năm ${ctx.tuvi}, Ngũ hành ${ctx.nguHanh}, số chủ đạo ${ctx.lifePath} (${ctx.lpTheme}).`;
}
