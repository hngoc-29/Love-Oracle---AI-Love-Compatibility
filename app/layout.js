import './globals.css';

// Lưu ý: layout gốc giữ metadata TĨNH (không gọi headers()) để trang chủ "/"
// vẫn được pre-render tĩnh — nhanh hơn. Trang /boi (đã động sẵn vì đọc
// searchParams) dùng lib/base-url.js để lấy origin chính xác theo từng request.
const BASE =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(BASE),
  title: { default:'Tiên Tri — Khám Phá Huyền Bí', template:'%s | Tiên Tri' },
  description:'Xem bói tình yêu theo Chiêm tinh học, Thần số học & Tử vi phương Đông. Khám phá tương hợp tình duyên qua Thiên Can Địa Chi, Ngũ Hành và cung hoàng đạo.',
  keywords:['tương hợp tình yêu','chiêm tinh học','tử vi','ngũ hành','thiên can','địa chi','cung hoàng đạo','thần số học','tiên tri'],
  openGraph:{
    type:'website', siteName:'Tiên Tri',
    images:[{ url:'/api/og', width:1200, height:630, alt:'Tiên Tri Tình Yêu' }],
  },
  twitter:{ card:'summary_large_image' },
  robots:{ index:true, follow:true },
};

export const viewport = { width:'device-width', initialScale:1, themeColor:'#0a0314' };

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
