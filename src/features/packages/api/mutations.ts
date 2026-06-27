// ============================================================
// Package Mutations — React Query Mutation Options
// ============================================================

import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import {
  createPackage,
  updatePackage,
  deletePackage,
  associateGroupsToPackage
} from './service';
import { packageKeys } from './queries';
import type {
  CreatePackageRequest,
  UpdatePackageRequest,
  PackageGroupAssociateRequest
} from './types';

export const createPackageMutation = mutationOptions({
  mutationFn: (data: CreatePackageRequest) => createPackage(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: packageKeys.all });
  }
});

export const updatePackageMutation = mutationOptions({
  mutationFn: ({
    id,
    values
  }: {
    id: string;
    values: UpdatePackageRequest;
  }) => updatePackage(id, values),
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

export const associateGroupsMutation = mutationOptions({
  mutationFn: ({
    packageId,
    data
  }: {
    packageId: string;
    data: PackageGroupAssociateRequest;
  }) => associateGroupsToPackage(packageId, data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: packageKeys.all });
  }
});
