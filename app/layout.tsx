import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Glaze Shelf",
  description: "Know what you have. Discover what works.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
