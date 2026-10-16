import { supabase } from "./supabase";
import { createNotification } from "./notifications";

export type AuditActionType =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "APPROVE"
  | "REJECT"
  | "FREEZE"
  | "UNFREEZE"
  | "LOGIN"
  | "SETTINGS_CHANGE"
  | "SYSTEM_COMMAND";

export interface AuditLogOptions {
  adminId: string;
  action: AuditActionType;
  targetId?: string; // ID of the user, ticket, or entity being acted upon
  targetType: string; // 'user', 'ticket', 'payout', 'setting', etc.
  details: string; // Human-readable description
  metadata?: any; // JSON metadata
  notifyTargetUser?: boolean; // If true, automatically sends a notification to the target user
}

export async function logAdminAction(options: AuditLogOptions) {
  try {
    // 1. Insert the log into the admin_audit_logs table
    const { error } = await supabase.from("admin_audit_logs").insert({
      admin_id: options.adminId,
      action: options.action,
      target_id: options.targetId,
      target_type: options.targetType,
      details: { text: options.details, level: "info" },
      metadata: options.metadata || {},
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error("Failed to write audit log:", error);
    }

    // 2. Optionally notify the user
    if (options.notifyTargetUser && options.targetId) {
      let title = "Account Notice";
      if (options.action === "APPROVE") title = "Request Approved";
      if (options.action === "REJECT") title = "Request Rejected";
      if (options.action === "FREEZE") title = "Account Frozen";

      await createNotification({
        userId: options.targetId,
        type: "SYSTEM",
        title: title,
        message: options.details,
        priority: "high"
      });
    }

    return { success: !error };
  } catch (err) {
    console.error("Audit Logging Error:", err);
    return { success: false };
  }
}
