"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProfileForms({
  firstName,
  lastName,
  extra,
  advisor,
}: {
  firstName: string;
  lastName: string;
  extra?: string;
  advisor?: {
    title: string;
    expertise: string;
    quotaLisans: number;
    quotaYL: number;
    officeHours: string;
  };
}) {
  const [fn, setFn] = useState(firstName);
  const [ln, setLn] = useState(lastName);
  const [title, setTitle] = useState(advisor?.title ?? "");
  const [expertise, setExpertise] = useState(advisor?.expertise ?? "");
  const [quotaLisans, setQuotaLisans] = useState(advisor?.quotaLisans ?? 0);
  const [quotaYL, setQuotaYL] = useState(advisor?.quotaYL ?? 0);
  const [officeHours, setOfficeHours] = useState(advisor?.officeHours ?? "");
  const [currentPassword, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirm] = useState("");

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const body = advisor
      ? { firstName: fn, lastName: ln, title, expertise, quotaLisans, quotaYL, officeHours }
      : { firstName: fn, lastName: ln };
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Kaydedilemedi");
    else toast.success("Profil güncellendi.");
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, password, confirmPassword }),
    });
    const data = await res.json();
    if (!res.ok) toast.error(data.error ?? "Şifre güncellenemedi");
    else {
      toast.success("Şifre değiştirildi.");
      setCurrent("");
      setPassword("");
      setConfirm("");
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Bilgiler</CardTitle>
        </CardHeader>
        <CardContent>
          {extra && <p className="mb-3 text-sm text-muted-foreground">{extra}</p>}
          <form className="space-y-3" onSubmit={saveProfile}>
            <div className="space-y-1">
              <Label>Ad</Label>
              <Input value={fn} onChange={(e) => setFn(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Soyad</Label>
              <Input value={ln} onChange={(e) => setLn(e.target.value)} />
            </div>
            {advisor && (
              <>
                <div className="space-y-1">
                  <Label>Unvan</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Uzmanlık alanları</Label>
                  <Textarea value={expertise} onChange={(e) => setExpertise(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label>Lisans kotası</Label>
                    <Input type="number" value={quotaLisans} onChange={(e) => setQuotaLisans(Number(e.target.value))} />
                  </div>
                  <div className="space-y-1">
                    <Label>YL kotası</Label>
                    <Input type="number" value={quotaYL} onChange={(e) => setQuotaYL(Number(e.target.value))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Görüşme saatleri</Label>
                  <Input value={officeHours} onChange={(e) => setOfficeHours(e.target.value)} />
                </div>
              </>
            )}
            <Button type="submit">Kaydet</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Şifre değiştir</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={savePassword}>
            <div className="space-y-1">
              <Label>Mevcut şifre</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrent(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Yeni şifre</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Yeni şifre (tekrar)</Label>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button type="submit">Şifreyi güncelle</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
