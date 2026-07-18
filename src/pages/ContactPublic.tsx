import React, { useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Headset, Handshake, Briefcase, MessageSquare, Lock, Zap, Globe, Shield, ChevronDown, Send, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import StarsBackground from "@/components/StarsBackground";
import { PublicFAQ } from "@/components/PublicFAQ";

// Fade up animation helper
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  };
}

// Custom Premium SVG Icons for Socials
const SOCIAL_ICONS = {
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  telegram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  whatsapp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  x: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z"></path>
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path>
    </svg>
  ),
  linkedin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
    </svg>
  ),
  youtube: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
    </svg>
  ),
};

export default function ContactPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !category || !message) {
      toast.error("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message sent successfully! We will get back to you shortly.");
      setName("");
      setEmail("");
      setSubject("");
      setCategory("");
      setMessage("");
    }, 1200);
  };

  const contactCards = [
    {
      title: "Support",
      icon: <Headset size={24} />,
      desc: "Need help with your account or platform features?",
      email: "support@tradifive.com",
      smallText: "Response within 24 hours",
      color: "#ffffff",
    },
    {
      title: "Partnerships",
      icon: <Handshake size={24} />,
      desc: "Interested in collaborating with Tradifive?",
      email: "partnerships@tradifive.com",
      color: "#10b981",
    },
    {
      title: "Business & Media",
      icon: <Briefcase size={24} />,
      desc: "Press, media, and business inquiries.",
      email: "business@tradifive.com",
      color: "#f59e0b",
    },
    {
      title: "General Enquiries",
      icon: <MessageSquare size={24} />,
      desc: "Have a question? Reach out to us anytime.",
      email: "hello@tradifive.com",
      color: "#a855f7",
    },
  ];

  const socialLinks = [
    { name: "Instagram", url: "#", icon: SOCIAL_ICONS.instagram, color: "#ffffff" },
    { name: "Telegram", url: "#", icon: SOCIAL_ICONS.telegram, color: "#ffffff" },
    { name: "X (Twitter)", url: "#", icon: SOCIAL_ICONS.x, color: "#ffffff" },
    { name: "LinkedIn", url: "#", icon: SOCIAL_ICONS.linkedin, color: "#ffffff" },
    { name: "YouTube", url: "#", icon: SOCIAL_ICONS.youtube, color: "#ffffff" },
  ];

  const faqs = [
    {
      q: "How do I connect my broker?",
      a: "Tradifive integrates with your MT5 terminal directly. In your user settings panel, choose the 'Broker & Integrations' tab, enter your MT5 trading server details, and sync your credentials to import executions instantly.",
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
      a: "You can send an email to support@tradifive.com or complete the contact form on this page. We typically respond to all support tickets and technical issues within 24 hours.",
    },
    {
      q: "Is my data safe and secure?",
      a: "Absolutely. All API keys and account details are fully encrypted before storage. We utilize institutional-grade AES-256 encryption protocols and follow strict privacy boundaries.",
    },
    {
      q: "How long does support take to respond?",
      a: "Our customer operations team is active 24/7. While most tickets are answered in under 2 hours, we guarantee a comprehensive response to all queries in less than 24 hours.",
    },
  ];

  const trustBadges = [
    { icon: <Lock size={20} color="#ffffff" />, title: "Secure Platform", desc: "Your data is encrypted and protected." },
    { icon: <Zap size={20} color="#10b981" />, title: "Fast Support", desc: "Quick responses from our team." },
    { icon: <Globe size={20} color="#f59e0b" />, title: "Global Community", desc: "Join traders worldwide." },
    { icon: <Shield size={20} color="#a855f7" />, title: "Privacy First", desc: "We respect and protect your privacy." },
  ];

  return (
    <div style={{ background: "#02040a", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        
        .contact-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .contact-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 32px;
          max-width: 1200px;
          margin: 64px auto;
        }

        .trust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 1200px;
          margin: 64px auto 0;
        }

        .custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
        }

        .social-row-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        }

        .form-row-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .contact-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s, background-color 0.2s;
          font-family: 'Inter', sans-serif;
        }

        .contact-input::placeholder { color: rgba(255,255,255,0.25); }
        .contact-input:focus { border-color: #6366f1; background: rgba(255,255,255,0.05); }

        @media (max-width: 1024px) {
          .contact-layout { grid-template-columns: 1fr !important; gap: 24px !important; }
          .contact-grid { grid-template-columns: repeat(2, 1fr); }
          .trust-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .contact-grid { grid-template-columns: 1fr 1fr !important; gap: 14px !important; }
          .trust-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .form-row-2col { grid-template-columns: 1fr !important; gap: 16px !important; }
          .contact-form-panel { padding: 28px 20px !important; }
          .contact-social-panel { padding: 28px 20px !important; }
          .contact-hero { padding: 120px 20px 40px !important; }
          .contact-cards-section { padding: 0 16px 32px !important; }
          .contact-form-section { padding: 0 16px !important; }
          .contact-form-section .contact-layout { margin: 32px auto !important; }
          .contact-faq-section { padding: 48px 16px 60px !important; }
          .contact-faq-section .trust-grid { margin: 40px auto 0 !important; }
        }

        @media (max-width: 480px) {
          .contact-grid { grid-template-columns: 1fr !important; }
          .trust-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <PublicNavbar onSignIn={handleStart} onSignUp={handleStart} onDownloadClick={() => navigate("/download")} />
      <StarsBackground />

      <main style={{ position: "relative", zIndex: 1 }}>
      {/* HERO SECTION */}
      <section className="contact-hero" style={{ padding: "160px 24px 60px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 900, height: 600, background: "radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 65%)", pointerEvents: "none" }} />

        <motion.div {...fadeUp()} style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 20 }}>
            Get in{" "}
            <span style={{ color: "#a1a1aa" }}>
              Touch
            </span>
          </h1>
          <p style={{ fontSize: "clamp(15px, 2vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 640, margin: "0 auto" }}>
            Have questions about Tradifive? We're here to help with support, partnerships, business inquiries, and general questions.
          </p>
        </motion.div>
      </section>

      {/* CONTACT CARDS */}
      <section className="contact-cards-section" style={{ padding: "0 24px 40px", position: "relative", zIndex: 2 }}>
        <div className="contact-grid">
          {contactCards.map((card, idx) => (
            <motion.div
              key={idx}
              {...fadeUp(idx * 0.08)}
              whileHover={{ y: -6 }}
              style={{
                background: "linear-gradient(to bottom, #1C1C1E, #121214)",
                borderRadius: 20,
                padding: "32px 24px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 7px -5px rgba(0,0,0,0.3), 0 0 0 1px #2B2B2F",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 15px -5px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 7px -5px rgba(0,0,0,0.3), 0 0 0 1px #2B2B2F";
              }}
            >
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: `${card.color}15`,
                border: `1px solid ${card.color}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: card.color,
                marginBottom: 24,
              }}>
                {card.icon}
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{card.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 20, flexGrow: 1 }}>
                {card.desc}
              </p>

              <a
                href={`mailto:${card.email}`}
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  textDecoration: "none",
                  transition: "color 0.2s",
                  borderBottom: "1px solid rgba(255,255,255,0.2)",
                  paddingBottom: 2,
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#ffffff"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#fff"}
              >
                {card.email}
              </a>

              {card.smallText && (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 12 }}>
                  {card.smallText}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* CONTACT FORM & SOCIALS SECTION */}
      <section className="contact-form-section" style={{ padding: "40px 24px", position: "relative", zIndex: 2 }}>
        <div className="contact-layout">
          {/* Left Column: Form */}
          <motion.div
            {...fadeUp(0.1)}
            className="contact-form-panel"
            style={{
              background: "rgba(255,255,255,0.015)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: 24,
              padding: "40px 32px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
              width: "100%",
            }}
          >
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 28, letterSpacing: "-0.02em" }}>Send Us a Message</h2>

            <form onSubmit={handleFormSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="form-row-2col">
                {/* Full Name */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="contact-input"
                  />
                </div>

                {/* Email Address */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="contact-input"
                  />
                </div>
              </div>

              <div className="form-row-2col">
                {/* Subject */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="How can we help?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="contact-input"
                  />
                </div>

                {/* Category Dropdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>Category</label>
                  <select
                    required
                    className="custom-select contact-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ cursor: "pointer" }}
                  >
                    <option value="" disabled style={{ background: "#0c0d12", color: "#888" }}>Select a category</option>
                    <option value="Support" style={{ background: "#0c0d12" }}>Support</option>
                    <option value="Partnership" style={{ background: "#0c0d12" }}>Partnership</option>
                    <option value="Billing" style={{ background: "#0c0d12" }}>Billing</option>
                    <option value="Technical Issue" style={{ background: "#0c0d12" }}>Technical Issue</option>
                    <option value="General Enquiry" style={{ background: "#0c0d12" }}>General Enquiry</option>
                    <option value="Other" style={{ background: "#0c0d12" }}>Other</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>Message</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Your message details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="contact-input"
                  style={{ resize: "vertical", minHeight: 120 }}
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: "#ffffff",
                  color: "#000",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px",
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(255, 255, 255, 0.1)",
                  transition: "box-shadow 0.3s, background-color 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(255, 255, 255, 0.2)";
                  e.currentTarget.style.backgroundColor = "#f4f4f5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(255, 255, 255, 0.1)";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </motion.button>
            </form>
          </motion.div>

          {/* Right Column: Connect With Us */}
          <motion.div
            {...fadeUp(0.15)}
            className="contact-social-panel"
            style={{
              background: "linear-gradient(to bottom, #1C1C1E, #121214)",
              borderRadius: 24,
              padding: "40px 32px",
              boxShadow: "0 4px 7px -5px rgba(0,0,0,0.3), 0 0 0 1px #2B2B2F",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 28,
              transition: "box-shadow 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 8px 15px -5px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 7px -5px rgba(0,0,0,0.3), 0 0 0 1px #2B2B2F";
            }}
          >
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em" }}>Connect With Us</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}>
                Stay updated with Tradifive and join our community. Connect with us on your preferred platform.
              </p>
            </div>

            {/* Social Links List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  className="social-row-btn"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "14px 18px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.04)",
                    color: "#fff",
                    textDecoration: "none",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = social.color;
                    e.currentTarget.style.background = `${social.color}08`;
                    const iconWrap = e.currentTarget.querySelector('.social-icon-wrapper') as HTMLElement;
                    if (iconWrap) {
                      iconWrap.style.background = `${social.color}20`;
                      iconWrap.style.color = social.color;
                      iconWrap.style.borderColor = `${social.color}40`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.04)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                    const iconWrap = e.currentTarget.querySelector('.social-icon-wrapper') as HTMLElement;
                    if (iconWrap) {
                      iconWrap.style.background = "rgba(255,255,255,0.03)";
                      iconWrap.style.color = "rgba(255,255,255,0.6)";
                      iconWrap.style.borderColor = "rgba(255,255,255,0.05)";
                    }
                  }}
                >
                  <div
                    className="social-icon-wrapper"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(255,255,255,0.6)",
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                      flexShrink: 0,
                    }}
                  >
                    {social.icon}
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{social.name}</div>
                  </div>
                  <ArrowRight size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <PublicFAQ faqs={faqs} />

      {/* TRUST INDICATORS */}
      <section className="contact-faq-section" style={{ padding: "0 24px 80px", maxWidth: 840, margin: "0 auto", position: "relative" }}>
        <div className="trust-grid">
          {trustBadges.map((badge, idx) => (
            <motion.div
              key={idx}
              {...fadeUp(0.1 + idx * 0.05)}
              style={{
                background: "rgba(255,255,255,0.01)",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 16,
                padding: "24px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ marginBottom: 12 }}>{badge.icon}</div>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{badge.title}</h4>
              <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{badge.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
      </main>

      <PublicFooter />
    </div>
  );
}
