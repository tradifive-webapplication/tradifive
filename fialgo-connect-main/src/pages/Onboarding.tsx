import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { OnboardingFlow } from "@/components/OnboardingFlow";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    });
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
      onComplete={() => navigate("/home")}
    />
  );
}
