import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";
import "@/components/ui/8bit/styles/retro.css"; // Import 8bitcn styles

const pressStart2P = Press_Start_2P({
  weight: "400",
  variable: "--font-pixel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lucky Clover Slots - Pixel Edition",
  description: "Retro 8-bit slot machine game with Next.js and 8bitcn UI",
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
        {children}
      </body>
    </html>
  );
}
