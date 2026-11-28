import React, { useEffect, useState } from "react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import {
  Headset,
  Handshake,
  Briefcase,
  MessageSquare,
  Lock,
  Zap,
  Globe,
  Shield,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { PublicFAQ } from "@/components/PublicFAQ";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SOCIAL_ICONS = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  telegram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  x: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  ),
};

export default function ContactPublic() {
  const navigate = useNavigate();
  const handleStart = () => navigate("/login", { state: { mode: "signup" } });
  const handleSignIn = () => navigate("/login", { state: { mode: "login" } });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#0F172A";
  }, []);

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
    }, 900);
  };

  const contactCards = [
    {
      title: "Support",
      icon: Headset,
      desc: "Need help with broker sync, Risk Guard, or your workspace?",
      email: "support@tradifive.in",
      smallText: "Response within 24 hours",
      badgeStyle: "bg-blue-50 border-blue-200 text-[#2563EB]",
    },
    {
      title: "Partnerships",
      icon: Handshake,
      desc: "Interested in prop firm or creator collaborations?",
      email: "partnerships@tradifive.in",
      badgeStyle: "bg-emerald-50 border-emerald-200 text-emerald-600",
    },
    {
      title: "Business & Media",
      icon: Briefcase,
      desc: "Press, institutional desk inquiries, and sponsorships.",
      email: "business@tradifive.in",
      badgeStyle: "bg-amber-50 border-amber-200 text-amber-600",
    },
    {
      title: "General Enquiries",
      icon: MessageSquare,
      desc: "Have a general question? Reach out anytime.",
      email: "hello@tradifive.in",
      badgeStyle: "bg-violet-50 border-violet-200 text-violet-600",
    },
  ];

  const socialLinks = [
    { name: "Instagram", url: "#", icon: SOCIAL_ICONS.instagram },
    { name: "Telegram", url: "#", icon: SOCIAL_ICONS.telegram },
    { name: "X (Twitter)", url: "#", icon: SOCIAL_ICONS.x },
    { name: "LinkedIn", url: "#", icon: SOCIAL_ICONS.linkedin },
    { name: "YouTube", url: "#", icon: SOCIAL_ICONS.youtube },
  ];

  const trustBadges = [
    { icon: Lock, color: "text-[#2563EB]", bg: "bg-blue-50 border-blue-200", title: "Secure Platform", desc: "End-to-end encrypted data protection." },
    { icon: Zap, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", title: "Fast Support", desc: "Direct engineer & operations replies." },
    { icon: Globe, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", title: "Global Network", desc: "Supporting traders in 47+ countries." },
    { icon: Shield, color: "text-violet-600", bg: "bg-violet-50 border-violet-200", title: "Privacy First", desc: "We never sell or expose your history." },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      <PublicNavbar
        alwaysLight
        onSignIn={handleSignIn}
        onSignUp={handleStart}
        onDownloadClick={() => navigate("/download")}
      />

      <main>
        {/* HERO */}
        <section className="pt-28 sm:pt-36 pb-12 px-4 sm:px-7 text-center">
          <div className="max-w-[740px] mx-auto">
            <h1
              style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
              className="text-[36px] sm:text-[54px] tracking-[-0.035em] leading-[1.08] text-slate-900 mb-4"
            >
              <span className="font-bold">Get in </span>
              <span className="font-extralight text-slate-500">touch.</span>
            </h1>
            <p className="text-[15.5px] sm:text-[17px] font-light text-slate-500 leading-relaxed max-w-[560px] mx-auto">
              Questions about TradiFive workspaces, prop firm integrations, partnerships, or support? Our team is here.
            </p>
          </div>
        </section>

        {/* DEPARTMENT CARDS */}
        <section className="px-4 sm:px-7 pb-10">
          <div className="max-w-[1160px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05, ease: EASE }}
                  className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs flex flex-col items-center text-center"
                >
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${card.badgeStyle}`}
                  >
                    <Icon size={20} />
                  </div>
                  <h3 className="text-[16px] font-bold text-slate-900 mb-2">
                    {card.title}
                  </h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-4 flex-1">
                    {card.desc}
                  </p>
                  <a
                    href={`mailto:${card.email}`}
                    className="text-[13.5px] font-semibold text-[#2563EB] hover:underline border-b border-blue-200 pb-0.5"
                  >
                    {card.email}
                  </a>
                  {card.smallText && (
                    <span className="text-[11px] text-slate-400 mt-2.5">
                      {card.smallText}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* CONTACT FORM + CONNECT */}
        <section className="px-4 sm:px-7 py-10">
          <div className="max-w-[1160px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-7">
            <div className="lg:col-span-7 rounded-[24px] bg-[#F8FAFC] border border-slate-200/90 p-6 sm:p-9 shadow-2xs">
              <h2
                style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                className="text-[24px] font-bold tracking-tight text-slate-900 mb-6"
              >
                Send us a message
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="How can we help?"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Category
                    </label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-[14px] text-slate-900 focus:outline-none focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      <option value="Support">Support</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Billing">Billing</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="General Enquiry">General Enquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Share your message details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="tactile-blue-pill w-full h-12 rounded-full text-[14px] font-bold cursor-pointer"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 rounded-[24px] bg-white border border-slate-200/90 p-6 sm:p-9 shadow-2xs flex flex-col justify-between gap-6">
              <div>
                <h2
                  style={{ fontFamily: "'Manrope', 'Plus Jakarta Sans', sans-serif" }}
                  className="text-[24px] font-bold tracking-tight text-slate-900 mb-2"
                >
                  Connect with us
                </h2>
                <p className="text-[14px] text-slate-500 leading-relaxed mb-6">
                  Stay updated with TradiFive feature releases and join our trading network across platforms.
                </p>

                <div className="space-y-3">
                  {socialLinks.map((soc) => (
                    <a
                      key={soc.name}
                      href={soc.url}
                      className="flex items-center justify-between px-4 py-3 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 text-slate-800 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-[#2563EB]">
                          {soc.icon}
                        </div>
                        <span className="text-[14px] font-semibold">{soc.name}</span>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-[#2563EB]" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <PublicFAQ lightMode />

        {/* TRUST ROW */}
        <section className="px-4 sm:px-7 pb-20">
          <div className="max-w-[960px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="rounded-2xl bg-white border border-slate-200/90 p-5 text-center shadow-2xs"
                >
                  <div
                    className={`w-10 h-10 rounded-xl border mx-auto mb-3 flex items-center justify-center ${b.bg} ${b.color}`}
                  >
                    <Icon size={18} />
                  </div>
                  <h4 className="text-[13.5px] font-bold text-slate-900 mb-1">
                    {b.title}
                  </h4>
                  <p className="text-[12px] text-slate-500">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <PublicFooter lightMode />
    </div>
  );
}
