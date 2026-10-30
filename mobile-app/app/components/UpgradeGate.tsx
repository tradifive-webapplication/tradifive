import React from 'react';
import { PlanFeature } from '../hooks/usePlan';

interface UpgradeGateProps {
  feature?: PlanFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
}

export default function UpgradeGate({ children }: UpgradeGateProps) {
  return <>{children}</>;
}
