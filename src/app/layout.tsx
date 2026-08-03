// @ts-nocheck
import { Toaster } from '@/components/ui/toast';
import { ColorThemeProvider } from '@/components/layout/ColorThemeProvider';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ServiceWorkerCleanup } from '@/components/layout/ServiceWorkerCleanup';
import NextTopLoader from 'nextjs-toploader';
import '@/styles/globals.css';

export const metadata = {
  metadataBase: new URL('https://dashboard.canis.world'),
  title: 'Canis Den 後台',
  description: 'Canis Den 網站後台',
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "512x512" }],
  },
  keywords: [
    'Canis Den 後台',
    '電腦',
    '筆電',
    '零組件',
    '周邊',
    '維修',
    '設計',
    'UI',
    'UX',
    '前端工程師',
  ],
  authors: [{ name: '張永昌' }],
  creator: '張永昌',
  publisher: '張永昌',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Canis Den 後台',
    url: 'https://dashboard.canis.world/',
    siteName: 'Canis Den 後台',
    description: 'Canis Den 網站後台',
    type: 'website',
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Canis Den 後台',
    description: 'Canis Den 網站後台',
    creator: 'Canis Den 後台',
  },
  appleWebApp: {
    title: 'Canis Den 後台',
    statusBarStyle: 'black-translucent',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: true,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-icon.png" type="image/png" sizes="512x512" />
      </head>
      <body>
        <ThemeProvider>
          <ColorThemeProvider>
            <TooltipProvider delay={0} closeDelay={0} timeout={0}>
              <ServiceWorkerCleanup />
              <NextTopLoader color="var(--primary)" showSpinner={false} />
              {children}
              <Toaster />
            </TooltipProvider>
          </ColorThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
