import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Lock, Crown } from 'lucide-react-native';
import { usePlan, PlanFeature } from '../hooks/usePlan';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface UpgradeGateProps {
  feature: PlanFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  title?: string;
  description?: string;
}

export default function UpgradeGate({ feature, children, fallback, title, description }: UpgradeGateProps) {
  const { canAccess, plan } = usePlan();
  const router = useRouter();

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <View style={s.container}>
      <View style={s.card}>
        <View style={s.iconWrapper}>
          <Lock size={32} color="#f59e0b" />
        </View>
        <Text style={s.title}>{title || 'Feature Locked'}</Text>
        <Text style={s.description}>
          {description || 'Upgrade your subscription to access this feature.'}
        </Text>
        <TouchableOpacity style={s.button} onPress={() => router.push('/settings' as any)}>
          <Crown size={16} color="#fff" />
          <Text style={s.buttonText}>View Plans</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    width: width - 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fffbeb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter_900Black',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
});
