import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Tag,
  Smartphone,
  Mail,
  Brain,
  Cpu,
  Shield,
  BookOpen,
  Users,
  Radio,
  LayoutGrid,
} from "lucide-react";

interface PublicNavbarProps {
  onSignIn?: () => void;
  onSignUp?: () => void;
  onDownloadClick?: () => void;
  lightOnScroll?: boolean;
  alwaysLight?: boolean;
}

const PRODUCT_ITEMS = [
  {
    title: "Smart Trade Journal",
    desc: "Automated MT5 sync & 40+ edge metrics",
    path: "/features/smart-journal",
    icon: BookOpen,
    tint: "text-blue-600 bg-blue-50 border-blue-200/70",
    darkTint: "text-sky-400 bg-sky-500/10 border-sky-400/20",
  },
  {
    title: "Risk Guard",
    desc: "Daily drawdown kill-switch & lockouts",
    path: "/features/risk-guard",
    icon: Shield,
    tint: "text-emerald-700 bg-emerald-50 border-emerald-200/70",
    darkTint: "text-emerald-400 bg-emerald-500/10 border-emerald-400/20",
  },
  {
    title: "TradiFive AI",
    desc: "Behavioral session coaching & tilt audits",
    path: "/features/tradifive-ai",
    icon: Brain,
    tint: "text-indigo-600 bg-indigo-50 border-indigo-200/70",
    darkTint: "text-indigo-400 bg-indigo-500/10 border-indigo-400/20",
  },
  {
    title: "Auto Trade Engine",
    desc: "Rule-enforced MT5 execution workflows",
    path: "/features/auto-trade",
    icon: Cpu,
    tint: "text-sky-700 bg-sky-50 border-sky-200/70",
    darkTint: "text-cyan-400 bg-cyan-500/10 border-cyan-400/20",
  },
  {
    title: "Community Hub",
    desc: "Verified track records & competitions",
    path: "/features/community-hub",
    icon: Users,
    tint: "text-slate-700 bg-slate-100 border-slate-200",
    darkTint: "text-slate-300 bg-white/10 border-white/15",
  },
  {
    title: "Creator Channels",
    desc: "Broadcast desks & structured alerts",
    path: "/features/channels",
    icon: Radio,
    tint: "text-rose-600 bg-rose-50 border-rose-200/70",
    darkTint: "text-rose-400 bg-rose-500/10 border-rose-400/20",
  },
];

