import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "AddaDotCom | Premium Café & Restaurant",
  description:
    "Experience the warmth of authentic café culture at AddaDotCom. Browse our menu, reserve a table, or order online for dine-in, takeaway, or delivery.",
  keywords: ["café", "restaurant", "coffee", "food", "order online", "reserve table", "AddaDotCom"],
  openGraph: {
    title: "AddaDotCom | Premium Café & Restaurant",
    description: "Where every cup tells a story and every meal brings people together.",
    type: "website",
    locale: "en_IN",
    siteName: "AddaDotCom",
  },
  twitter: {
    card: "summary_large_image",
    title: "AddaDotCom | Premium Café & Restaurant",
    description: "Where every cup tells a story and every meal brings people together.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
