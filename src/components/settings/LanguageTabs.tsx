import React from 'react';
import { SectionCard } from './SharedUI';
import { Settings } from 'lucide-react';

export const LanguagePreferencesTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="LanguagePreferences" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const RegionLocalizationTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="RegionLocalization" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const TranslationSettingsTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="TranslationSettings" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const RegionalTradingTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="RegionalTrading" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

