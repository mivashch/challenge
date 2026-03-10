import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { createClient } from "@/lib/supabase-server";
import { UserMenu } from "@/components/UserMenu";
import { Sidebar } from "@/components/Sidebar";
import { GlobalSearch } from "@/components/GlobalSearch";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Knowledge Hub",
  description: "Your centralized developer knowledge base",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isPublicRoute = false // middleware handles redirect, layout just adapts

  return (
    <html lang="en" style={{ colorScheme: 'light dark' }}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {user ? (
            <div className="flex min-h-screen">
              <Sidebar />
              <div className="flex-1 ml-60 flex flex-col min-h-screen">
                <header className="h-14 border-b border-border/40 bg-card/40 backdrop-blur-sm sticky top-0 z-10 flex items-center px-6 gap-4">
                  <GlobalSearch />
                  <div className="ml-auto">
                    <UserMenu email={user.email ?? ''} />
                  </div>
                </header>
                <main className="flex-1 p-6 max-w-5xl w-full mx-auto">
                  {children}
                </main>
              </div>
            </div>
          ) : (
            <main>{children}</main>
          )}
        </Providers>
      </body>
    </html>
  );
}
