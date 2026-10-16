import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || !profile || !['super_admin', 'support_agent', 'finance_admin'].includes(profile.role)) {
        console.error("Access denied: Not an admin", error);
        navigate("/journal");
        return;
      }

      setIsAdmin(true);
    };

    checkAdmin();
  }, [navigate]);

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-[#D6E4FF] dark:border-[#333333] border-primary border-t-transparent rounded-full"
          />
          <p className="text-muted-foreground animate-pulse">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

