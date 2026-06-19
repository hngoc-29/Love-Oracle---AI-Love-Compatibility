import TarotApp from '@/components/TarotApp';

export const metadata = {
  title: 'Bài Tarot — Tiên Tri',
  description: 'Rút bài Tarot và nhận lời giải về tình yêu từ vũ trụ. Trải Bài Tình Yêu: Bạn — Người Ấy — Mối Quan Hệ.',
  openGraph: {
    title: 'Bài Tarot — Tiên Tri',
    description: 'Rút bài Tarot và nhận lời giải về tình yêu từ vũ trụ.',
    type: 'website',
    siteName: 'Tiên Tri',
  },
};

export default function TarotPage() {
  return <TarotApp />;
}
