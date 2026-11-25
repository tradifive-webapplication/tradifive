import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useEffect, useRef } from "react";

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); // Drop to A4

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // Ignore audio context errors if user hasn't interacted
  }
};

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
  
  useEffect(() => {
    // Use a MutationObserver to watch for new toasts being added to the DOM
    const observer = new MutationObserver((mutations) => {
      let shouldPlay = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i] as HTMLElement;
            // Sonner toasts are typically list items with data-sonner-toast
            if (node.nodeType === 1 && (node.tagName === 'LI' || node.matches?.('[data-sonner-toast]'))) {
              shouldPlay = true;
            }
          }
        }
      }
      if (shouldPlay) {
        playNotificationSound();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group !z-[999999]"
      style={{ zIndex: 999999, ["--width" as any]: "440px" }}
      position="top-center"
      icons={{
        success: <CheckCircle2 className="h-[18px] w-[18px] text-[#FFFFFF] fill-[#10b981] shrink-0" />,
        error: <AlertCircle className="h-[18px] w-[18px] text-[#FFFFFF] fill-[#f97316] shrink-0" />,
        info: <Info className="h-[18px] w-[18px] text-[#FFFFFF] fill-[#64748b] shrink-0" /> }}
      toastOptions={{
        classNames: {
          toast:
            "group toast sm:!w-[440px] !max-w-[calc(100vw-24px)] group-[.toaster]:bg-white dark:group-[.toaster]:bg-[#18181b] group-[.toaster]:border group-[.toaster]:border-slate-200/90 dark:group-[.toaster]:border-white/10 group-[.toaster]:text-slate-800 dark:group-[.toaster]:text-slate-100 group-[.toaster]:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_10px_28px_-6px_rgba(15,23,42,0.14)] dark:group-[.toaster]:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_28px_-6px_rgba(0,0,0,0.45)] group-[.toaster]:rounded-2xl group-[.toaster]:py-3 group-[.toaster]:px-4 font-sans flex items-center gap-3",
          content: "flex-1 min-w-0",
          title: "text-[13px] font-semibold tracking-tight leading-snug text-slate-900 dark:text-white",
          description: "group-[.toast]:text-slate-500 dark:group-[.toast]:text-zinc-400 text-[12px] font-normal leading-snug mt-0.5",
          actionButton: "!ml-auto shrink-0 !h-8 !px-3.5 !rounded-full group-[.toast]:bg-blue-600 hover:group-[.toast]:bg-blue-700 group-[.toast]:text-white !font-semibold !text-[12px] shadow-xs transition-all active:scale-[0.98]",
          cancelButton: "shrink-0 !h-8 !px-3 !rounded-full group-[.toast]:bg-slate-100 dark:group-[.toast]:bg-white/10 group-[.toast]:text-slate-700 dark:group-[.toast]:text-slate-200 !font-medium !text-[12px] transition-all active:scale-[0.98]",
        } }}
      {...props}
    />
  );
};

export { Toaster, toast };
