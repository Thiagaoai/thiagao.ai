import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const brandName = "ThigaoA.i";
const siteUrl = "https://thiagao.io";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${brandName} - Dev, Automação, LangGraph & IA Customizada`,
  description: "Thiago do Carmo cria automações, sites, agentes de IA, LangGraph, LangSmith, n8n, chatbots e soluções customizadas para negócios reais.",
  keywords: [brandName, "thiagao.io", "Thiago do Carmo", "LangGraph", "LangSmith", "Automação", "IA Customizada", "Next.js", "n8n", "AI Agents"],
  authors: [{ name: "Thiago do Carmo" }],
  creator: "Thiago do Carmo",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: `${brandName} - Dev, Automação, LangGraph & IA Customizada`,
    description: "Newsletter e dev log sobre IA aplicada, LangGraph, LangSmith, automações, sites e soluções customizadas.",
    url: siteUrl,
    siteName: brandName,
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/brand/thigaoai-logo.png",
        width: 1024,
        height: 1024,
        alt: `${brandName} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${brandName} - Dev, Automação, LangGraph & IA Customizada`,
    description: "Newsletter e dev log sobre IA aplicada, LangGraph, LangSmith, automações, sites e soluções customizadas.",
    images: ["/brand/thigaoai-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <head>
        <link rel="canonical" href="https://thiagao.io" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
