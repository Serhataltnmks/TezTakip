"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { documentTypeLabel } from "@/lib/labels";

const types = Object.keys(documentTypeLabel) as (keyof typeof documentTypeLabel)[];

export function DocumentUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<(typeof types)[number]>("TEZ_ONERISI");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [drag, setDrag] = useState(false);

  function pick(f?: File | null) {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  async function upload() {
    if (!file) {
      toast.error("Bir dosya seçin.");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    form.append("title", title);
    form.append("description", description);

    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/documents");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            toast.success("Dosya yüklendi.");
            window.location.reload();
            resolve();
          } else {
            toast.error(data.error ?? "Yükleme başarısız");
            reject();
          }
        } catch {
          toast.error("Yükleme başarısız");
          reject();
        }
      };
      xhr.onerror = () => {
        toast.error("Ağ hatası");
        reject();
      };
      xhr.send(form);
    });
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files?.[0]);
        }}
        className={`rounded-lg border-2 border-dashed p-8 text-center ${drag ? "border-primary bg-muted/50" : ""}`}
      >
        <p className="font-medium">Dosyayı sürükleyip bırakın veya seçin</p>
        <p className="text-sm text-muted-foreground">.doc, .docx, .pdf, .ppt, .pptx — en fazla 25 MB</p>
        <Input className="mx-auto mt-3 max-w-xs" type="file" accept=".doc,.docx,.pdf,.ppt,.pptx" onChange={(e) => pick(e.target.files?.[0])} />
        {file && <p className="mt-2 text-sm">{file.name}</p>}
      </div>
      {progress > 0 && <Progress value={progress} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label>Belge türü</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            {types.map((t) => (
              <option key={t} value={t}>
                {documentTypeLabel[t]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Başlık</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Kısa açıklama</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <Button size="lg" onClick={upload}>
        Yükle
      </Button>
    </div>
  );
}
