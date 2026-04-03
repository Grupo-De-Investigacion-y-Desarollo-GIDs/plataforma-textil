import { createClient, SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'documentos'

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
  contentType: string
): Promise<string> {
  const { error } = await getSupabase().storage
    .from(BUCKET)
    .upload(path, buffer, { contentType, upsert: true })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteFile(path: string): Promise<void> {
  const { error } = await getSupabase().storage.from(BUCKET).remove([path])
  if (error) throw new Error(`Delete failed: ${error.message}`)
}
