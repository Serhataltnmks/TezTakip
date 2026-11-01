"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DeadlineForm({ thesisId }: { thesisId: string }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/deadlines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thesisId, title, dueDate }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Eklenemedi");
    else {
      toast.success("Son tarih eklendi.");
      window.location.reload();
    }
  }

  return (
    <form className="space-y-2 pt-2" onSubmit={submit}>
      <Input placeholder="Teslim başlığı" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      <Button type="submit" size="sm">
        Son tarih ekle
      </Button>
    </form>
  );
}
