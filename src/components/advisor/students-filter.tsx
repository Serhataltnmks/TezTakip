"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { stageLabel } from "@/lib/labels";
import { THESIS_STAGES } from "@/lib/constants";

export function StudentsFilter() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/danisman/panel/ogrenciler?${next.toString()}`);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input
        placeholder="Ada veya öğrenci no ile ara"
        defaultValue={params.get("q") ?? ""}
        onChange={(e) => update("q", e.target.value)}
      />
      <select
        className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
        defaultValue={params.get("stage") ?? ""}
        onChange={(e) => update("stage", e.target.value)}
      >
        <option value="">Tüm aşamalar</option>
        {THESIS_STAGES.map((s) => (
          <option key={s} value={s}>
            {stageLabel[s]}
          </option>
        ))}
      </select>
    </div>
  );
}
