import React, { useEffect } from 'react';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import TermsTab from '@/components/settings/TermsTab';

export default function LegalPublic() {
  // Ensure we start at the top of the page when navigating here
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-inter">
      <PublicNavbar />
      
      {/* 
        We wrap the content in a main area that provides spacing. 
        We also force the "dark" class because TermsTab relies on dark mode classes 
        to render properly on black backgrounds, and public pages are always dark mode.
      */}
      <main className="pt-32 pb-24 px-6 sm:px-12 relative z-10 min-h-[80vh]">
        <div className="max-w-6xl mx-auto dark">
          
          {/* Subtle Background Glows specifically for this container */}
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <TermsTab />
          </div>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
