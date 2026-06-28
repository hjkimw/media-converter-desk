import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image / Video Converter MVP",
  description: "Browser-first image and video conversion MVP with future server processing stubs.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
