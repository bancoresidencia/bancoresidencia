import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Banco Residência Médica | Plataforma de Alta Performance",
  description: "Plataforma de alta performance para preparação para Residência Médica com métricas, percentil calibrado e simulados oficiais",
};

import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${figtree.variable} font-sans h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <script
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
                    red: '#dc2626'
                  };
                  var hovers = {
                    blue: '#1d4ed8',
                    green: '#047857',
                    orange: '#c2410c',
                    purple: '#6d28d9',
                    red: '#b91c1c'
                  };
                  var glows = {
                    blue: 'rgba(37, 99, 235, 0.15)',
                    green: 'rgba(5, 150, 105, 0.15)',
                    orange: 'rgba(234, 88, 12, 0.15)',
                    purple: 'rgba(124, 58, 237, 0.15)',
                    red: 'rgba(220, 38, 38, 0.15)'
                  };
                  if (a && colors[a]) {
                    document.documentElement.style.setProperty('--primary-color', colors[a]);
                    document.documentElement.style.setProperty('--primary-hover', hovers[a]);
                    document.documentElement.style.setProperty('--glow-color', glows[a]);
                    document.documentElement.style.setProperty('--accent-muted', glows[a]);
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
