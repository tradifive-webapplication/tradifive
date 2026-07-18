import React from 'react';
import { SectionCard } from './SharedUI';
import { Settings } from 'lucide-react';

export const CurrentPlanTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="CurrentPlan" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const PaymentMethodsTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="PaymentMethods" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const BillingHistoryTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="BillingHistory" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

export const FeatureAccessTab = () => (
   <div className="space-y-6 pb-20">
      <SectionCard title="FeatureAccess" icon={Settings}>
         <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">Component under construction in Phase 2+</div>
      </SectionCard>
   </div>
);

