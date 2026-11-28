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
    a: "You can send an email to support@tradifive.in or use the contact form on our contact page. We typically respond to all support tickets and technical issues within 24 hours.",
  },
  {
    q: "Is my data safe and secure?",
    a: "Absolutely. All API keys and account details are fully encrypted before storage. We utilize institutional-grade AES-256 encryption protocols and follow strict privacy boundaries.",
  },
];

export function PublicFAQ({
  faqs = defaultFaqs,
  lightMode = false,
}: {
  faqs?: { q: string; a: string }[];
  lightMode?: boolean;
}) {
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
        <h2
          style={{
            fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(26px, 4vw, 38px)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            marginBottom: 12,
            color: lightMode ? "#0F172A" : "#fff",
          }}
        >
          Frequently Asked{" "}
          <span style={{ fontWeight: 300, color: lightMode ? "#64748B" : "rgba(255,255,255,0.65)" }}>
            Questions
          </span>
        </h2>
        <p style={{ color: lightMode ? "#64748B" : "rgba(255,255,255,0.45)", fontSize: 15 }}>
          Everything you need to know about the TradiFive terminal.
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
                background: lightMode
                  ? isOpen ? "#F8FAFC" : "#FFFFFF"
                  : "#171717",
                border: lightMode
                  ? isOpen ? "1px solid #BFDBFE" : "1px solid #E2E8F0"
                  : "none",
                boxShadow: lightMode
                  ? isOpen
                    ? "0 8px 24px -10px rgba(37,99,235,0.14)"
                    : "0 2px 8px rgba(15,23,42,0.03)"
                  : "inset 0 1px 0 0 rgba(255,255,255,0.05), 0 0 0 1px rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.2)",
                borderRadius: 20,
                overflow: "hidden",
                transition: "box-shadow 0.25s ease, border-color 0.25s ease",
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
                  color: lightMode ? "#0F172A" : "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  textAlign: "left",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <span>{faq.q}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown size={18} style={{ color: lightMode ? "#64748B" : "rgba(255,255,255,0.5)" }} />
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
                    <div
                      style={{
                        padding: "0 24px 20px",
                        fontSize: 14,
                        color: lightMode ? "#475569" : "rgba(255,255,255,0.55)",
                        lineHeight: 1.65,
                        borderTop: lightMode ? "1px solid #E2E8F0" : "1px solid rgba(255,255,255,0.05)",
                        marginTop: -4,
                        paddingTop: 16,
                      }}
                    >
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
