import type { Metadata } from "next";
import "@/styles/globals.css";
import ToastProvider from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Resume Shapeshifter",
  description: "Turn any job description into a truthful, targeted resume rewrite with match scoring, gap analysis, and side-by-side comparison.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorBoundary>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
