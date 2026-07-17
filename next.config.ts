import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // content/knowledge/*.md được đọc bằng fs.readdirSync/readFileSync tại runtime
  // (không phải static import), nên Next không tự trace được để đóng gói vào
  // serverless function. Không khai báo rõ sẽ gây lỗi ENOENT khi deploy lên
  // Vercel/AWS Lambda dù chạy đúng ở local (fs đọc trực tiếp từ project root).
  outputFileTracingIncludes: {
    "/api/chat": ["./content/knowledge/**/*"],
  },
  allowedDevOrigins: ["*.ngrok-free.app","*.trycloudflare.com"],
};

export default nextConfig;
