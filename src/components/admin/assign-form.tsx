"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Item = { id: string; label: string; departmentId: string };

export function AssignForm({ students, advisors }: { students: Item[]; advisors: Item[] }) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const student = students.find((s) => s.id === studentId);
  const filtered = useMemo(
    () => advisors.filter((a) => !student || a.departmentId === student.departmentId),
    [advisors, student]
  );
  const [advisorId, setAdvisorId] = useState(filtered[0]?.id ?? "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, advisorId }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Atama başarısız");
    else toast.success("Danışman atandı.");
  }

  return (
    <form className="max-w-xl space-y-3" onSubmit={submit}>
      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      >
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={advisorId}
        onChange={(e) => setAdvisorId(e.target.value)}
      >
        {filtered.map((a) => (
          <option key={a.id} value={a.id}>
            {a.label}
          </option>
        ))}
      </select>
      <Button type="submit">Ata / değiştir</Button>
    </form>
  );
}
