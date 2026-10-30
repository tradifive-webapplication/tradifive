import React from 'react';
import { View, StyleSheet } from 'react-native';
import { usePlan, PlanFeature } from '../hooks/usePlan';
import ComingSoonVeil from '../../components/ComingSoonVeil';

interface UpgradeGateProps {
  feature: PlanFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
}

export default function UpgradeGate({ feature, children, fallback, title, description }: UpgradeGateProps) {
  const { canAccess } = usePlan();

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <View style={s.container}>
      {children}
      <ComingSoonVeil
        featureTitle={title || 'Coming Soon'}
        subtitle={description || "We're actively finalizing this module for public launch. In the meantime, explore live Auto Trade or our community feed."}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
});
