// ============================================================
// Package Mutations — React Query Mutation Options
// ============================================================

import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createPackage,
  updatePackage,
  deletePackage,
  togglePackageStatus,
  associateGroupsToPackage
} from './service';
import { packageKeys } from './queries';
import type {
  CreatePackageRequest,
  UpdatePackageRequest,
  PackageGroupAssociateRequest,
  Package,
  PackagesListResponse
} from './types';

export const createPackageMutation = mutationOptions({
  mutationFn: (data: CreatePackageRequest) => createPackage(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: packageKeys.all });
  }
});

export const updatePackageMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: string; values: UpdatePackageRequest }) =>
    updatePackage(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: packageKeys.all });
  }
});

export const deletePackageMutation = mutationOptions({
  mutationFn: (id: string) => deletePackage(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: packageKeys.all });
  }
});

export const togglePackageStatusMutation = (isActive: boolean) =>
  mutationOptions({
    mutationFn: (id: string) => togglePackageStatus(id, isActive),
    onMutate: async (id) => {
      const queryClient = getQueryClient();
      await queryClient.cancelQueries({ queryKey: packageKeys.all });
      const previous = queryClient.getQueryData<PackagesListResponse>(packageKeys.list());
      queryClient.setQueryData<PackagesListResponse | undefined>(packageKeys.list(), (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((p: Package) => (p.id === id ? { ...p, is_active: isActive } : p))
        };
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) {
        getQueryClient().setQueryData(packageKeys.list(), ctx.previous);
      }
    },
    onSettled: () => {
      getQueryClient().invalidateQueries({ queryKey: packageKeys.all });
    }
  });

export const associateGroupsMutation = mutationOptions({
  mutationFn: ({ packageId, data }: { packageId: string; data: PackageGroupAssociateRequest }) =>
    associateGroupsToPackage(packageId, data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: packageKeys.all });
  }
});
