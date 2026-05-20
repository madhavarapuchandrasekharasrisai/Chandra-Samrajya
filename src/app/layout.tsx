import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/providers/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DHANAVI SAMRAJYA — Sovereign Wealth Operating System",
  description: "The Sovereign Wealth & Business Operating System. Powered by Karna AI. Financial sovereignty through disciplined execution and intelligent systems.",
  keywords: ["DHANAVI", "Wealth", "Business", "AI", "Karna", "Financial Operating System"],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1a1f',
              border: '1px solid rgba(212, 168, 73, 0.15)',
              color: '#fff',
            },
          }}
        />
      </body>
    </html>
  );
}
