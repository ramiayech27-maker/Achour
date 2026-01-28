
/**
 * إعدادات الربط بـ Supabase
 * يتم جلب هذه القيم من متغيرات البيئة التي قمنا بتعريفها في vite.config.ts
 */

// جلب القيم المحقونة من عملية البناء
const envUrl = process.env.SUPABASE_URL;
const envKey = process.env.SUPABASE_ANON_KEY;

// القيم الافتراضية للتنبيه (Fallback)
const placeholderUrl = "https://your-project-id.supabase.co";
const placeholderKey = "your-public-anon-key-here";

export const SUPABASE_URL = (envUrl && envUrl !== "undefined" && envUrl !== "") ? envUrl : placeholderUrl;
export const SUPABASE_ANON_KEY = (envKey && envKey !== "undefined" && envKey !== "") ? envKey : placeholderKey;

// نظام تشخيص الحالة للمستخدم في المتصفح
if (typeof window !== 'undefined') {
  const isConfigured = SUPABASE_URL !== placeholderUrl && SUPABASE_ANON_KEY !== placeholderKey;
  
  if (isConfigured) {
    console.log("%c [MineCloud] Cloud Core: Connected & Synced ✅ ", "background: #064e3b; color: #10b981; font-weight: bold; border-radius: 4px; padding: 2px 5px;");
  } else {
    console.warn("%c [MineCloud] Cloud Core: Waiting for Environment Variables... ⏳ ", "background: #451a03; color: #f59e0b; font-weight: bold; border-radius: 4px; padding: 2px 5px;");
    console.info("%c ملاحظة: إذا كان هذا الموقع منشوراً على Netlify، تأكد من إضافة SUPABASE_URL و SUPABASE_ANON_KEY في الإعدادات. ", "color: #94a3b8; font-style: italic;");
  }
}
