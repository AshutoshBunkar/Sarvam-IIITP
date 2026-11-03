import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bhasha — Socratic AI Programming Tutor",
  description: "Adaptive Socratic programming tutor powered by Sarvam AI. Understand the student's thinking before correcting their understanding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-pearl antialiased selection:bg-siren-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}

