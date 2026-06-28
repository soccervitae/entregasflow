import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EntregasFlow — Gestão de Delivery",
  description: "Sistema de gestão de entregas para estabelecimentos de food service",
  manifest: "/manifest.json",
  themeColor: "#0b1c30",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
