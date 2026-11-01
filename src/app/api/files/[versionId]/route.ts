import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { canAccessDocumentVersion } from "@/lib/authorization";
import { isPreviewablePdf } from "@/lib/file-validation";
import { handleAuthError, jsonError, requireUser } from "@/lib/session";
import { storage } from "@/lib/storage";

export async function GET(request: Request, { params }: { params: { versionId: string } }) {
  try {
    const user = await requireUser();
    const access = await canAccessDocumentVersion(user, params.versionId);
    if (!access.ok || !access.version) return jsonError("Bu dosyaya erişemezsiniz.", 403);

    const filePath = storage.getAbsolutePath(access.version.storedName);
    try {
      await stat(filePath);
    } catch {
      return jsonError("Dosya diskte bulunamadı.", 404);
    }

    const inline = new URL(request.url).searchParams.get("inline") === "1";
    const preview = inline && isPreviewablePdf(access.version.mimeType, access.version.originalName);
    const nodeStream = createReadStream(filePath);
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream;

    return new Response(webStream, {
      headers: {
        "Content-Type": access.version.mimeType || "application/octet-stream",
        "Content-Disposition": `${preview ? "inline" : "attachment"}; filename="${encodeURIComponent(access.version.originalName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
