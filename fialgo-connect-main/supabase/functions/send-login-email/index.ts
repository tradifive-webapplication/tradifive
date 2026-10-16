import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─────────────────────────────────────────────
// HTML email template — premium "New sign-in" email
// Inspired by Google, Apple, and Stripe sign-in alerts
// ─────────────────────────────────────────────
function buildLoginEmailHtml(opts: {
  name: string;
  email: string;
  time: string;
  device: string;
  browser: string;
  ip: string;
  method: string;
  securityUrl: string;
}) {
  const { name, email, time, device, browser, ip, method, securityUrl } = opts;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New sign-in to Tradifive</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <div style="display:inline-block;background:#000;border-radius:14px;padding:10px 20px;">
                <span style="color:#fff;font-size:18px;font-weight:800;letter-spacing:-0.5px;">Tradifive</span>
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">

              <!-- Accent bar -->
              <div style="height:4px;background:linear-gradient(90deg,#1a1a2e,#16213e,#0f3460);"></div>

              <div style="padding:40px 44px;">

                <!-- Icon -->
                <div style="width:56px;height:56px;background:#f0f0f0;border-radius:16px;margin-bottom:24px;display:flex;align-items:center;justify-content:center;">
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/lock.svg" width="28" height="28" style="display:block;" alt="" />
                </div>

                <!-- Heading -->
                <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0a0a0a;letter-spacing:-0.5px;">
                  New sign-in to your account
                </h1>
                <p style="margin:0 0 32px;font-size:15px;color:#6b7280;line-height:1.6;">
                  Hi ${name}, we noticed a new sign-in to your Tradifive account. If this was you, no action is needed.
                </p>

                <!-- Sign-in details box -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border-radius:14px;padding:0;margin-bottom:32px;">
                  <tr>
                    <td style="padding:24px 28px;">
                      <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;">Sign-in Details</p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                        <tr>
                          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-size:13px;color:#6b7280;width:100px;display:inline-block;">Date &amp; Time</span>
                            <span style="font-size:13px;color:#111827;font-weight:600;">${time}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-size:13px;color:#6b7280;width:100px;display:inline-block;">Method</span>
                            <span style="font-size:13px;color:#111827;font-weight:600;">${method}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-size:13px;color:#6b7280;width:100px;display:inline-block;">Device</span>
                            <span style="font-size:13px;color:#111827;font-weight:600;">${device}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">
                            <span style="font-size:13px;color:#6b7280;width:100px;display:inline-block;">Browser</span>
                            <span style="font-size:13px;color:#111827;font-weight:600;">${browser}</span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;">
                            <span style="font-size:13px;color:#6b7280;width:100px;display:inline-block;">IP Address</span>
                            <span style="font-size:13px;color:#111827;font-weight:600;">${ip}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>

                <!-- If NOT you warning -->
                <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px 22px;margin-bottom:32px;">
                  <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">
                    <strong>Not you?</strong> If you did not sign in to Tradifive, your account may be compromised. 
                    Secure your account immediately by resetting your password.
                  </p>
                </div>

                <!-- CTA Button -->
                <table cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                  <tr>
                    <td style="background:#0a0a0a;border-radius:12px;">
                      <a href="${securityUrl}" style="display:inline-block;padding:14px 28px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.2px;">
                        Secure My Account →
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Footer note -->
                <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.7;">
                  This security alert was sent to <strong>${email}</strong> because a new sign-in was detected.<br/>
                  If this was you, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                © 2026 Tradifive. All rights reserved.<br/>
                <a href="https://tradifive.in" style="color:#6b7280;text-decoration:none;">tradifive.in</a>
                &nbsp;·&nbsp;
                <a href="https://tradifive.in/settings" style="color:#6b7280;text-decoration:none;">Manage notifications</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────
// Parse User-Agent string into human-readable device/browser
// ─────────────────────────────────────────────
function parseUserAgent(ua: string): { device: string; browser: string } {
  let browser = "Unknown Browser";
  let device = "Unknown Device";

  if (ua.includes("Chrome") && !ua.includes("Chromium") && !ua.includes("Edg")) {
    browser = "Google Chrome";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser = "Safari";
  } else if (ua.includes("Firefox")) {
    browser = "Mozilla Firefox";
  } else if (ua.includes("Edg")) {
    browser = "Microsoft Edge";
  } else if (ua.includes("Opera") || ua.includes("OPR")) {
    browser = "Opera";
  }

  if (ua.includes("iPhone")) {
    device = "iPhone";
  } else if (ua.includes("iPad")) {
    device = "iPad";
  } else if (ua.includes("Android")) {
    device = ua.includes("Mobile") ? "Android Phone" : "Android Tablet";
  } else if (ua.includes("Macintosh")) {
    device = "Mac";
  } else if (ua.includes("Windows")) {
    device = "Windows PC";
  } else if (ua.includes("Linux")) {
    device = "Linux PC";
  }

  return { device, browser };
}

// ─────────────────────────────────────────────
// Edge Function entry point
// ─────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    // RESEND_API_KEY must be set in Supabase Edge Function secrets
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Authenticate the requesting user from the JWT
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse body for extra context
    const body = await req.json().catch(() => ({}));
    const { method = "Email & Password" } = body;

    // Get profile info
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("first_name, full_name, email")
      .eq("id", user.id)
      .single();

    const displayName = profile?.first_name || profile?.full_name?.split(" ")[0] || "there";
    const userEmail = profile?.email || user.email || "";

    if (!userEmail) {
      return new Response(JSON.stringify({ error: "No email for user" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse User-Agent
    const ua = req.headers.get("user-agent") ?? "";
    const { device, browser } = parseUserAgent(ua);

    // Format timestamp
    const now = new Date();
    const timeStr = now.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    });

    // Get IP from headers
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "Unknown";

    const emailHtml = buildLoginEmailHtml({
      name: displayName,
      email: userEmail,
      time: timeStr,
      device,
      browser,
      ip,
      method,
      securityUrl: `${Deno.env.get("SITE_URL") || "https://tradifive.in"}/settings`,
    });

    // Send via Resend (https://resend.com — free 3,000 emails/month)
    // If no RESEND_API_KEY is set, fall back to Supabase's built-in email
    let emailSent = false;

    if (resendApiKey) {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // NOTE: If you haven't verified tradifive.in in Resend yet,
          // you MUST change this 'from' address to "onboarding@resend.dev"
          // AND you can only send emails to your own registered Resend email address.
          from: "Tradifive Security <security@tradifive.in>",
          to: [userEmail],
          subject: "New sign-in to your Tradifive account",
          html: emailHtml,
        }),
      });

      emailSent = resendRes.ok;
      
      if (!resendRes.ok) {
        const errorText = await resendRes.text();
        console.error("Resend API Error:", resendRes.status, errorText);
      } else {
        console.log("Login email sent successfully via Resend to", userEmail);
      }
    }

    // Log the login event in audit_logs
    await supabaseAdmin.from("audit_logs").insert([{
      actor_id: user.id,
      actor_email: userEmail,
      action: "LOGIN",
      resource_type: "session",
      details: { method, device, browser, ip },
      ip_address: ip,
      severity: "info",
    }]).catch(() => {/* non-critical */});

    return new Response(
      JSON.stringify({ success: true, emailSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("send-login-email error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
