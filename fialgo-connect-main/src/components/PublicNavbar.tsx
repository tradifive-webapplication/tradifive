import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Ic } from "./Ic";
import { Download, Menu, X, ArrowRight, Sparkles, ChevronRight, Tag, Smartphone, Mail, Brain } from "lucide-react";
import AnimatedButton from "./AnimatedButton";
import WaitlistModal from "./WaitlistModal";

export default function PublicNavbar({
  onSignIn,
  onSignUp,
  onDownloadClick
}: {
  onSignIn?: () => void;
  onSignUp?: () => void;
  onDownloadClick?: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isFeaturesActive = location.pathname.startsWith("/features");
  const isAppActive = location.pathname === "/download";
  const isContactActive = location.pathname === "/contact";
  const isAiActive = location.pathname === "/features/tradifive-ai";
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inDeepDives, setInDeepDives] = useState(false);
  const [isHoveredTop, setIsHoveredTop] = useState(false);
  const [showWaitlist, setShowWaitlist] = useState(false);

  const handleSignIn = (e?: React.MouseEvent) => {
    if (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      e?.shiftKey
    ) {
      navigate("/login");
      return;
    }
    setShowWaitlist(true);
  };
  const handleSignUp = onSignUp || (() => setShowWaitlist(true));
  const handleDownload = onDownloadClick || (() => navigate("/download"));

  useEffect(() => {
    const h = () => {
      setScrolled(window.scrollY > 20);

      const deepDives = document.getElementById("deep-dives");
      const hideNavZone = document.getElementById("hide-nav-zone");

      let isActive = false;
      if (deepDives) {
        const rect = deepDives.getBoundingClientRect();
        // active when deep-dives has reached top of viewport and is still scrolling
        if (rect.top <= 0 && rect.bottom > 0) isActive = true;
      }
      if (hideNavZone) {
        const rect = hideNavZone.getBoundingClientRect();
        // active when the image starts taking up space in the viewport
        if (rect.top <= window.innerHeight * 0.7 && rect.bottom > 0) isActive = true;
      }
      setInDeepDives(isActive);
    };
    window.addEventListener("scroll", h);
    h(); // initial check
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    // Preload the heavy login page chunk in the background 1 second after navbar mount
    const timer = setTimeout(() => {
      import("../pages/Login").catch(() => { });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [mobileMenuOpen]);

  const handleLogoClick = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (isHome) {
      e.preventDefault();
      const element = document.getElementById(id);
      if (element) {
        const y = element.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <style>{`
        .nav-link-item {
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.65);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .nav-link-item:hover {
          color: #fff;
          text-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }
        .nav-link-item.active {
          color: #fff;
        }

        .ai-nav-btn {
          box-shadow: inset 0 0 0 1px rgba(168, 85, 247, 0.3), 0 0 12px rgba(168, 85, 247, 0.15) !important;
          background: linear-gradient(145deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.05) 100%) !important;
        }
        .ai-nav-btn:hover {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: inset 0 0 0 1px rgba(168, 85, 247, 0.5), 0 0 20px rgba(168, 85, 247, 0.3) !important;
          background: linear-gradient(145deg, rgba(168, 85, 247, 0.25) 0%, rgba(99, 102, 241, 0.1) 100%) !important;
        }
        
        .nav-btn-signin {
          background: none;
          border: none;
          color: rgba(255,255,255,0.65);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          padding: 8px 16px;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 100px;
        }
        .nav-btn-signin:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }
        
        .nav-btn-get-started {
          padding: 10px 22px;
          border-radius: 100px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%);
          color: #fff;
          font-weight: 600;
          font-size: 13px;
          border: none;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3), inset -1.5px 1.5px 2px rgba(150, 200, 255, 0.5), inset 0 1px 0 rgba(255,255,255,0.2);
          position: relative;
          overflow: hidden;
        }
        .nav-btn-get-started::before {
          content: "";
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: skewX(-20deg);
          transition: 0.5s;
        }
        .nav-btn-get-started:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .nav-btn-get-started:hover::before {
          left: 150%;
        }
        .nav-btn-get-started:active {
          transform: translateY(0) scale(0.98);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        @media (max-width: 768px) {
          .public-nav-container { padding: 0 20px !important; }
          .public-nav-logo-icon { height: 28px !important; margin-left: -4px; }
          .public-nav-logo-text { height: 24px !important; }
          .hide-sm { display: none !important; }
          .hide-on-mobile { display: none !important; }
          .show-sm { display: flex !important; }
          .public-nav {
            top: 0 !important;
            left: 0 !important;
            transform: translateY(var(--nav-translate-y, 0%)) !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 0 !important;
            border: none !important;
            height: 64px !important;
            background: rgba(10, 10, 10, 0.75) !important;
            backdrop-filter: blur(24px) !important;
            -webkit-backdrop-filter: blur(24px) !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          }
        }
      `}</style>
      {/* Invisible hover trigger zone at the top of the screen */}
      {inDeepDives && !mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "20px",
            background: "transparent",
            zIndex: 999,
            pointerEvents: "auto"
          }}
          onMouseEnter={() => setIsHoveredTop(true)}
        />
      )}

      <nav className="public-nav"
        onMouseEnter={() => setIsHoveredTop(true)}
        onMouseLeave={() => setIsHoveredTop(false)}
        style={{
          position: "fixed",
          top: 10,
          left: "50%",
          transform: "translateX(-50%) translateY(var(--nav-translate-y, 0%))",
          ["--nav-translate-y" as any]: inDeepDives && !isHoveredTop && !mobileMenuOpen ? "-120%" : "0%",
          width: "min(96%, 1280px)",
          maxWidth: 1280,
          height: 64,
          borderRadius: scrolled ? 999 : 0,
          background: !(isHome || isAppActive) ? "rgba(10, 10, 10, 0.88)" : (scrolled ? "rgba(12, 12, 12, 0.72)" : "transparent"),
          backdropFilter: scrolled || !(isHome || isAppActive) ? "blur(32px) saturate(1.2)" : "none",
          WebkitBackdropFilter: scrolled || !(isHome || isAppActive) ? "blur(32px) saturate(1.2)" : "none",
          border: scrolled ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid transparent",
          boxShadow: scrolled
            ? "0 4px 24px rgba(0, 0, 0, 0.35), 0 0 0 0.5px rgba(255, 255, 255, 0.04) inset, 0 1px 0 rgba(255, 255, 255, 0.04) inset"
            : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
          transition: "all 0.65s cubic-bezier(0.4, 0, 0.2, 1)"
        }}>
        <div className="public-nav-container" style={{ width: "100%", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}
            onClick={handleLogoClick}
          >
            <img className="public-nav-logo-icon" src="/Logo_only.png" style={{ height: 36, width: "auto", flexShrink: 0 }} alt="Icon" />
            <img className="public-nav-logo-text" src="/Dark mode logo with white.png" style={{ height: 32, width: "auto", flexShrink: 0 }} alt="TradiFive" />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }} className="hide-sm">
              <a href={isHome ? "#features" : "/#features"} onClick={(e) => handleScrollTo(e, "features")} className="nav-link-item">Features</a>
              <div style={{ transform: "scale(0.85)", display: "flex", alignItems: "center" }}>
                <AnimatedButton text="TradiFive AI" onClick={() => navigate("/features/tradifive-ai")} />
              </div>

              <a href={isHome ? "#pricing" : "/#pricing"} onClick={(e) => handleScrollTo(e, "pricing")} className="nav-link-item">Pricing</a>


              <Link
                to="/download"
                className={`nav-link-item ${isAppActive ? "active" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5
                }}
              >
                <span>App</span>
                {isAppActive && (
                  <div style={{
                    position: "absolute",
                    bottom: -8,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "#6366f1",
                    borderRadius: 2
                  }} />
                )}
              </Link>

              <Link
                to="/contact"
                className={`nav-link-item ${isContactActive ? "active" : ""}`}
              >
                <span>Contact</span>
                {isContactActive && (
                  <div style={{
                    position: "absolute",
                    bottom: -8,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "#6366f1",
                    borderRadius: 2
                  }} />
                )}
              </Link>
            </div>

            <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)" }} className="hide-sm hide-on-mobile" />

            {/* Desktop Auth Buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="hide-on-mobile hide-sm">
              <button onClick={(e) => handleSignIn(e)} className="nav-btn-signin" title="Shift+Click for team access">
                Sign In
              </button>
              <button onClick={handleSignUp} className="nav-btn-get-started">
                Join Waitlist
              </button>
            </div>

            {/* Mobile Hamburger Icon */}
            <div className="show-sm" style={{ display: "none", alignItems: "center" }}>
              <button
                onClick={() => setMobileMenuOpen(true)}
                style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: "8px", display: "flex" }}
              >
                <Menu size={26} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                position: "fixed", inset: 0,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                zIndex: 10000
              }}
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260 }}
              style={{
                position: "fixed", top: 0, right: 0, bottom: 0,
                width: "85%", maxWidth: 360,
                background: "#0a0a0f",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                zIndex: 10001,
                display: "flex", flexDirection: "column",
                boxShadow: "-40px 0 100px rgba(0,0,0,0.8)",
                overflow: "hidden",
                borderTopLeftRadius: "28px",
                borderBottomLeftRadius: "28px",
                borderTopRightRadius: "0px",
                borderBottomRightRadius: "0px",
              }}
            >
              {/* Subtle top accent line */}
              <div style={{
                position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
                background: "linear-gradient(to right, transparent, rgba(99,102,241,0.5), transparent)",
              }} />

              {/* Ambient glow */}
              <div style={{
                position: "absolute", top: -80, right: -80,
                width: 260, height: 260,
                background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* â”€â”€ Header â”€â”€ */}
              <div style={{ padding: "24px 24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img src="/favicon.png" style={{ height: 28, width: "auto" }} alt="Icon" />
                  <img src="/Dark mode logo with white.png" style={{ height: 21, width: "auto" }} alt="TradiFive" />
                </div>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    background: "rgba(255,255,255,0.015)",
                    border: "none",
                    borderRadius: 16, width: 34, height: 34,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "rgba(255,255,255,0.5)", cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <X size={14} />
                </motion.button>
              </div>

              {/* â”€â”€ Divider â”€â”€ */}
              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginLeft: 24, marginRight: 24 }} />

              {/* â”€â”€ Scrollable Content â”€â”€ */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 2 }}>

                {/* Section Label */}
                <div style={{ padding: "4px 8px 10px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.22)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  Features
                </div>

                {/* TradiFive AI Feature Card */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate("/features/tradifive-ai"); }}
                    style={{
                      width: "100%", textAlign: "left",
                      background: "rgba(255,255,255,0.015)",
                      border: "none",
                      borderRadius: 16, padding: "16px 18px",
                      cursor: "pointer", marginBottom: 8,
                      position: "relative", overflow: "hidden",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 7 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Brain size={15} color="rgba(255,255,255,0.55)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>TradiFive AI</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>AI Coach</div>
                      </div>
                      <ChevronRight size={14} color="rgba(255,255,255,0.2)" />
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.6 }}>
                      Real-time behavioral coaching that adapts to your trading style.
                    </p>
                  </button>
                </motion.div>

                {/* Section Label */}
                <div style={{ padding: "10px 8px 8px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.22)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  Navigation
                </div>

                {/* Nav Links */}
                {[
                  { label: "Pricing", path: "/#pricing", scrollId: "pricing", icon: Tag },
                  { label: "Download App", path: "/download", icon: Smartphone },
                  { label: "Contact", path: "/contact", icon: Mail },
                ].map((item, i) => {
                  const Icon = item.icon;
                  const content = (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, transition: "background 0.15s" }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <Icon size={14} color="rgba(255,255,255,0.55)" />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{item.label}</span>
                      <ChevronRight size={13} color="rgba(255,255,255,0.2)" style={{ marginLeft: "auto" }} />
                    </div>
                  );
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {item.scrollId ? (
                        <a href={item.path} onClick={(e) => handleScrollTo(e as any, item.scrollId!)} style={{ textDecoration: "none", display: "block" }}>
                          {content}
                        </a>
                      ) : (
                        <Link to={item.path} onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: "none", display: "block" }}>
                          {content}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* â”€â”€ Bottom CTA â”€â”€ */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: "16px 20px 32px",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  display: "flex", flexDirection: "column", gap: 10,
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.01)",
                }}
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ background: "rgba(255,255,255,0.1)" } as any}
                  onClick={(e: any) => { setMobileMenuOpen(false); handleSignIn(e); }}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: 600,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ background: "#2563eb" } as any}
                  onClick={() => { setMobileMenuOpen(false); handleSignUp(); }}
                  style={{
                    background: "#3b82f6",
                    border: "none",
                    color: "#fff",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "15px",
                    fontWeight: 600,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px"
                  }}
                >
                  Join Waitlist
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <WaitlistModal isOpen={showWaitlist} onClose={() => setShowWaitlist(false)} />
    </>
  );
}
