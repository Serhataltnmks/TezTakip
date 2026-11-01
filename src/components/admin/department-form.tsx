"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DepartmentForm() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, code }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Eklenemedi");
    else {
      toast.success("Bölüm eklendi.");
      window.location.reload();
    }
  }

  return (
    <form className="flex max-w-xl flex-col gap-2 sm:flex-row" onSubmit={submit}>
      <Input placeholder="Bölüm adı" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input placeholder="Kod" value={code} onChange={(e) => setCode(e.target.value)} required />
      <Button type="submit">Ekle</Button>
    </form>
  );
}
