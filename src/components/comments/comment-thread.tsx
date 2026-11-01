"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fullName } from "@/lib/utils";
import type { Comment, User } from "@prisma/client";

export function CommentThread({
  versionId,
  comments,
}: {
  versionId?: string;
  comments: (Comment & { author: User })[];
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!versionId) return;
    setLoading(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentVersionId: versionId, content }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Yorum eklenemedi");
      return;
    }
    toast.success("Yorum gönderildi.");
    window.location.reload();
  }

  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold">Yorumlar</h3>
      <div className="space-y-3">
        {comments.length === 0 && <p className="text-sm text-muted-foreground">Henüz yorum yok.</p>}
        {comments.map((c) => (
          <div key={c.id} className="rounded-md border p-3">
            <p className="text-sm font-medium">
              {fullName(c.author.firstName, c.author.lastName)} ·{" "}
              <span className="font-normal text-muted-foreground">
                {format(c.createdAt, "d MMM yyyy HH:mm", { locale: tr })}
              </span>
            </p>
            <p className="mt-1 text-sm">{c.content}</p>
          </div>
        ))}
      </div>
      {versionId && (
        <form className="mt-4 space-y-2" onSubmit={submit}>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Yanıt yazın" required />
          <Button type="submit" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Yorum gönder"}
          </Button>
        </form>
      )}
    </div>
  );
}
