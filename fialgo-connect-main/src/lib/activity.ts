import { supabase } from "./supabase";

export type ActivityEvent = 'LOGIN' | 'LOGOUT' | 'SWITCH_ON' | 'SWITCH_OFF' | 'STRATEGY_CHANGE';

export async function recordUserActivity(eventType: ActivityEvent, description?: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optional: Get IP address (using a free public API for browser-side IP detection)
    let ip_address = 'Unknown';
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        ip_address = ipData.ip;
    } catch(e) {
        console.warn("IP tracking blocked or failed.");
    }

    await supabase.from("user_activity_logs").insert([{
      user_id: user.id,
      event_type: eventType,
      description: description || `User performed ${eventType.toLowerCase().replace('_', ' ')}`,
      ip_address: ip_address
    }]);
  } catch (err) {
    console.error("Failed to record activity:", err);
  }
}
