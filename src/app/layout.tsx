import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Fluxxx - Anonymous Video Chat for Students",
  description: "Connect instantly with random peers in your faculty. No sign-ups, no strings - just real conversations.",
  keywords: ["video chat", "anonymous", "students", "random chat", "webrtc"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
