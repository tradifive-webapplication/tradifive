import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Wifi, WifiOff } from "lucide-react";
import React from "react";

export const NetworkNotifier = () => {
  const toastIdRef = useRef<string | number | undefined>(undefined);
  const wasOfflineRef = useRef<boolean>(!navigator.onLine);
  
  useEffect(() => {
    const handleOffline = () => {
      wasOfflineRef.current = true;
      toastIdRef.current = toast.error("No Internet Connection", {
        description: "You're currently offline. Some features may be unavailable until your connection is restored.",
        duration: Infinity,
        icon: <WifiOff className="w-5 h-5 text-red-500" />,
        style: {
          border: '1px solid #ef4444',
          background: '#fee2e2',
          color: '#991b1b'
        }
      });
    };

    const handleOnline = () => {
      if (wasOfflineRef.current) {
        wasOfflineRef.current = false;
        if (toastIdRef.current !== undefined) {
          toast.dismiss(toastIdRef.current);
          toastIdRef.current = undefined;
        }
        
        toast.success("Connection Restored", {
          description: "Your internet connection is back online.",
          duration: 3000,
          icon: <Wifi className="w-5 h-5 text-green-500" />
        });
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
};
