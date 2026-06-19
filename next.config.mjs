/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cho phép @huggingface/transformers và onnxruntime chạy trong server
  serverExternalPackages: ['onnxruntime-node'],

  allowedDevOrigins: ['192.168.1.180'], // Cho phép IP này truy cập khi dev

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {
    // Không cần custom rule — serverExternalPackages đã xử lý onnxruntime
  },
};

export default nextConfig;
