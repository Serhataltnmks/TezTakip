"use client";

import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Notification } from "@prisma/client";

export function NotificationList({ initial }: { initial: Notification[] }) {
  async function markAll() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" });
    toast.success("Tümü okundu işaretlendi.");
    window.location.reload();
  }

  return (
    <div>
      <Button variant="outline" className="mb-4" onClick={markAll}>
        Tümünü okundu işaretle
      </Button>
      <div className="space-y-2">
        {initial.length === 0 && <p className="text-sm text-muted-foreground">Bildirim yok.</p>}
        {initial.map((n) => (
          <Link
            key={n.id}
            href={n.link || "#"}
            className={`block rounded-md border p-3 ${n.isRead ? "opacity-70" : "bg-primary/5"}`}
            onClick={() =>
              fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: n.id }),
              })
            }
          >
            <p className="text-sm">{n.message}</p>
            <p className="text-xs text-muted-foreground">
              {format(n.createdAt, "d MMM yyyy HH:mm", { locale: tr })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
