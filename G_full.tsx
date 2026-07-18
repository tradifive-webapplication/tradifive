const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

    :root {
      --bg:      #02040a;
      --bg2:
<truncated 24454 bytes>
y: inline-flex;
      animation: broker 35s linear infinite;
    }
    @keyframes broker { to { transform: translateX(-50%); } }

    .br-chip {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 22px;
      border-radius: 100px;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
      white-space: nowrap;
      margin: 0 8px;
      transition: background 0.3s, border-color 0.3s;
    }
    .br-chip:hover {
      background: rgba(255,255,255,0.04);
      border-color: rgba(255,255,255,0.1);
    }

    /* FLOATING ANIMATIONS */
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .fa { animation: float 4s ease-in-out infinite; }
    .fb { animation: float 5s ease-in-out infinite 0.5s; }
    .fc { animation: float 3.5s ease-in-out infinite 0.2s; }

    /* PULSE DOT */
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.4); }
    }
    .pulse-dot { animation: pulseDot 1.8s ease-in-out infinite; }

    /* GRID BG */
    .grid-bg {
      background-image:
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 60px 60px;
    }

    /* 3D CARD / HERO ANIMATIONS */
    @keyframes floatCard {
      0%, 100% { transform: translateY(0px) rotate(var(--rot, 0deg)); }
      50% { transform: translateY(-12px) rotate(var(--rot, 0deg)); }
    }
    @keyframes shimmer {
The above content does NOT show the entire file contents. If you need to view any lines of the file which were not shown to complete your task, call this tool again to view those lines.
