import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "学生课程表管理系统",
  description: "上传 Excel 自动生成可视化周课表，支持本地持久化。"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}

