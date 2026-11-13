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
      className={`${plusJakartaSans.variable} ${inter.variable} ${bebasNeue.variable} font-sans h-full antialiased dark`}
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

                  // Atualização imediata do Favicon pré-hidratação
                  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="480 60 960 960"><circle cx="960" cy="540" r="441.163" fill="' + chosen + '" stroke="' + chosen + '" stroke-width="32" stroke-miterlimit="10"/><g fill="' + contrast + '"><path d="M992.128 738.841 L992.128 341.159 L839.461 341.159 C810.992 341.159 787.193 345.608 768.066 354.504 C748.938 363.401 734.57 375.634 724.961 391.203 C715.353 406.772 710.549 424.521 710.549 444.45 C710.549 460.464 713.573 474.209 719.623 485.686 C725.673 497.162 733.902 506.548 744.311 513.844 C754.721 521.139 766.509 526.388 779.676 529.591 L779.676 532.794 C765.263 533.683 751.607 538.087 738.707 546.005 C725.806 553.923 715.308 564.911 707.212 578.967 C699.116 593.024 695.068 609.928 695.068 629.679 C695.068 650.675 700.095 669.402 710.148 685.861 C720.201 702.32 735.326 715.265 755.521 724.695 C775.717 734.126 801.028 738.841 831.454 738.841 Z M903.706 679.856 L841.864 679.856 C816.063 679.856 797.158 674.785 785.147 664.642 C773.137 654.5 767.131 641.244 767.131 624.874 C767.131 612.953 770.067 602.321 775.939 592.98 C781.811 583.638 790.174 576.254 801.028 570.827 C811.882 565.4 824.782 562.687 839.728 562.687 L921.133 562.687 L921.133 662.429 C921.133 672.053 913.331 679.856 903.706 679.856 Z M921.133 510.374 L847.202 510.374 C834.568 510.374 823.269 508.061 813.305 503.435 C803.341 498.808 795.512 492.269 789.818 483.817 C784.124 475.366 781.277 465.268 781.277 453.524 C781.277 437.866 786.793 425.01 797.825 414.957 C808.857 404.904 824.96 399.877 846.134 399.877 L921.133 399.877 Z"/><path d="M921.199 738.841 L921.199 341.159 L1071.464 341.159 C1101.535 341.159 1127.024 346.453 1147.931 357.04 C1168.838 367.627 1184.719 382.484 1195.573 401.612 C1206.427 420.74 1211.854 443.026 1211.854 468.471 C1211.854 493.915 1206.338 515.979 1195.306 534.662 C1184.274 553.345 1168.171 567.758 1146.997 577.9 C1125.823 588.042 1100.022 593.113 1069.596 593.113 L962.836 593.113 L962.836 534.128 L1062.389 534.128 C1080.005 534.128 1094.506 531.548 1105.894 526.388 C1117.282 521.228 1125.778 513.755 1131.383 503.968 C1136.988 494.182 1139.79 482.35 1139.79 468.471 C1139.79 454.236 1136.988 442.092 1131.383 432.039 C1125.778 421.986 1117.237 414.29 1105.761 408.952 C1094.284 403.614 1079.738 400.945 1062.122 400.945 L1062.122 400.945 C998.894 401.612 992.461 412.535 992.461 470.606 L992.461 738.841 Z M1145.662 738.841 L1050.112 558.683 L1127.513 558.683 L1224.932 738.841 Z"/></g></svg>';
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
