import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

// Fade up animation helper
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  };
}

const defaultFaqs = [
  {
    q: "How do I connect my broker?",
    a: "Tradifive integrates with Indian brokers (Zerodha, Dhan, Upstox, Angel One) and MT5 directly. In your user settings panel, choose the 'Broker & Integrations' tab, enter your broker details, and sync your credentials to import executions instantly.",
  },
  {
    q: "How do I upgrade to Pro?",
    a: "You can navigate to Settings > Billing & Plans, select the Pro plan, and complete checkout through our secure Stripe billing portal. The upgraded daily AI credit limits and features will apply immediately.",
  },
  {
    q: "How does Risk Guard work?",
    a: "Risk Guard is our autonomous protection engine. It monitors open positions, drawdowns, and leverage limits. If configured thresholds are breached, it alerts you or takes defensive actions to preserve capital.",
  },
  {
    q: "How do I contact support?",
    a: "You can send an email to support@tradifive.com or use the contact form on our contact page. We typically respond to all support tickets and technical issues within 24 hours.",
  },
  {
    q: "Is my data safe and secure?",
    a: "Absolutely. All API keys and account details are fully encrypted before storage. We utilize institutional-grade AES-256 encryption protocols and follow strict privacy boundaries.",
  },
];

export function PublicFAQ({ faqs = defaultFaqs }: { faqs?: { q: string; a: string }[] }) {
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({});

  const toggleFaq = (index: number) => {
    setOpenFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section style={{ padding: "60px 24px 80px", maxWidth: 840, margin: "0 auto", position: "relative", zIndex: 10 }}>
      <motion.div {...fadeUp()} style={{ textAlign: "center", marginBottom: 48 }}>
        <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12, color: "#fff" }}>
          Frequently Asked Questions
        </h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15 }}>
          Everything you need to know about the Tradifive terminal.
        </p>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {faqs.map((faq, idx) => {
          const isOpen = !!openFaqs[idx];
          return (
            <motion.div
              key={idx}
              {...fadeUp(idx * 0.05)}
              style={{
                background: "rgba(255,255,255,0.015)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 16,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
              }}
            >
              <button
                onClick={() => toggleFaq(idx)}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "none",
                  border: "none",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  textAlign: "left",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <span>{faq.q}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown size={18} style={{ color: "rgba(255,255,255,0.5)" }} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div style={{
                      padding: "0 24px 20px",
                      fontSize: 13.5,
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.6,
                      borderTop: "1px solid rgba(255,255,255,0.02)",
                      marginTop: -4,
                      paddingTop: 16,
                    }}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
