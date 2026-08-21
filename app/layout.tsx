import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "冠禎 & 玟慧｜我們的婚禮喜帖",
  description: "一封為你展開的互動式數位喜帖。",
  openGraph: {
    title: "冠禎 & 玟慧｜我們的婚禮喜帖",
    description: "誠摯邀請你，見證我們的這一天。",
    type: "website",
    locale: "zh_TW",
    images: [{ url: `${siteUrl}/og.png`, alt: "冠禎與玟慧的婚禮喜帖" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "冠禎 & 玟慧｜我們的婚禮喜帖",
    description: "誠摯邀請你，見證我們的這一天。",
    images: [`${siteUrl}/og.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#31504b",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
