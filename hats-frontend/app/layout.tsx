import { Inter } from "next/font/google";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";
import type { Metadata } from "next";
import { UserProvider } from "@/context/UserContext"; // Import the UserProvider
import TelegramAnalytics from '@telegram-apps/analytics'
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HATS Meme Coin",
  description: "The most elegant token in the game 🎩",
};

TelegramAnalytics.init({
  token: process.env.NEXT_PUBLIC_AUTH_TOKEN || '',
  appName: 'hats',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <UserProvider>
          <div className="pb-16">{children}</div>
          <NavBar />
        </UserProvider>
      </body>
    </html>
  );
}
