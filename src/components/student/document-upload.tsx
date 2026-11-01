"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { documentTypeLabel } from "@/lib/labels";

const types = Object.keys(documentTypeLabel) as (keyof typeof documentTypeLabel)[];

export function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<keyof typeof documentTypeLabel>("TEZ_ONERISI");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [drag, setDrag] = useState(false);

  function onFiles(list: FileList | null) {
    const next = list?.[0];
    if (next) setFile(next);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      toast.error("Bir dosya seçin.");
      return;
    }
    setLoading(true);
    setProgress(15);
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    form.append("title", title);
    form.append("description", description);
    setProgress(45);
    const res = await fetch("/api/documents", { method: "POST", body: form });
    setProgress(90);
    const data = await res.json();
    setLoading(false);
    setProgress(100);
    if (!res.ok) {
      toast.error(data.error ?? "Yükleme başarısız");
      setProgress(0);
      return;
    }
    toast.success("Dosya yüklendi.");
    window.location.reload();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yeni yükleme</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={submit}>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              onFiles(e.dataTransfer.files);
            }}
            className={`rounded-lg border-2 border-dashed p-6 text-center ${drag ? "border-primary bg-primary/5" : ""}`}
          >
            <p className="text-sm">Dosyayı sürükleyip bırakın veya seçin (.doc, .docx, .pdf, .ppt, .pptx — en fazla 25 MB)</p>
            <Input className="mt-3" type="file" accept=".doc,.docx,.pdf,.ppt,.pptx" onChange={(e) => onFiles(e.target.files)} />
            {file && <p className="mt-2 text-sm font-medium">{file.name}</p>}
          </div>
          <div className="space-y-1">
            <Label>Belge türü</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {documentTypeLabel[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Başlık</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Kısa açıklama</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {loading && <Progress value={progress} />}
          <Button type="submit" disabled={loading}>
            {loading ? "Yükleniyor..." : "Yükle"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
