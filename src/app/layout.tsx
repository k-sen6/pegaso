import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Nativo } from "@/components/nativo";
import { OfflineBanner } from "@/components/offline-banner";
import { BASE, ES_APK } from "@/lib/base";

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
  manifest: `${BASE}/manifest.json`,
  icons: {
    icon: `${BASE}/icons/icon-192.png`,
    apple: `${BASE}/icons/icon-192.png`,
  },
  applicationName: "Pegaso",
};

export const viewport: Viewport = {
  themeColor: "#070d14",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={ES_APK ? "es-apk" : undefined}>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>
          <Nativo />
          <OfflineBanner />
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main className="page-enter flex-1 pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
            <Footer />
            <BottomNav />
          </div>
        </Providers>
        {!ES_APK && (
          <Script
            id="sw-registro"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `if("serviceWorker" in navigator){navigator.serviceWorker.register("${BASE}/sw.js").catch(function(){})}`,
            }}
          />
        )}
      </body>
    </html>
  );
}
