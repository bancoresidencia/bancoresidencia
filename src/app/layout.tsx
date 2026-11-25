import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" }
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hippocampusresidencia.com.br"),
  title: "Hippocampus | +200 Mil Questões de Residência Médica, Revalida e R+",
  description: "Engenharia de retenção clínica com +200 mil questões comentadas alternativa por alternativa, flashcards FSRS, resumos baseados em diretrizes e psicometria TRI calibrada.",
  verification: {
    google: "WcJXbqVmrkob5mCp0ref0IbF1ANcT76ldFjlicER4cQ",
  },
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  openGraph: {
    title: "Hippocampus | +200 Mil Questões de Residência Médica, Revalida e R+",
    description: "Engenharia de retenção clínica com +200 mil questões comentadas alternativa por alternativa, flashcards FSRS, resumos baseados em diretrizes e psicometria TRI calibrada.",
    url: "https://hippocampusresidencia.com.br",
    siteName: "Hippocampus",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Hippocampus — Questões de Residência Médica",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Hippocampus | +200 Mil Questões de Residência Médica, Revalida e R+",
    description: "Engenharia de retenção clínica com +200 mil questões comentadas alternativa por alternativa, flashcards FSRS e psicometria TRI.",
    images: ["/icon-512x512.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hippocampus"
  },
  formatDetection: {
    telephone: false
  }
};

