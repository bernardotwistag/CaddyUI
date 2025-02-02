import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold">Caddy UI</Link>
            <Separator orientation="vertical" className="h-6" />
            <nav className="hidden md:flex space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/">Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/http">HTTP</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/config">Config</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container p-6">
        {children}
      </main>
    </div>
  );
} 