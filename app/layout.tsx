import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import "@/components/ui/8bit/styles/retro.css";
import { LocaleProvider } from "@/app/contexts/LocaleContext";
import { AuthProvider } from "@/app/contexts/AuthContext";

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PIXEL BET (픽셀 벳)",
  description: "Roguelite Slot Survival / 레트로 로그라이트 슬롯 서바이벌",
  openGraph: {
    title: "PIXEL BET (픽셀 벳)",
    description: "Spin, Survive, Win! / 스핀, 생존, 그리고 승리!",
    locale: "en_US",
    alternateLocale: ["ko_KR"],
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart2P.variable} antialiased`}
      >
        <AuthProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </AuthProvider>
      </body>
    </html>
  );
}


