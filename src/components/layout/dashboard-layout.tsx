import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UpdateIndicator } from "@/components/layout/update-indicator";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LogoutButton } from "@/components/layout/logout-button";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/http", label: "HTTP" },
  { href: "/config", label: "Config" },
  { href: "/help", label: "Help" },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-3">
            <MobileNav links={navLinks} />
            <Link href="/" className="text-xl font-bold tracking-tight">Caddy UI</Link>
            <Separator orientation="vertical" className="hidden md:block h-6" />
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((l) => (
                <Button key={l.href} variant="ghost" size="sm" asChild>
                  <Link href={l.href}>{l.label}</Link>
                </Button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-0.5">
            <UpdateIndicator />
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="container p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
