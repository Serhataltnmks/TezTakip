"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type Advisor = {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  expertise: string[];
  remainingQuota: number;
};

export function AdvisorPicker() {
  const [q, setQ] = useState("");
  const [expertise, setExpertise] = useState("");
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (expertise) params.set("expertise", expertise);
    fetch(`/api/advisors?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setAdvisors(d.advisors ?? []));
  }, [q, expertise]);

  const selectedAdvisors = useMemo(
    () => selected.map((id) => advisors.find((a) => a.id === id)).filter(Boolean) as Advisor[],
    [selected, advisors]
  );

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) {
        toast.error("En fazla 3 danışman seçebilirsiniz.");
        return prev;
      }
      return [...prev, id];
    });
  }

  async function submit() {
    if (selected.length === 0) {
      toast.error("En az bir danışman seçin.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ advisorIds: selected, note }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Tercih gönderilemedi");
      return;
    }
    toast.success("Tercihleriniz 1. sıradaki danışmana iletildi.");
    window.location.reload();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Ada veya unvana göre ara" value={q} onChange={(e) => setQ(e.target.value)} />
          <Input placeholder="Uzmanlık alanına göre filtrele" value={expertise} onChange={(e) => setExpertise(e.target.value)} />
        </div>
        {advisors.length === 0 && <p className="text-sm text-muted-foreground">Uygun danışman bulunamadı.</p>}
        {advisors.map((a) => (
          <Card key={a.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <CardTitle className="text-base">
                {a.title} {a.firstName} {a.lastName}
              </CardTitle>
              <Badge>Kalan kontenjan: {a.remainingQuota}</Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{a.expertise.join(", ") || "Uzmanlık belirtilmemiş"}</p>
              <Button variant={selected.includes(a.id) ? "secondary" : "default"} onClick={() => toggle(a.id)}>
                {selected.includes(a.id) ? "Kaldır" : "Tercihe ekle"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sıralı tercihleriniz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedAdvisors.length === 0 && <p className="text-sm text-muted-foreground">Henüz seçim yok.</p>}
          <ol className="list-decimal space-y-1 pl-4 text-sm">
            {selectedAdvisors.map((a) => (
              <li key={a.id}>
                {a.title} {a.firstName} {a.lastName}
              </li>
            ))}
          </ol>
          <Textarea
            placeholder="Kısa not / ön konu fikri (isteğe bağlı)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button className="w-full" size="lg" onClick={submit} disabled={loading}>
            {loading ? "Gönderiliyor..." : "Tercihleri gönder"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
