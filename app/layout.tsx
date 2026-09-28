import type { Metadata } from "next";
import { Fraunces, Pacifico, DM_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/site";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", weight: ["600", "800"] });
const script = Pacifico({ subsets: ["latin"], variable: "--font-script", weight: "400" });
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Laundry Day Off — Wash, Dry, Fold & Delivery",
  description: "You deserve a day off too. Professional wash, dry, fold and door-to-door delivery.",
  openGraph: {
    title: "Laundry Day Off — You deserve a day off too.",
    description: "Wash, dry, fold and delivery straight to your door.",
    images: [{ url: "/og.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${script.variable} ${body.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
