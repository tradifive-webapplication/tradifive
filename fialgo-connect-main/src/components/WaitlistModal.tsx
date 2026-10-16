import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

export interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setError("Please fill in both name and email fields.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('waitlist').insert({
        name,
        email,
        feedback: feedback || null,
        status: 'pending'
      });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Waitlist error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (success) {
      setTimeout(() => {
        const myCanvas = document.createElement('canvas');
        myCanvas.style.position = 'fixed';
        myCanvas.style.inset = '0';
        myCanvas.style.width = '100vw';
        myCanvas.style.height = '100vh';
        myCanvas.style.zIndex = '9999999';
        myCanvas.style.pointerEvents = 'none';
        document.body.appendChild(myCanvas);

        const customConfetti = confetti.create(myCanvas, {
          resize: true,
          useWorker: false
        });

        customConfetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#6366f1', '#a855f7', '#10b981', '#3b82f6', '#ffffff']
        }).then(() => {
          if (myCanvas.parentNode) {
            myCanvas.parentNode.removeChild(myCanvas);
          }
        });
      }, 1000);
      setSuccess(false);
      setName("");
      setEmail("");
      setFeedback("");
    }
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      zIndex: 999999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }} onClick={handleClose}>
      <motion.div
        className="waitlist-card"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, cubicBezier: [0.16, 1, 0.3, 1] }}
        style={{
          background: "linear-gradient(180deg, rgba(99, 102, 241, 0.04) 0%, rgba(5, 5, 8, 0.98) 100%)",
          border: "2px solid rgba(99, 102, 241, 0.4)",
          borderRadius: 32,
          padding: "56px 32px 40px",
          width: "100%",
          maxWidth: 460,
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9), inset 0 1px 1px rgba(255, 255, 255, 0.05)",
          overflow: "hidden"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Glassy Badge at Full Corner */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          padding: "8px 16px",
          background: "#171717",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          color: "#818cf8",
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: 1.5,
          textTransform: "uppercase",
          borderRadius: "0 0 20px 0",
          zIndex: 20,
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
        }}>
          Early Access
        </div>
        {/* Decorative background glow */}
        <div style={{
          position: "absolute",
          top: "-30%",
          left: "-30%",
          width: "80%",
          height: "80%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
          zIndex: 0,
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-30%",
          right: "-30%",
          width: "80%",
          height: "80%",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)",
          zIndex: 0,
          pointerEvents: "none"
        }} />

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            background: "#171717",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            color: "rgba(255, 255, 255, 0.5)",
            cursor: "pointer",
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
          }}
        >
          <X size={16} />
        </button>

        <div style={{ position: "relative", zIndex: 1 }}>
          {!success ? (
            <>
              {/* Badge */}
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                padding: "4px 12px",
                borderRadius: 100,
                marginBottom: 20
              }}>
                <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: "#818cf8", letterSpacing: 0.5, textTransform: "uppercase" }}>WAITLIST OPEN</span>
              </div>

              {/* Title & Desc */}
              <h3 style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                marginBottom: 10
              }}>
                Join the <span style={{ background: "linear-gradient(to right, #6366f1, #a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tradifive</span> Waitlist
              </h3>
              <p style={{
                fontSize: 14,
                color: "rgba(255, 255, 255, 0.5)",
                lineHeight: 1.5,
                marginBottom: 28
              }}>
                Sign up to get early access to institutional-grade risk management and community trading features.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label htmlFor="waitlist-name" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>FULL NAME</label>
                  <input
                    id="waitlist-name"
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "#171717",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                      transition: "all 0.25s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1";
                      e.target.style.background = "rgba(255, 255, 255, 0.04)";
                      e.target.style.boxShadow = "0 0 15px rgba(99, 102, 241, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.target.style.background = "rgba(255, 255, 255, 0.02)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="waitlist-email" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>EMAIL ADDRESS</label>
                  <input
                    id="waitlist-email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "#171717",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                      transition: "all 0.25s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1";
                      e.target.style.background = "rgba(255, 255, 255, 0.04)";
                      e.target.style.boxShadow = "0 0 15px rgba(99, 102, 241, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.target.style.background = "rgba(255, 255, 255, 0.02)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="waitlist-feedback" style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>WHAT FEATURES ARE YOU MOST EXCITED ABOUT? (OPTIONAL)</label>
                  <textarea
                    id="waitlist-feedback"
                    placeholder="AI coaching, drawdown protection, community feed..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "14px 16px",
                      background: "#171717",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 14,
                      outline: "none",
                      resize: "none",
                      fontFamily: "inherit",
                      transition: "all 0.25s",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#6366f1";
                      e.target.style.background = "rgba(255, 255, 255, 0.04)";
                      e.target.style.boxShadow = "0 0 15px rgba(99, 102, 241, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.target.style.background = "rgba(255, 255, 255, 0.02)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {error && (
                  <div style={{ color: "#f43f5e", fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                    <span>⚠️</span> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 100,
                    border: "none",
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    color: "#60a5fa",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginTop: 10,
                    transition: "all 0.2s ease",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.3)",
                    outline: "none"
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.background = "linear-gradient(135deg, #253347 0%, #131c33 100%)";
                      e.currentTarget.style.color = "#93c5fd";
                      e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.background = "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)";
                    e.currentTarget.style.color = "#60a5fa";
                    e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 2px 6px rgba(0, 0, 0, 0.3)";
                  }}
                >
                  {loading ? (
                    <div style={{
                      width: 18,
                      height: 18,
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite"
                    }} />
                  ) : (
                    "Request Early Access →"
                  )}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.1)",
                border: "2px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px"
              }}>
                <CheckCircle2 size={36} color="#10b981" />
              </div>
              <h3 style={{ fontSize: 26, fontWeight: 900, color: "#fff", marginBottom: 12 }}>You're on the list! 🎉</h3>
              <p style={{ fontSize: 14, color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6, marginBottom: 28 }}>
                Thank you, {name}! We've saved your spot. We'll send your invite link to <strong style={{ color: "#fff" }}>{email}</strong> as soon as the platform launches.
              </p>
              <button
                onClick={handleClose}
                style={{
                  padding: "12px 28px",
                  borderRadius: 100,
                  border: "none",
                  background: "#171717",
                  color: "rgba(255, 255, 255, 0.9)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.2)",
                  transition: "all 0.2s ease",
                  outline: "none"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.background = "#1e1e1e";
                  e.currentTarget.style.color = "#ffffff";
                  e.currentTarget.style.boxShadow = "inset 0 1px 0 0 rgba(255, 255, 255, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.18), 0 2px 4px rgba(0, 0, 0, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.background = "#171717";
                  e.currentTarget.style.color = "rgba(255, 255, 255, 0.9)";
                  e.currentTarget.style.boxShadow = "inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.12), 0 2px 4px rgba(0, 0, 0, 0.2)";
                }}
              >
                Close Window
              </button>
            </div>
          )}
        </div>

        {/* Global spinner animation styling */}
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.div>
    </div>
  );
}
