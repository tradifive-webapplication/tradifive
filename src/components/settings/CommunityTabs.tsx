import React from 'react';
import { SectionCard } from './SharedUI';
import { Settings } from 'lucide-react';

export const ChannelControlsTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="ChannelControls" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const ChatModerationTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="ChatModeration" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const CreatorProfileTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="CreatorProfile" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const MonetizationTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="Monetization" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const AnalyticsTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="Analytics" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

