
import { createClient } from '@supabase/supabase-js';

const envUrl = process.env.SUPABASE_URL;
const envKey = process.env.SUPABASE_ANON_KEY;

const placeholderUrl = "https://your-project-id.supabase.co";
const placeholderKey = "your-public-anon-key-here";

const isRealUrl = envUrl && envUrl.startsWith('http') && !envUrl.includes("your-project-id");
const isRealKey = envKey && envKey.length > 20 && !envKey.includes("anon-key");

export const SUPABASE_URL = isRealUrl ? envUrl : placeholderUrl;
export const SUPABASE_ANON_KEY = isRealKey ? envKey : placeholderKey;

// إنشاء عميل Supabase مع تفعيل الحفظ التلقائي للجلسة
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});

if (typeof window !== 'undefined') {
  if (isRealUrl && isRealKey) {
    console.log("%c [MineCloud] Cloud Core: Persistent Session Active ✅ ", "background: #064e3b; color: #10b981; font-weight: bold; padding: 4px; border-radius: 4px;");
  } else {
    console.error("%c [MineCloud] Cloud Core: CONFIG MISSING! ❌ ", "background: #450a0a; color: #f87171; font-weight: bold; padding: 4px; border-radius: 4px;");
  }
}
