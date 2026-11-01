import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { CommentThread } from "@/components/comments/comment-thread";
import { VersionList } from "@/components/documents/version-list";
import { documentTypeLabel } from "@/lib/labels";
import { canAccessThesis } from "@/lib/authorization";
import { getStudentContext } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
  const { user } = await getStudentContext();
  const document = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      versions: {
        orderBy: { versionNo: "desc" },
        include: { comments: { include: { author: true }, orderBy: { createdAt: "asc" } } },
      },
    },
  });
  if (!document) notFound();
  const access = await canAccessThesis(user, document.thesisId);
  if (!access.ok) notFound();

  return (
    <div>
      <PageHeader title={document.title} description={documentTypeLabel[document.type]} />
      <p className="mb-4 text-sm text-muted-foreground">{document.description}</p>
      <VersionList versions={document.versions} documentId={document.id} canReview={false} />
      <div className="mt-6">
        <CommentThread versionId={document.versions[0]?.id} comments={document.versions[0]?.comments ?? []} />
      </div>
    </div>
  );
}
