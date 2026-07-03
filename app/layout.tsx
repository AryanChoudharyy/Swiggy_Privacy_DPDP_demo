import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swiggy Privacy Center Prototype",
  description: "DPDP-ready privacy center prototype for a PM hiring case study.",
  icons: {
    icon: "https://cdn.dribbble.com/userupload/28176351/file/original-2f163c2fede027c929baa7b25f3e5d64.jpg",
    apple: "https://cdn.dribbble.com/userupload/28176351/file/original-2f163c2fede027c929baa7b25f3e5d64.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
