"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TermForm() {
  const [name, setName] = useState("");
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [isActive, setActive] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, startDate, endDate, isActive }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Eklenemedi");
    else {
      toast.success("Dönem eklendi.");
      window.location.reload();
    }
  }

  return (
    <form className="max-w-xl space-y-2" onSubmit={submit}>
      <Input placeholder="Dönem adı (ör. 2025-2026 Güz)" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input type="date" value={startDate} onChange={(e) => setStart(e.target.value)} required />
      <Input type="date" value={endDate} onChange={(e) => setEnd(e.target.value)} required />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setActive(e.target.checked)} />
        Aktif dönem olarak işaretle
      </label>
      <Button type="submit">Dönem ekle</Button>
    </form>
  );
}
