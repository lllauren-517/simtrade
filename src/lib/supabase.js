import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn('⚠ Supabase 環境變數未設定，請建立 .env.local 並填入憑證')
}

export const supabase = createClient(url || '', key || '')
