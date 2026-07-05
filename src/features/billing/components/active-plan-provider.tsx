'use client';

import { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activeBillingQueryOptions } from '../api/queries';
import type { ActiveBilling, ActivePlan, ActivePlanUsage } from '../api/types';

const quotaLimitKeys = {
  bots: 'max_bots',
  groups: 'max_groups',
  packages: 'max_packages',
  members: 'max_members',
  custom_commands: 'max_custom_commands',
  broadcasts: 'max_broadcasts'
} as const satisfies Record<keyof ActivePlanUsage, keyof ActivePlan>;

type PlanFeatureKey =
  | 'allow_media_broadcast'
  | 'allow_discount_system'
  | 'allow_reports_export'
  | 'allow_high_priority';

type QuotaResourceKey = keyof ActivePlanUsage;

interface ActivePlanContextValue {
  billing: ActiveBilling | null;
  plan: ActivePlan | null;
  usage: ActivePlanUsage | null;
  isLoading: boolean;
  canUseFeature: (feature: PlanFeatureKey) => boolean;
  hasQuota: (resource: QuotaResourceKey) => boolean;
  getQuota: (resource: QuotaResourceKey) => {
    used: number;
    limit: number;
    remaining: number | null;
    percentage: number;
    isUnlimited: boolean;
    hasQuota: boolean;
  } | null;
  refreshPlan: () => Promise<unknown>;
}

const ActivePlanContext = createContext<ActivePlanContextValue | null>(null);

export function ActivePlanProvider({ children }: { children: React.ReactNode }) {
  const query = useQuery(activeBillingQueryOptions());

  const value = useMemo<ActivePlanContextValue>(() => {
    const billing = query.data?.success ? query.data.data : null;
    const plan = billing?.plan ?? null;
    const usage = billing?.usage ?? null;

    const canUseFeature = (feature: PlanFeatureKey) => Boolean(plan?.[feature]);

    const getQuota = (resource: QuotaResourceKey) => {
      if (!plan || !usage) return null;

      const limit = plan[quotaLimitKeys[resource]];
      const used = usage[resource];
      const isUnlimited = limit === -1;
      const hasQuota = isUnlimited || used < limit;
      const remaining = isUnlimited ? null : Math.max(limit - used, 0);
      const percentage = isUnlimited || limit <= 0 ? 0 : Math.min((used / limit) * 100, 100);

      return {
        used,
        limit,
        remaining,
        percentage,
        isUnlimited,
        hasQuota
      };
    };

    return {
      billing,
      plan,
      usage,
      isLoading: query.isLoading,
      canUseFeature,
      hasQuota: (resource) => getQuota(resource)?.hasQuota ?? false,
      getQuota,
      refreshPlan: query.refetch
    };
  }, [query.data, query.isLoading, query.refetch]);

  return <ActivePlanContext.Provider value={value}>{children}</ActivePlanContext.Provider>;
}

export function useActivePlan() {
  const context = useContext(ActivePlanContext);

  if (!context) {
    throw new Error('useActivePlan must be used within ActivePlanProvider');
  }

  return context;
}
