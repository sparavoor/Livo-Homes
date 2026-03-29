import fs from 'fs/promises';
import path from 'path';
import { supabaseAdmin } from './supabase-admin';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');
const BUCKET_NAME = 'livo-homes';

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function ensureBucket() {
  if (!supabaseAdmin) return false;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const livoBucket = buckets?.find(b => b.name === BUCKET_NAME);
    
    if (!livoBucket) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
    }
    return true;
  } catch (error) {
    console.warn('Error ensuring bucket exists:', error);
    return false;
  }
}

export async function handleFileUploads(files: File[]): Promise<string[]> {
  const filePaths: string[] = [];

  // Try Supabase first (Cloud)
  if (supabaseAdmin) {
    const hasBucket = await ensureBucket();
    if (hasBucket) {
      for (const file of files) {
        if (!file || file.size === 0 || typeof file === 'string') continue;
        
        try {
          const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
          const buffer = await file.arrayBuffer();
          
          const { data, error } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(fileName, buffer, {
              contentType: file.type,
              upsert: true
            });
            
          if (error) throw error;
          
          if (data) {
            const { data: { publicUrl } } = supabaseAdmin.storage
              .from(BUCKET_NAME)
              .getPublicUrl(data.path);
            filePaths.push(publicUrl);
          }
        } catch (error) {
          console.error('Supabase upload failed, will NOT fallback for security/persistance reasons on cloud:', error);
        }
      }
      
      if (filePaths.length > 0) return filePaths;
    }
  }

  // Fallback to Local (Dev only or if Supabase is missing)
  // NOTE: This will not persist on Vercel deployments!
  await ensureUploadDir();
  for (const file of files) {
    if (!file || file.size === 0 || typeof file === 'string') continue;
    
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const filePath = path.join(UPLOAD_DIR, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      filePaths.push(`/uploads/${fileName}`);
    } catch (error) {
      console.error('Local upload failed:', error);
    }
  }

  return filePaths;
}
