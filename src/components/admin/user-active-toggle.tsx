"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function UserActiveToggle({ userId, isActive }: { userId: string; isActive: boolean }) {
  async function toggle() {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isActive: !isActive }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Güncellenemedi");
    else {
      toast.success(isActive ? "Hesap pasifleştirildi." : "Hesap aktifleştirildi.");
      window.location.reload();
    }
  }

  return (
    <Button size="sm" variant={isActive ? "outline" : "default"} onClick={toggle}>
      {isActive ? "Pasifleştir" : "Aktifleştir"}
    </Button>
  );
}
