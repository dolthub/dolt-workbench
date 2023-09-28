import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dolt SQL Workbench",
  description:
    "A workbench for Dolt, a SQL database with Git-style versioning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
