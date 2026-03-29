import fs from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function handleFileUploads(files: File[]): Promise<string[]> {
  await ensureUploadDir();
  const filePaths: string[] = [];

  for (const file of files) {
    if (!file || file.size === 0 || typeof file === 'string') continue;
    
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const filePath = path.join(UPLOAD_DIR, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    filePaths.push(`/uploads/${fileName}`);
  }

  return filePaths;
}
