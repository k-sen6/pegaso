import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/layout/bottom-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "Pegaso — Vendedores, marketplace y financiamiento de Cuba",
    template: "%s — Pegaso",
  },
  description:
    "Conectamos vendedores cubanos verificados con compradores nacionales y financiamiento internacional.",
  manifest: "/pegaso/manifest.json",
  icons: {
    icon: "/pegaso/icons/icon-192.png",
    apple: "/pegaso/icons/icon-192.png",
  },
  applicationName: "Pegaso",
};

export const viewport: Viewport = {
  themeColor: "#070d14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="flex-1 pb-20 md:pb-0">{children}</main>
            <Footer />
            <BottomNav />
          </div>
        </Providers>
        <Script
          id="sw-registro"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html:
              'if("serviceWorker" in navigator && location.protocol==="https:"||location.hostname==="localhost"){navigator.serviceWorker.register("/pegaso/sw.js").catch(function(){})}',
          }}
        />
      </body>
    </html>
  );
}
