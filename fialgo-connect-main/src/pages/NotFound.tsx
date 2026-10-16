import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    // Auto-recovery: If user was redirected here after OAuth with wildcards or tokens,
    // check if a valid session exists and safely navigate them to /home
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && (location.pathname.includes('*') || window.location.hash.includes('access_token') || window.location.search.includes('code='))) {
        navigate('/home', { replace: true });
      }
    });
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/home" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
