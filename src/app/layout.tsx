import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
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
  title: "Hippocampus | Questões de Residência Médica",
  description: "Plataforma de alta performance para preparação para Residência Médica com métricas, percentil calibrado e simulados oficiais",
  verification: {
    google: "WcJXbqVmrkob5mCp0ref0IbF1ANcT76ldFjlicER4cQ",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    apple: "/apple-touch-icon.png",
  }
};

import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { ToastProvider } from "@/components/Toast";
import { HippocampusGlobalSplash } from "@/components/HippocampusGlobalSplash";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${plusJakartaSans.variable} ${inter.variable} ${bebasNeue.variable} font-sans h-full antialiased dark hippo-splash-active`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200">
        <Script id="google-gsi-client" src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <Script
          id="banco-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var m = localStorage.getItem('banco_theme_mode');
                  if (m === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                  var a = localStorage.getItem('banco_accent_color');
                  var colors = {
                    blue: '#2563eb',
                    green: '#059669',
                    orange: '#ea580c',
                    purple: '#7c3aed',
                    red: '#dc2626',
                    rose: '#e11d48',
                    neutral: m === 'light' ? '#18181b' : '#ffffff'
                  };
                  var hovers = {
                    blue: '#1d4ed8',
                    green: '#047857',
                    orange: '#c2410c',
                    purple: '#6d28d9',
                    red: '#b91c1c',
                    rose: '#be123c',
                    neutral: m === 'light' ? '#27272a' : '#ffffff'
                  };
                  var glows = {
                    blue: 'rgba(37, 99, 235, 0.15)',
                    green: 'rgba(5, 150, 105, 0.15)',
                    orange: 'rgba(234, 88, 12, 0.15)',
                    purple: 'rgba(124, 58, 237, 0.15)',
                    red: 'rgba(220, 38, 38, 0.15)',
                    rose: 'rgba(225, 29, 72, 0.14)',
                    neutral: m === 'light' ? 'rgba(24, 24, 27, 0.12)' : 'rgba(255, 255, 255, 0.14)'
                  };
                  var chosen = (a && colors[a]) ? colors[a] : '#2563eb';
                  var chosenHover = (a && hovers[a]) ? hovers[a] : '#1d4ed8';
                  var chosenGlow = (a && glows[a]) ? glows[a] : 'rgba(37, 99, 235, 0.15)';
                  var contrast = (a === 'neutral' && m !== 'light') ? '#09090b' : '#ffffff';
                  var isDark = m !== 'light';
                  var surfaceDarks = { blue: '#090b10', green: '#070f0c', orange: '#0c0a08', purple: '#0b0910', red: '#0f0808', rose: '#0f080a', neutral: '#09090b' };
                  var surfaceLights = { blue: '#f8faff', green: '#f5faf7', orange: '#fffaf7', purple: '#fbf9ff', red: '#fff8f8', rose: '#fff8f9', neutral: '#fafafa' };
                  var cardDarks = { blue: '#11141c', green: '#0d1814', orange: '#151210', purple: '#131119', red: '#181010', rose: '#181013', neutral: '#121215' };
                  var pageBg = isDark ? (surfaceDarks[a] || '#090b10') : (surfaceLights[a] || '#f8faff');
                  var cardBg = isDark ? (cardDarks[a] || '#11141c') : '#ffffff';

                  document.documentElement.style.setProperty('--bg-page', pageBg);
                  document.documentElement.style.setProperty('--bg-card', cardBg);
                  document.documentElement.style.setProperty('--accent-primary', chosen);
                  document.documentElement.style.setProperty('--accent-hover', chosenHover);
                  document.documentElement.style.setProperty('--primary-color', chosen);
                  document.documentElement.style.setProperty('--primary-hover', chosenHover);
                  document.documentElement.style.setProperty('--glow-color', chosenGlow);
                  document.documentElement.style.setProperty('--accent-muted', chosenGlow);
                  document.documentElement.style.setProperty('--logo-primary', chosen);
                  document.documentElement.style.setProperty('--logo-contrast', contrast);

                  // Atualização imediata do Favicon pré-hidratação com o símbolo oficial Hippocampus
                  var strokeColor = isDark ? '#ffffff' : '#000000';
                  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2160 1920"><g><path d="M718.74 906.921 C882.704 405.986 1702.884 702.375 1543.416 1022.75 C1373.738 1363.638 1050.008 860.221 842.727 1632.282" fill="none" stroke="' + strokeColor + '" stroke-width="132" stroke-miterlimit="10"/><path d="M854.033 1157.092 C673.215 1042.009 422.801 1191.281 298.333 1070.475 C184.287 959.785 362.047 674.876 362.047 674.876 C675.35 161.911 1357.793 222.808 1670.993 488.16 C2360.998 1072.751 1270.756 1971.842 1270.756 1336.094" fill="none" stroke="' + strokeColor + '" stroke-width="132" stroke-miterlimit="10"/></g></svg>';
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
        <div className="hippo-main-app-content flex-1 flex flex-col">
          <ThemeProvider>
            <AuthProvider>
              <SubscriptionProvider>
                <ToastProvider>{children}</ToastProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
