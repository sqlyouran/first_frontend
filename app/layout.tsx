import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AiLauncherSlot from "./regions/AiLauncherSlot";
import { AuthProvider } from "@/components/AuthProvider";
import SiteHeader from "@/app/_components/SiteHeader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wanderchina — Discover the China that travel guides miss",
  description:
    "City guides, travel stories, hidden spots, and an AI trip planner for exploring China.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body>
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
        <AiLauncherSlot />
      </body>
    </html>
  );
}
