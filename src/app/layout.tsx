import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppClientInit } from "@/components/AppClientInit";
import { BottomNav } from "@/components/BottomNav";
import { Header } from "@/components/Header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simulados ENEM | Questões oficiais grátis",
  description:
    "Plataforma de simulados para estudantes com questões reais do ENEM via API pública.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-on-surface">
        <AppClientInit />
        <Header />
        <main className="mx-auto w-full max-w-container-max flex-1 px-4 py-8 pb-28 sm:px-gutter md:pb-10">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
