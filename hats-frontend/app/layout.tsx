import { Inter } from "next/font/google";
import { NavBar } from "@/components/nav-bar";
import "./globals.css";
import type { Metadata } from "next";
import { UserProvider } from "@/context/UserContext"; // Import the UserProvider
import { AppWrapper } from "./AppWrapper"; // Import the AppWrapper

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HATS Meme Coin",
  description: "The most elegant token in the game 🎩",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
       <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  );
}
