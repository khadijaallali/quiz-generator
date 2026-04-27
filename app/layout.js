import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "QuizAI — Génération de quiz par IA",
  description:
    "Créez, partagez et suivez vos quiz QCM intelligents générés par IA.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full bg-zinc-50 text-zinc-900 flex flex-col"
        suppressHydrationWarning
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
            © {new Date().getFullYear()} QuizAI
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
