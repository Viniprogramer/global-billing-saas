import type { Metadata } from "next";
import "./globals.css"; // Garante que o Tailwind CSS seja carregado

export const metadata: Metadata = {
  title: "Sales CRM | Portfolio Project",
  description: "Fullstack sales CRM with JWT auth, REST API, Prisma, Kanban pipeline, and bilingual UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-950 text-slate-50">
        {children}
      </body>
    </html>
  );
}
