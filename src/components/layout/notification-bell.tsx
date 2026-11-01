"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function NotificationBell({ href }: { href: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications?unread=1")
      .then((r) => r.json())
      .then((d) => setCount(d.unreadCount ?? 0))
      .catch(() => setCount(0));
  }, []);

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href={href} aria-label="Bildirimler">
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
