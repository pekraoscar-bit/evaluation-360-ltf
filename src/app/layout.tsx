import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Évaluation 360° | LA TULIPE FOOD",
  description:
    "Plateforme RH d'évaluation 360° des responsables, chefs d'équipe et superviseurs de LA TULIPE FOOD.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
