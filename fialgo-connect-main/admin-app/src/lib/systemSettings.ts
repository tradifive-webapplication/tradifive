import { supabase } from "../lib/supabase";

export const SYSTEM_SETTING_IDS: Record<string, string> = {
  ib_transfer_requests: "11111111-1111-4111-8111-111111111111",
  license_payment_requests: "22222222-2222-4222-8222-222222222222",
  auto_trade_admin_records: "33333333-3333-4333-8333-333333333333",
  mt5_telemetry_live: "44444444-4444-4444-8444-444444444444",
  auto_trade_admin_broadcast: "55555555-5555-4555-8555-555555555555",
  auto_trade_withdrawal_requests: "66666666-6666-4666-8666-666666666666",
  maintenance_mode: "77777777-7777-4777-8777-777777777777",
  kill_switch: "88888888-8888-4888-8888-888888888888",
  global_settings: "99999999-9999-4999-8999-999999999999",
};

/**
 * Returns a stable UUID for any system setting key so Postgres UUID column doesn't error.
 */
export function getSystemSettingId(key: string): string {
  if (SYSTEM_SETTING_IDS[key]) return SYSTEM_SETTING_IDS[key];
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) {
    return key;
  }
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `00000000-0000-4000-8000-${hex.repeat(2).slice(0, 12)}`;
}

/**
 * Fetch a setting from public.system_settings using its deterministic UUID.
 */
export async function getSystemSetting<T = any>(key: string): Promise<T | null> {
  try {
    const id = getSystemSettingId(key);
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.warn(`[getSystemSetting] Failed to fetch "${key}":`, error.message);
      return null;
    }
    return (data?.value as T) ?? null;
  } catch (e) {
    console.warn(`[getSystemSetting] Exception for "${key}":`, e);
    return null;
  }
}

/**
 * Persist a setting into public.system_settings using its deterministic UUID.
 */
export async function setSystemSetting(key: string, value: any): Promise<boolean> {
  try {
    const id = getSystemSettingId(key);
    const { error } = await supabase.from("system_settings").upsert({
      id,
      value,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error(`[setSystemSetting] Failed to save "${key}":`, error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[setSystemSetting] Exception saving "${key}":`, e);
    return false;
  }
}
