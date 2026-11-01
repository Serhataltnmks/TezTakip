import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

export interface StorageService {
  save(buffer: Buffer, originalName: string): Promise<{ storedName: string }>;
  getAbsolutePath(storedName: string): string;
  delete(storedName: string): Promise<void>;
}

function uploadRoot() {
  return path.resolve(process.env.UPLOAD_DIR || "./uploads");
}

export class LocalDiskStorage implements StorageService {
  constructor(private readonly root = uploadRoot()) {}

  async save(buffer: Buffer, originalName: string) {
    await mkdir(this.root, { recursive: true });
    const ext = path.extname(originalName).toLowerCase();
    const storedName = `${randomUUID()}${ext}`;
    await writeFile(this.getAbsolutePath(storedName), buffer);
    return { storedName };
  }

  getAbsolutePath(storedName: string) {
    const safe = path.basename(storedName);
    return path.join(this.root, safe);
  }

  async delete(storedName: string) {
    try {
      await unlink(this.getAbsolutePath(storedName));
    } catch {
      // dosya yoksa sessizce geç
    }
  }
}

export const storage: StorageService = new LocalDiskStorage();