export default function PublicNavbar({
  onSignIn,
  onSignUp,
  onDownloadClick,
  lightOnScroll = false,
  alwaysLight = false,
}: PublicNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isProductRoute = location.pathname.startsWith("/features/");
  const isCommunityActive = location.pathname === "/features/community-hub";
  const isAiActive = location.pathname === "/features/tradifive-ai";
  const isAppActive = location.pathname === "/download";
  const isContactActive = location.pathname === "/contact";

  const [scrolled, setScrolled] = useState(false);
  const [inLightZone, setInLightZone] = useState(alwaysLight);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productMenuOpen, setProductMenuOpen] = useState(false);
  const [inDeepDives, setInDeepDives] = useState(false);
  const [isHoveredTop, setIsHoveredTop] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(true);
  const closeTimeoutRef = useRef<number | null>(null);

  const handleSignIn = () => {
    if (onSignIn) onSignIn();
    else navigate("/login", { state: { mode: "login" } });
  };
  const handleSignUp = onSignUp || (() => navigate("/login", { state: { mode: "signup" } }));
  void onDownloadClick;

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);

      if (alwaysLight) {
        setInLightZone(true);
      } else if (lightOnScroll) {
        const whiteAnchor = document.getElementById("hero-white-zone");
        if (whiteAnchor) {
          setInLightZone(whiteAnchor.getBoundingClientRect().top <= 84);
        } else {
          setInLightZone(y > 540);
        }
      } else {
        setInLightZone(false);
      }

      const deepDives = document.getElementById("deep-dives");
      const hideNavZone = document.getElementById("hide-nav-zone");

      let isActive = false;
      if (deepDives) {
        const rect = deepDives.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom > 0) isActive = true;
      }
      if (hideNavZone) {
        const rect = hideNavZone.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.7 && rect.bottom > 0) isActive = true;
      }
      setInDeepDives(isActive);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [alwaysLight, lightOnScroll]);

  useEffect(() => {
    const timer = setTimeout(() => {
      import("../pages/Login").catch(() => {});
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  const handleLogoClick = () => {
    setProductMenuOpen(false);
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    setProductMenuOpen(false);
    if (isHome) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 96;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      setMobileMenuOpen(false);
    }
  };

  const openMenu = () => {
    if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    setProductMenuOpen(true);
  };

  const scheduleCloseMenu = () => {
    if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = window.setTimeout(() => setProductMenuOpen(false), 140);
  };

  const hidden = inDeepDives && !isHoveredTop && !mobileMenuOpen;

  const navLinkClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-150 ${
      inLightZone
        ? active
          ? "text-[#2563EB] bg-blue-50/70"
          : "text-slate-600 hover:text-slate-950 hover:bg-slate-100/80"
        : active
        ? "text-white bg-white/12"
        : "text-slate-300 hover:text-white hover:bg-white/[0.08]"
    }`;

  return (
    <>
      {inDeepDives && !mobileMenuOpen && (
        <div
          className="fixed top-0 left-0 right-0 h-5 z-[999]"
          onMouseEnter={() => setIsHoveredTop(true)}
        />
      )}

      {/* Outer fixed wrapper creates smooth full-bleed top bar -> centered capsule transition */}
      <div
        onMouseEnter={() => setIsHoveredTop(true)}
        onMouseLeave={() => {
          setIsHoveredTop(false);
          scheduleCloseMenu();
        }}
        className={`fixed inset-x-0 z-[1000] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          scrolled ? "lg:pt-3 lg:px-4" : "lg:pt-0 lg:px-0"
        } ${hidden ? "-translate-y-[120%]" : "translate-y-0"}`}
        style={{ top: 0 }}
      >
        <nav
          className={`mx-auto transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            scrolled
              ? "max-w-[1140px] lg:rounded-full"
              : "max-w-full lg:rounded-none"
          } ${
            inLightZone
              ? scrolled
                ? "bg-white/92 backdrop-blur-xl border-b lg:border border-[#E4E4E4] shadow-[0_8px_28px_-10px_rgba(15,23,42,0.1)]"
                : "bg-white/88 backdrop-blur-xl border-b border-[#E4E4E4]"
              : scrolled
              ? "bg-[#060A15]/82 backdrop-blur-xl border-b lg:border border-white/[0.12] shadow-[0_14px_34px_-10px_rgba(2,6,23,0.6)]"
              : "bg-[#02050E]/45 backdrop-blur-md border-b border-white/[0.07]"
          }`}
        >
          <div className="max-w-[1220px] mx-auto h-[60px] lg:h-[62px] px-4 sm:px-6 flex items-center justify-between gap-4">
            {/* Left: Brand Lockup */}
            <button
              type="button"
              onClick={handleLogoClick}
              className="flex items-center gap-2 shrink-0 cursor-pointer focus:outline-none"
            >
              {inLightZone ? (
                <img
                  src="/Tradifive_logo1.png"
                  alt="TradiFive"
                  className="h-[25px] w-auto object-contain"
                />
              ) : (
                <>
                  <img
                    src="/Logo_only.png"
                    alt=""
                    className="h-[28px] lg:h-[30px] w-auto object-contain"
                  />
                  <img
                    src="/Dark mode logo with white.png"
                    alt="TradiFive"
                    className="h-[22px] lg:h-[25px] w-auto object-contain"
                  />
                </>
              )}
            </button>

            {/* Center: Clean Editorial Navigation with Product Dropdown */}
            <div className="hidden lg:flex items-center justify-center gap-1 whitespace-nowrap relative">
              <div
                className="relative"
                onMouseEnter={openMenu}
                onMouseLeave={scheduleCloseMenu}
              >
                <button
                  type="button"
                  onClick={() => setProductMenuOpen((prev) => !prev)}
                  className={`inline-flex items-center gap-1 cursor-pointer ${navLinkClass(
                    isProductRoute && !isAiActive && !isCommunityActive
                  )}`}
                >
                  <span>Platform</span>
                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    className={`transition-transform duration-200 ${
                      productMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {productMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                      onMouseEnter={openMenu}
                      onMouseLeave={scheduleCloseMenu}
                      className={`absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)] w-[540px] rounded-2xl p-3 border shadow-2xl ${
                        inLightZone
                          ? "bg-white border-[#E4E4E4] shadow-[0_18px_44px_-12px_rgba(15,23,42,0.16)]"
                          : "bg-[#0B1120]/95 backdrop-blur-2xl border-white/12 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.65)]"
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-1.5">
                        {PRODUCT_ITEMS.map((item) => {
                          const Icon = item.icon;
                          const active = location.pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setProductMenuOpen(false)}
                              className={`group flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                                inLightZone
                                  ? active
                                    ? "bg-slate-100"
                                    : "hover:bg-slate-50"
                                  : active
                                  ? "bg-white/10"
                                  : "hover:bg-white/[0.06]"
                              }`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${
                                  inLightZone ? item.tint : item.darkTint
                                }`}
                              >
                                <Icon size={15} strokeWidth={1.9} />
                              </div>
                              <div className="min-w-0">
                                <div
                                  className={`text-[13px] font-semibold leading-tight ${
                                    inLightZone ? "text-slate-900" : "text-white"
                                  }`}
                                >
                                  {item.title}
                                </div>
                                <div
                                  className={`text-[11.5px] leading-snug mt-0.5 line-clamp-1 ${
                                    inLightZone ? "text-slate-500" : "text-slate-400"
                                  }`}
                                >
                                  {item.desc}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      <div
                        className={`mt-2.5 pt-2.5 px-2 flex items-center justify-between border-t text-[11.5px] ${
                          inLightZone
                            ? "border-[#E4E4E4] text-slate-500"
                            : "border-white/10 text-slate-400"
                        }`}
                      >
                        <span>Direct MT5 bridge · Read/execute safety</span>
                        <a
                          href={isHome ? "#features" : "/#features"}
                          onClick={(e) => handleScrollTo(e, "features")}
                          className={`inline-flex items-center gap-1 font-semibold ${
                            inLightZone
                              ? "text-[#2563EB] hover:text-blue-700"
                              : "text-blue-400 hover:text-blue-300"
                          }`}
                        >
                          <LayoutGrid size={12} />
                          <span>Live preview</span>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/features/tradifive-ai"
                className={navLinkClass(isAiActive)}
              >
                TradiFive AI
              </Link>

              <Link
                to="/features/community-hub"
                className={navLinkClass(isCommunityActive)}
              >
                Community
              </Link>

              <a
                href={isHome ? "#pricing" : "/#pricing"}
                onClick={(e) => handleScrollTo(e, "pricing")}
                className={navLinkClass(false)}
              >
                Pricing
              </a>

              <Link to="/download" className={navLinkClass(isAppActive)}>
                App
              </Link>

              <Link to="/contact" className={navLinkClass(isContactActive)}>
                Contact
              </Link>
            </div>

            {/* Right: Crisp Architectural Action Buttons & Mobile Controls */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              <div className="hidden lg:flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSignIn}
                  className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
                    inLightZone
                      ? "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                      : "text-slate-200 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={handleSignUp}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-all cursor-pointer ${
                    inLightZone
                      ? "bg-[#2563EB] hover:bg-blue-700 text-white shadow-[0_2px_8px_rgba(37,99,235,0.28)]"
                      : "bg-white hover:bg-blue-50 text-slate-950 shadow-[0_2px_10px_rgba(255,255,255,0.18)]"
                  }`}
                >
                  <span>Get Started</span>
                  <ArrowRight size={13} strokeWidth={2.2} />
                </button>
              </div>

              {/* Mobile Action + Menu Button */}
              <div className="flex lg:hidden items-center gap-2">
                <button
                  type="button"
                  onClick={handleSignUp}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap cursor-pointer ${
                    inLightZone
                      ? "bg-[#2563EB] text-white"
                      : "bg-white text-slate-950"
                  }`}
                >
                  Get Started
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    inLightZone
                      ? "text-slate-900 hover:bg-slate-100"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <Menu size={22} />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm z-[10000]"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 280 }}
              className={`fixed top-0 right-0 bottom-0 w-[86%] max-w-[360px] z-[10001] flex flex-col overflow-hidden rounded-l-[24px] border-l shadow-2xl ${
                inLightZone
                  ? "bg-white border-[#E4E4E4] text-slate-900"
                  : "bg-[#080C17] border-white/10 text-white"
              }`}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  {inLightZone ? (
                    <img src="/Tradifive_logo1.png" className="h-6 w-auto" alt="TradiFive" />
                  ) : (
                    <>
                      <img src="/Logo_only.png" className="h-7 w-auto" alt="" />
                      <img src="/Dark mode logo with white.png" className="h-5 w-auto" alt="TradiFive" />
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors cursor-pointer ${
                    inLightZone
                      ? "border-[#E4E4E4] text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      : "border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <X size={15} />
                </button>
              </div>

              <div className={`h-px mx-6 ${inLightZone ? "bg-[#E4E4E4]" : "bg-white/10"}`} />

              {/* Scrollable Navigation */}
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => setMobileFeaturesOpen((prev) => !prev)}
                  className={`flex items-center justify-between w-full px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] cursor-pointer ${
                    inLightZone ? "text-slate-400" : "text-slate-400"
                  }`}
                >
                  <span>Platform ({PRODUCT_ITEMS.length})</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${
                      mobileFeaturesOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {mobileFeaturesOpen && (
                  <div className="flex flex-col gap-2 mb-3">
                    {PRODUCT_ITEMS.map((feat) => {
                      const Icon = feat.icon;
                      return (
                        <button
                          key={feat.path}
                          type="button"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            navigate(feat.path);
                          }}
                          className={`w-full text-left rounded-xl px-3 py-2.5 border flex items-center gap-3 transition-colors cursor-pointer ${
                            inLightZone
                              ? "bg-white border-[#E4E4E4] hover:border-slate-300"
                              : "bg-white/[0.04] border-white/10 hover:bg-white/[0.08]"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                              inLightZone ? feat.tint : feat.darkTint
                            }`}
                          >
                            <Icon size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-[13.5px] font-semibold ${
                                inLightZone ? "text-slate-900" : "text-white"
                              }`}
                            >
                              {feat.title}
                            </div>
                            <div
                              className={`text-[11.5px] truncate ${
                                inLightZone ? "text-slate-500" : "text-slate-400"
                              }`}
                            >
                              {feat.desc}
                            </div>
                          </div>
                          <ChevronRight
                            size={14}
                            className={inLightZone ? "text-slate-400" : "text-slate-500"}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Resources
                </div>

                <div className="flex flex-col gap-2">
                  {[
                    { label: "Pricing", path: "/#pricing", scrollId: "pricing", icon: Tag },
                    { label: "Download App", path: "/download", icon: Smartphone },
                    { label: "Contact", path: "/contact", icon: Mail },
                  ].map((item) => {
                    const Icon = item.icon;
                    const inner = (
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                          inLightZone
                            ? "bg-white border-[#E4E4E4] text-slate-800 hover:border-slate-300"
                            : "bg-white/[0.04] border-white/10 text-slate-200 hover:bg-white/[0.08]"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                            inLightZone
                              ? "bg-slate-50 border-[#E4E4E4] text-slate-600"
                              : "bg-white/[0.06] border-white/10 text-slate-300"
                          }`}
                        >
                          <Icon size={14} />
                        </div>
                        <span className="text-[13.5px] font-semibold">{item.label}</span>
                        <ChevronRight size={14} className="ml-auto text-slate-400" />
                      </div>
                    );

                    return item.scrollId ? (
                      <a
                        key={item.label}
                        href={item.path}
                        onClick={(e) => handleScrollTo(e, item.scrollId!)}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Bottom CTA */}
              <div
                className={`p-5 border-t flex flex-col gap-2.5 shrink-0 ${
                  inLightZone ? "border-[#E4E4E4] bg-[#F9FAFB]" : "border-white/10 bg-white/[0.02]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignIn();
                  }}
                  className={`w-full py-2.5 rounded-full text-[13.5px] font-semibold border transition-colors cursor-pointer ${
                    inLightZone
                      ? "bg-white border-[#E4E4E4] text-slate-800 hover:bg-slate-50"
                      : "bg-white/[0.06] border-white/12 text-white hover:bg-white/10"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignUp();
                  }}
                  className={`w-full py-2.5 rounded-full text-[13.5px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    inLightZone
                      ? "bg-[#2563EB] hover:bg-blue-700 text-white"
                      : "bg-white hover:bg-blue-50 text-slate-950"
                  }`}
                >
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
