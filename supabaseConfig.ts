
/**
 * إعدادات الربط بـ Supabase
 * يتم جلب هذه القيم من متغيرات البيئة التي قمنا بتعريفها في Netlify
 */

const envUrl = process.env.SUPABASE_URL;
const envKey = process.env.SUPABASE_ANON_KEY;

const placeholderUrl = "https://your-project-id.supabase.co";
const placeholderKey = "your-public-anon-key-here";

// التحقق مما إذا كانت القيم حقيقية أم مجرد نصوص افتراضية
const isRealUrl = envUrl && envUrl.startsWith('http') && !envUrl.includes("your-project-id");
const isRealKey = envKey && envKey.length > 20 && !envKey.includes("anon-key");

export const SUPABASE_URL = isRealUrl ? envUrl : placeholderUrl;
export const SUPABASE_ANON_KEY = isRealKey ? envKey : placeholderKey;

if (typeof window !== 'undefined') {
  if (isRealUrl && isRealKey) {
    console.log("%c [MineCloud] Cloud Core: Connected Successfully ✅ ", "background: #064e3b; color: #10b981; font-weight: bold; padding: 4px; border-radius: 4px;");
  } else {
    console.error("%c [MineCloud] Cloud Core: DISCONNECTED! ❌ ", "background: #450a0a; color: #f87171; font-weight: bold; padding: 4px; border-radius: 4px;");
    console.info("%c تنبيه: يرجى إضافة SUPABASE_URL و SUPABASE_ANON_KEY في إعدادات Netlify لكي يعمل التسجيل. ", "color: #94a3b8; font-style: italic;");
  }
}
