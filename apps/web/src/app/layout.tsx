import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "HabitApp",
    template: "%s | HabitApp",
  },
  description:
    "Registra hábitos, controla tu tiempo y descubre los patrones que te frenan. Insights con IA incluidos.",
  metadataBase: new URL("https://habitapp.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${inter.variable} ${nunito.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
