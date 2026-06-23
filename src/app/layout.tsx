import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BlogSmith — AI SEO blog writer",
  description: "A multi-agent pipeline that researches, writes, and SEO-optimizes a blog post from a topic.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
