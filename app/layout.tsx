import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BCA IT Club Registration",
  description: "Register for BCA IT Club - Join our community!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
