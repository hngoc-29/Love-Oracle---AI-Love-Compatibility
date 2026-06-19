import OracleApp from '@/components/OracleApp';
import { calculateAstrologyScore } from '@/lib/zodiac';
import { getBaseUrl } from '@/lib/base-url';

const LEVELS = [
  {min:0,max:19,label:'Tia Lửa Tò Mò'},{min:20,max:39,label:'Ánh Lửa Bùng Cháy'},
  {min:40,max:59,label:'Tâm Đầu Ý Hợp'},{min:60,max:74,label:'Kết Nối Tâm Hồn'},
  {min:75,max:89,label:'Tình Yêu Định Mệnh'},{min:90,max:100,label:'Ngọn Lửa Song Sinh'},
];

// Satori (next/og) dùng font không có glyph cho dingbat/emoji — đã kiểm tra thực tế:
// ✓ hiện thành ô vuông lỗi; 💠🔺⚡☁️⚠️ biến mất vô hình. Còn ○ → — • thì hiển thị bình thường.
function sanitizeForOgImage(str = '') {
  return str
    .replace(/[\u2713]/g, '')               // ✓ → ô vuông lỗi
    .replace(/[\u2600-\u26FF]/g, '')        // dingbat/misc symbols (⚡ ☁ ⚠ …)
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // emoji pictographs (💠 🔺 …)
    .replace(/[\uFE00-\uFE0F]/g, '')        // variation selectors
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Khớp với lib/share-codec.js phía client (base64url, UTF-8 safe)
function decodeShareStateServer(str) {
  const json = Buffer.from(str, 'base64url').toString('utf8');
  return JSON.parse(json);
}

export async function generateMetadata({ searchParams }) {
  const sp   = await searchParams;
  const s    = sp?.s;
  const base = await getBaseUrl();

  let title       = 'Xem Bói Tình Yêu — Tiên Tri';
  let description = 'Khám phá tương hợp tình duyên theo Chiêm tinh học & Tử vi phương Đông';
  let ogImageUrl  = `${base}/api/og`;

  if (s) {
    try {
      const { a, b } = decodeShareStateServer(s);
      const res   = calculateAstrologyScore(a, b);
      const score = res.total;
      const level = LEVELS.find(l => score >= l.min && score <= l.max)?.label ?? '';
      const zA    = res.zodiac.personA;
      const zB    = res.zodiac.personB;
      const nhLabel = sanitizeForOgImage(res.breakdown.nguHanh?.label);
      const chiLabel= sanitizeForOgImage(res.breakdown.chi?.label);

      title       = `${a.name} & ${b.name} — ${score}% Tương Hợp`;
      description = `${level} · ${zA.sign.name} ${zA.sign.symbol} + ${zB.sign.name} ${zB.sign.symbol} · Can ${zA.stem.name} & Can ${zB.stem.name}`;

      const p = new URLSearchParams({
        a:a.name, b:b.name, score:String(score), level,
        sa:zA.sign.name, sb:zB.sign.name,
        ca:zA.stem.name, cb:zB.stem.name,
        nh:nhLabel, chi:chiLabel,
      });
      ogImageUrl = `${base}/api/og?${p.toString()}`;
    } catch {}
  }

  return {
    title,
    description,
    openGraph: {
      title, description,
      type:'website', siteName:'Tiên Tri Tình Yêu',
      images:[{ url:ogImageUrl, width:1200, height:630, alt:title }],
    },
    twitter:{ card:'summary_large_image', title, description, images:[ogImageUrl] },
  };
}

export default function BoiPage() {
  return <OracleApp />;
}
