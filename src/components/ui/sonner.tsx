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
      className="toaster group"
      position="top-center"
      icons={{
        success: <CheckCircle2 className="h-[18px] w-[18px] text-[#FFFFFF] fill-[#10b981]" />,
        error: <AlertCircle className="h-[18px] w-[18px] text-[#FFFFFF] fill-[#f97316]" />,
        info: <Info className="h-[18px] w-[18px] text-[#FFFFFF] fill-[#64748b]" /> }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-[#18181b] group-[.toaster]:border group-[.toaster]:border-slate-200/90 dark:group-[.toaster]:border-white/10 group-[.toaster]:text-slate-800 dark:group-[.toaster]:text-slate-100 group-[.toaster]:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_8px_24px_-4px_rgba(0,0,0,0.12)] dark:group-[.toaster]:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_24px_-4px_rgba(0,0,0,0.4)] group-[.toaster]:rounded-xl group-[.toaster]:py-2.5 group-[.toaster]:px-6 font-sans text-[13.5px] font-bold tracking-normal flex items-center justify-center gap-2.5",
          description: "group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400 text-[12px] font-medium",
          actionButton: "group-[.toast]:bg-blue-600 group-[.toast]:text-white font-bold text-[12px] px-3.5 py-1 rounded-lg shadow-xs active:scale-[0.985]",
          cancelButton: "group-[.toast]:bg-slate-100 dark:group-[.toast]:bg-white/10 group-[.toast]:text-slate-700 dark:group-[.toast]:text-slate-200 font-semibold rounded-lg text-[12px] px-3 py-1 active:scale-[0.985]",
        } }}
      {...props}
    />
  );
};

export { Toaster, toast };
