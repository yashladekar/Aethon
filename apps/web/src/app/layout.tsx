import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@xyflow/react/dist/style.css";
import "../index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";
import { TooltipProvider } from "@aethon/ui/components/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "aethon",
  description: "aethon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <TooltipProvider>
            <div className="grid grid-rows-[auto_1fr] h-svh">
              <Header />
              {children}
            </div>
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
