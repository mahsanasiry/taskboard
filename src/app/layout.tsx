import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taskboard: a simple Kanban board",
  description:
    "A fast Kanban task board built with Next.js, TypeScript and Tailwind CSS. Add, edit, search and drag tasks between columns. Your tasks stay in your browser.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
