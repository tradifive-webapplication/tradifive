import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { OnboardingFlow } from "@/components/OnboardingFlow";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        setLoading(false);
      } else {
        const timer = setTimeout(async () => {
          if (!mounted) return;
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            setUser(currentUser);
          } else {
            navigate("/login", { replace: true });
          }
          setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && mounted) {
        setUser(session.user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#08080A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <OnboardingFlow
      user={user}
      onComplete={() => navigate("/home", { replace: true })}
    />
  );
}
