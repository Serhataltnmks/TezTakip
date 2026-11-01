"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ADVISOR_TITLES } from "@/lib/constants";
import { advisorRegisterSchema } from "@/lib/validations";

type Values = z.infer<typeof advisorRegisterSchema>;

export function AdvisorRegisterForm() {
  const router = useRouter();
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const form = useForm<Values>({
    resolver: zodResolver(advisorRegisterSchema),
    defaultValues: {
      title: "Dr. Öğr. Üyesi",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      departmentId: "",
      expertise: "",
      quotaLisans: 4,
      quotaYL: 2,
    },
  });

  useEffect(() => {
    fetch("/api/public/departments")
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments ?? []));
  }, []);

  async function onSubmit(values: Values) {
    const res = await fetch("/api/auth/register/advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Kayıt başarısız");
      return;
    }
    toast.success("Kayıt alındı. Yönetici onayından sonra panele erişebilirsiniz.");
    router.push("/danisman/giris");
  }

  return (
    <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-1">
        <Label>Unvan</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("title")}>
          {ADVISOR_TITLES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Ad</Label>
          <Input {...form.register("firstName")} />
        </div>
        <div className="space-y-1">
          <Label>Soyad</Label>
          <Input {...form.register("lastName")} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Kurumsal e-posta</Label>
        <Input type="email" {...form.register("email")} />
      </div>
      <div className="space-y-1">
        <Label>Bölüm</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register("departmentId")}>
          <option value="">Seçin</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label>Uzmanlık / çalışma alanları</Label>
        <Textarea placeholder="Virgülle ayırın: Yapay zeka, Veri tabanı" {...form.register("expertise")} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Lisans kontenjanı</Label>
          <Input type="number" min={0} {...form.register("quotaLisans")} />
        </div>
        <div className="space-y-1">
          <Label>Yüksek lisans kontenjanı</Label>
          <Input type="number" min={0} {...form.register("quotaYL")} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Şifre</Label>
        <Input type="password" {...form.register("password")} />
      </div>
      <div className="space-y-1">
        <Label>Şifre (tekrar)</Label>
        <Input type="password" {...form.register("confirmPassword")} />
      </div>
      {Object.values(form.formState.errors)[0] && (
        <p className="text-sm text-destructive">{Object.values(form.formState.errors)[0]?.message as string}</p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Kaydediliyor..." : "Kayıt ol"}
      </Button>
    </form>
  );
}
