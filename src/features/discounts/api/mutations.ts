// ============================================================
// Discount Mutations — React Query Mutation Options
// ============================================================

import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createDiscount, updateDiscount, deleteDiscount, bulkDeleteDiscounts } from './service';
import { discountKeys } from './queries';
import type { CreateMemberDiscountRequest, UpdateMemberDiscountRequest } from './types';

export const createDiscountMutation = mutationOptions({
  mutationFn: (data: CreateMemberDiscountRequest) => createDiscount(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: discountKeys.all });
  }
});

export const updateDiscountMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdateMemberDiscountRequest }) =>
    updateDiscount(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: discountKeys.all });
  }
});

export const deleteDiscountMutation = mutationOptions({
  mutationFn: (id: string) => deleteDiscount(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: discountKeys.all });
  }
});

export const bulkDeleteDiscountsMutation = mutationOptions({
  mutationFn: (ids: string[]) => bulkDeleteDiscounts(ids),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: discountKeys.all });
  }
});
