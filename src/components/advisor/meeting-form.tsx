"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function MeetingForm({ thesisId }: { thesisId: string }) {
  const [date, setDate] = useState("");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thesisId, date, subject, notes }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Eklenemedi");
    else {
      toast.success("Görüşme kaydedildi.");
      window.location.reload();
    }
  }

  return (
    <form className="space-y-2 pt-2" onSubmit={submit}>
      <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
      <Input placeholder="Konu" value={subject} onChange={(e) => setSubject(e.target.value)} required />
      <Textarea placeholder="Notlar" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button type="submit" size="sm">
        Görüşme ekle
      </Button>
    </form>
  );
}
