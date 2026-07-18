import React from 'react';
import { SectionCard } from './SharedUI';
import { Settings } from 'lucide-react';

export const HelpCenterTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="HelpCenter" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const ContactSupportTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="ContactSupport" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const ReportBugTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="ReportBug" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const LegalPoliciesTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="LegalPolicies" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

