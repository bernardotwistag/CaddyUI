"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Log out"
      title="Log out"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );
}
