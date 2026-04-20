import { createClient, SupabaseClient } from '@supabase/supabase-js'

const BUCKETS = {
  documentos: 'documentos',
  imagenes: 'imagenes',
} as const

type Bucket = keyof typeof BUCKETS

let _supabase: SupabaseClient | null = null

function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
    _supabase = createClient(url, key)
  }
  return _supabase
}

export async function uploadFile(
  buffer: Buffer,
  path: string,
  contentType: string,
  bucket: Bucket = 'documentos'
): Promise<string> {
  const { error } = await getSupabase().storage
    .from(BUCKETS[bucket])
    .upload(path, buffer, { contentType, upsert: true })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = getSupabase().storage.from(BUCKETS[bucket]).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteFile(path: string, bucket: Bucket = 'documentos'): Promise<void> {
  const { error } = await getSupabase().storage.from(BUCKETS[bucket]).remove([path])
  if (error) throw new Error(`Delete failed: ${error.message}`)
}

export async function getSignedUrl(path: string, expiresIn = 3600, bucket: Bucket = 'documentos'): Promise<string> {
  const { data, error } = await getSupabase().storage
    .from(BUCKETS[bucket])
    .createSignedUrl(path, expiresIn)
  if (error || !data?.signedUrl) throw new Error(`Signed URL failed: ${error?.message ?? 'unknown'}`)
  return data.signedUrl
}
