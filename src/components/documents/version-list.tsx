import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { documentStatusLabel } from "@/lib/labels";
import { formatBytes } from "@/lib/utils";
import { isPreviewablePdf } from "@/lib/file-validation";
import { StatusActions } from "./status-actions";
import type { Comment, DocumentVersion, User } from "@prisma/client";
import type { DocumentStatus } from "@/lib/enums";

type Version = DocumentVersion & { comments?: (Comment & { author: User })[] };

export function VersionList({
  versions,
  documentId,
  canReview,
}: {
  versions: Version[];
  documentId: string;
  canReview: boolean;
}) {
  return (
    <div className="space-y-3">
      {versions.map((v) => {
        const pdf = isPreviewablePdf(v.mimeType, v.originalName);
        return (
          <Card key={v.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">
                v{v.versionNo} · {v.originalName}
              </CardTitle>
              <Badge
                variant={
                  v.status === "ONAYLANDI" ? "success" : v.status === "DUZELTME_GEREKLI" ? "warning" : "secondary"
                }
              >
                {documentStatusLabel[v.status]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                {formatBytes(v.size)} · {format(v.uploadedAt, "d MMM yyyy HH:mm", { locale: tr })}
              </p>
              <div className="flex flex-wrap gap-2">
                {pdf && (
                  <Button asChild variant="outline">
                    <a href={`/api/files/${v.id}?inline=1`} target="_blank" rel="noreferrer">
                      PDF önizle
                    </a>
                  </Button>
                )}
                <Button asChild>
                  <a href={`/api/files/${v.id}`}>İndir</a>
                </Button>
              </div>
              {canReview && <StatusActions documentId={documentId} versionId={v.id} current={v.status} />}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export type { DocumentStatus };