import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ToastProvider } from "@/components/Toast";
import { HippocampusGlobalSplash } from "@/components/HippocampusGlobalSplash";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Lê o nonce injetado pelo middleware.ts (gerado por requisição).
  // O nonce é necessário para que o <Script strategy="beforeInteractive"> passe
  // pela CSP sem 'unsafe-inline' em script-src.
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? undefined;
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} font-sans h-full antialiased`}
      style={{ fontFamily: 'var(--font-inter, "Inter"), "Inter Fallback", system-ui, sans-serif' }}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200" suppressHydrationWarning>
        <Script
          id="banco-theme-init"
          strategy="beforeInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var m = localStorage.getItem('banco_theme_mode');
                  if (m === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                  var a = localStorage.getItem('banco_accent_color');
                  if (a === 'neutral') {
                    document.documentElement.classList.add('theme-monochrome');
                  }
                  var isDark = m !== 'light';
                  var lightPrimary = {
                    blue: '#1d4ed8',
                    green: '#047857',
                    orange: '#c2410c',
                    purple: '#6d28d9',
                    red: '#b91c1c',
                    rose: '#be123c',
                    neutral: '#18181b'
                  };
                  var darkPrimary = {
                    blue: '#2563eb',
                    green: '#059669',
                    orange: '#ea580c',
                    purple: '#7c3aed',
                    red: '#dc2626',
                    rose: '#e11d48',
                    neutral: '#fafafa'
                  };
                  var lightHover = {
                    blue: '#1e40af',
                    green: '#065f46',
                    orange: '#9a3412',
                    purple: '#5b21b6',
                    red: '#991b1b',
                    rose: '#9f1239',
                    neutral: '#27272a'
                  };
                  var darkHover = {
                    blue: '#3b82f6',
                    green: '#10b981',
                    orange: '#f97316',
                    purple: '#8b5cf6',
                    red: '#ef4444',
                    rose: '#f43f5e',
                    neutral: '#e4e4e7'
                  };
                  var lightGlows = {
                    blue: 'rgba(37, 99, 235, 0.10)',
                    green: 'rgba(4, 120, 87, 0.10)',
                    orange: 'rgba(194, 65, 12, 0.10)',
                    purple: 'rgba(124, 58, 237, 0.10)',
                    red: 'rgba(185, 28, 28, 0.10)',
                    rose: 'rgba(225, 29, 72, 0.10)',
                    neutral: 'rgba(24, 24, 27, 0.08)'
                  };
                  var darkGlows = {
                    blue: 'rgba(37, 99, 235, 0.15)',
                    green: 'rgba(5, 150, 105, 0.15)',
                    orange: 'rgba(234, 88, 12, 0.15)',
                    purple: 'rgba(124, 58, 237, 0.15)',
                    red: 'rgba(220, 38, 38, 0.15)',
                    rose: 'rgba(225, 29, 72, 0.15)',
                    neutral: 'rgba(255, 255, 255, 0.12)'
                  };
                  var colors = isDark ? darkPrimary : lightPrimary;
                  var hovers = isDark ? darkHover : lightHover;
                  var glows = isDark ? darkGlows : lightGlows;
                  var chosen = (a && colors[a]) ? colors[a] : colors.blue;
                  var chosenHover = (a && hovers[a]) ? hovers[a] : hovers.blue;
                  var chosenGlow = (a && glows[a]) ? glows[a] : glows.blue;
                  var contrast = (a === 'neutral' && isDark) ? '#09090b' : '#ffffff';
                  var surfaceLights = { blue: '#f1f5f9', green: '#f2f7f4', orange: '#f9f4f0', purple: '#f5f3fa', red: '#faf2f2', rose: '#faf2f5', neutral: '#f4f4f5' };
                  var inputLights = { blue: '#f8fafc', green: '#f7fbf9', orange: '#fdf9f6', purple: '#faf8fd', red: '#fdf8f8', rose: '#fdf8fa', neutral: '#fafafa' };
                  var borderLights = { blue: '#e2e8f0', green: '#dfe8e3', orange: '#ebe2dc', purple: '#e6e1f0', red: '#ecdede', rose: '#ecdfe4', neutral: '#e4e4e7' };
                  var pageBg = isDark ? '#09090b' : (surfaceLights[a] || '#f1f5f9');
                  var cardBg = isDark ? '#121215' : '#ffffff';
                  var inputBg = isDark ? '#18181b' : (inputLights[a] || '#f8fafc');
                  var borderCol = isDark ? '#27272a' : (borderLights[a] || '#e2e8f0');

                  document.documentElement.style.setProperty('--background', pageBg);
                  document.documentElement.style.setProperty('--bg-page', pageBg);
                  document.documentElement.style.setProperty('--card', cardBg);
                  document.documentElement.style.setProperty('--bg-card', cardBg);
                  document.documentElement.style.setProperty('--muted', inputBg);
                  document.documentElement.style.setProperty('--bg-input', inputBg);
                  document.documentElement.style.setProperty('--card-border', borderCol);
                  document.documentElement.style.setProperty('--border-input', borderCol);
                  document.documentElement.style.setProperty('--accent-primary', chosen);
                  document.documentElement.style.setProperty('--accent-hover', chosenHover);
                  document.documentElement.style.setProperty('--primary-color', chosen);
                  document.documentElement.style.setProperty('--primary-hover', chosenHover);
                  document.documentElement.style.setProperty('--primary-contrast', contrast);
                  document.documentElement.style.setProperty('--ring', chosen);
                  document.documentElement.style.setProperty('--ring-focus', chosen);
                  document.documentElement.style.setProperty('--glow-color', chosenGlow);
                  document.documentElement.style.setProperty('--accent-muted', chosenGlow);
                  document.documentElement.style.setProperty('--accent-subtle', chosenGlow);
                  document.documentElement.style.setProperty('--logo-primary', chosen);
                  document.documentElement.style.setProperty('--logo-contrast', contrast);

                  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2160 1920"><g><path d="M718.74 906.921 C882.704 405.986 1702.884 702.375 1543.416 1022.75 C1373.738 1363.638 1050.008 860.221 842.727 1632.282" fill="none" stroke="' + chosen + '" stroke-width="132" stroke-miterlimit="10"/><path d="M854.033 1157.092 C673.215 1042.009 422.801 1191.281 298.333 1070.475 C184.287 959.785 362.047 674.876 362.047 674.876 C675.35 161.911 1357.793 222.808 1670.993 488.16 C2360.998 1072.751 1270.756 1971.842 1270.756 1336.094" fill="none" stroke="' + chosen + '" stroke-width="132" stroke-miterlimit="10"/></g></svg>';
                  var link = document.querySelector("link[rel*='icon']");
                  if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                  }
                  link.type = 'image/svg+xml';
                  link.href = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
                } catch (e) {}
              })();
            `
          }}
        />
        <HippocampusGlobalSplash />
        <ThemeProvider>
          <AuthProvider>
            <div className="flex-1 flex flex-col">
              <SubscriptionProvider>
                <ToastProvider>{children}</ToastProvider>
              </SubscriptionProvider>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
