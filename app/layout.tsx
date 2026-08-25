import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI NEWS Widget",
  description: "毎日のAIニュースをひと目で確認できるサービス",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}