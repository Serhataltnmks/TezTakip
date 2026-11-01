"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ApprovalActions({ advisorId }: { advisorId: string }) {
  async function setStatus(approvalStatus: "ONAYLANDI" | "REDDEDILDI") {
    const rejectionReason = approvalStatus === "REDDEDILDI" ? window.prompt("Red gerekçesi") ?? "" : undefined;
    const res = await fetch("/api/admin/advisors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advisorId, approvalStatus, rejectionReason }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Güncellenemedi");
    else {
      toast.success("Durum güncellendi.");
      window.location.reload();
    }
  }

  return (
    <div className="flex gap-2">
      <Button onClick={() => setStatus("ONAYLANDI")}>Onayla</Button>
      <Button variant="destructive" onClick={() => setStatus("REDDEDILDI")}>
        Reddet
      </Button>
    </div>
  );
}
