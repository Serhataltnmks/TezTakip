"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ThesisForm({ title, abstract }: { title: string; abstract: string }) {
  const [t, setT] = useState(title);
  const [a, setA] = useState(abstract);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/thesis", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t, abstract: a }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Kaydedilemedi");
      return;
    }
    toast.success("Tez konusu danışmanınıza gönderildi.");
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <div className="space-y-1">
        <Label>Tez başlığı</Label>
        <Input value={t} onChange={(e) => setT(e.target.value)} required minLength={8} />
      </div>
      <div className="space-y-1">
        <Label>Özet</Label>
        <Textarea value={a} onChange={(e) => setA(e.target.value)} required minLength={20} />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Gönderiliyor..." : "Kaydet ve gönder"}
      </Button>
    </form>
  );
}
