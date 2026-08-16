import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  syncPermissions,
  getPermissions,
  getAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  activateAdmin,
  deactivateAdmin,
  syncAdminRoles,
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  activateClient,
  deactivateClient,
  getClientUsers,
  createClientUser,
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getClientSubscriptions,
  assignPlanToClient,
  cancelSubscription,
  getAuditLogs
} from './service';
import type { AuditLogFilters, ClientFilters } from './service';
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  SyncPermissionsRequest,
  CreateAdminRequest,
  UpdateAdminRequest,
  SyncAdminRolesRequest,
  CreateClientRequest,
  UpdateClientRequest,
  CreateClientUserRequest,
  CreatePlanRequest,
  UpdatePlanRequest,
  AssignPlanRequest
} from './types';

// ─── Query Keys ──────────────────────────────────────────────────────

export const superadminKeys = {
  all: ['superadmin'] as const,
  roles: {
    all: () => [...superadminKeys.all, 'roles'] as const,
    list: (page: number, limit: number) =>
      [...superadminKeys.roles.all(), 'list', { page, limit }] as const,
    detail: (id: string) => [...superadminKeys.roles.all(), 'detail', id] as const
  },
  permissions: {
    all: () => [...superadminKeys.all, 'permissions'] as const,
    list: () => [...superadminKeys.permissions.all(), 'list'] as const
  },
  admins: {
    all: () => [...superadminKeys.all, 'admins'] as const,
    list: (page: number, limit: number, search?: string) =>
      [...superadminKeys.admins.all(), 'list', { page, limit, search }] as const,
    detail: (id: string) => [...superadminKeys.admins.all(), 'detail', id] as const
  },
  clients: {
    all: () => [...superadminKeys.all, 'clients'] as const,
    list: (page: number, limit: number, filters?: ClientFilters) =>
      [...superadminKeys.clients.all(), 'list', { page, limit, filters }] as const,
    detail: (id: string) => [...superadminKeys.clients.all(), 'detail', id] as const
  },
  clientUsers: {
    all: (clientId: string) => [...superadminKeys.clients.all(), 'users', clientId] as const,
    list: (clientId: string) => [...superadminKeys.clientUsers.all(clientId), 'list'] as const
  },
  plans: {
    all: () => [...superadminKeys.all, 'plans'] as const,
    list: () => [...superadminKeys.plans.all(), 'list'] as const,
    detail: (id: string) => [...superadminKeys.plans.all(), 'detail', id] as const
  },
  subscriptions: {
    all: () => [...superadminKeys.all, 'subscriptions'] as const,
    list: () => [...superadminKeys.subscriptions.all(), 'list'] as const
  },
  auditLogs: {
    all: () => [...superadminKeys.all, 'audit-logs'] as const,
    list: (page: number, limit: number, filters?: AuditLogFilters) =>
      [...superadminKeys.auditLogs.all(), 'list', { page, limit, filters }] as const
  }
};

// ─── Query Options ───────────────────────────────────────────────────

export const rolesQueryOptions = (page: number, limit: number) =>
  queryOptions({
    queryKey: superadminKeys.roles.list(page, limit),
    queryFn: () => getRoles(page, limit)
  });
export const roleByIdQueryOptions = (id: string) =>
  queryOptions({ queryKey: superadminKeys.roles.detail(id), queryFn: () => getRole(id) });
export const permissionsQueryOptions = () =>
  queryOptions({ queryKey: superadminKeys.permissions.list(), queryFn: getPermissions });
export const adminsQueryOptions = (page: number, limit: number, search?: string) =>
  queryOptions({
    queryKey: superadminKeys.admins.list(page, limit, search),
    queryFn: () => getAdmins(page, limit, search)
  });
export const adminByIdQueryOptions = (id: string) =>
  queryOptions({ queryKey: superadminKeys.admins.detail(id), queryFn: () => getAdmin(id) });
export const clientsQueryOptions = (page: number, limit: number, filters?: ClientFilters) =>
  queryOptions({
    queryKey: superadminKeys.clients.list(page, limit, filters),
    queryFn: () => getClients(page, limit, filters)
  });
export const clientByIdQueryOptions = (id: string) =>
  queryOptions({ queryKey: superadminKeys.clients.detail(id), queryFn: () => getClient(id) });
export const clientUsersQueryOptions = (clientId: string) =>
  queryOptions({
    queryKey: superadminKeys.clientUsers.list(clientId),
    queryFn: () => getClientUsers(clientId)
  });
export const plansQueryOptions = () =>
  queryOptions({ queryKey: superadminKeys.plans.list(), queryFn: getPlans });
export const planByIdQueryOptions = (id: string) =>
  queryOptions({ queryKey: superadminKeys.plans.detail(id), queryFn: () => getPlan(id) });
export const subscriptionsQueryOptions = () =>
  queryOptions({ queryKey: superadminKeys.subscriptions.list(), queryFn: getClientSubscriptions });
export const auditLogsQueryOptions = (page: number, limit: number, filters?: AuditLogFilters) =>
  queryOptions({
    queryKey: superadminKeys.auditLogs.list(page, limit, filters),
    queryFn: () => getAuditLogs(page, limit, filters)
  });

// ─── useMutation shortcuts ──────────────────────────────────────────

function useSuperadminMutation<TData, TVariables>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  invalidateKeys: readonly unknown[]
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invalidateKeys as any });
    }
  });
}

// Roles
export const useCreateRole = () =>
  useSuperadminMutation((d: CreateRoleRequest) => createRole(d), superadminKeys.roles.all());
export const useUpdateRole = () =>
  useSuperadminMutation(
    ({ id, ...d }: { id: string } & UpdateRoleRequest) => updateRole(id, d),
    superadminKeys.roles.all()
  );
export const useDeleteRole = () =>
  useSuperadminMutation((id: string) => deleteRole(id), superadminKeys.roles.all());
export const useSyncPermissions = () =>
  useSuperadminMutation(
    ({ id, ...d }: { id: string } & SyncPermissionsRequest) => syncPermissions(id, d),
    superadminKeys.roles.all()
  );

// Admins
export const useCreateAdmin = () =>
  useSuperadminMutation((d: CreateAdminRequest) => createAdmin(d), superadminKeys.admins.all());
export const useUpdateAdmin = () =>
  useSuperadminMutation(
    ({ id, ...d }: { id: string } & UpdateAdminRequest) => updateAdmin(id, d),
    superadminKeys.admins.all()
  );
export const useDeleteAdmin = () =>
  useSuperadminMutation((id: string) => deleteAdmin(id), superadminKeys.admins.all());
export const useActivateAdmin = () =>
  useSuperadminMutation((id: string) => activateAdmin(id), superadminKeys.admins.all());
export const useDeactivateAdmin = () =>
  useSuperadminMutation((id: string) => deactivateAdmin(id), superadminKeys.admins.all());
export const useSyncAdminRoles = () =>
  useSuperadminMutation(
    ({ id, ...d }: { id: string } & SyncAdminRolesRequest) => syncAdminRoles(id, d),
    superadminKeys.admins.all()
  );

// Clients
export const useCreateClient = () =>
  useSuperadminMutation((d: CreateClientRequest) => createClient(d), superadminKeys.clients.all());
export const useUpdateClient = () =>
  useSuperadminMutation(
    ({ id, ...d }: { id: string } & UpdateClientRequest) => updateClient(id, d),
    superadminKeys.clients.all()
  );
export const useDeleteClient = () =>
  useSuperadminMutation((id: string) => deleteClient(id), superadminKeys.clients.all());
export const useActivateClient = () =>
  useSuperadminMutation((id: string) => activateClient(id), superadminKeys.clients.all());
export const useDeactivateClient = () =>
  useSuperadminMutation((id: string) => deactivateClient(id), superadminKeys.clients.all());
export const useCreateClientUser = () =>
  useSuperadminMutation(
    ({ clientId, ...d }: { clientId: string } & CreateClientUserRequest) =>
      createClientUser(clientId, d),
    superadminKeys.clients.all()
  );

// Plans
export const useCreatePlan = () =>
  useSuperadminMutation((d: CreatePlanRequest) => createPlan(d), superadminKeys.plans.all());
export const useUpdatePlan = () =>
  useSuperadminMutation(
    ({ id, ...d }: { id: string } & UpdatePlanRequest) => updatePlan(id, d),
    superadminKeys.plans.all()
  );
export const useDeletePlan = () =>
  useSuperadminMutation((id: string) => deletePlan(id), superadminKeys.plans.all());

// Subscriptions
export const useAssignPlan = () =>
  useSuperadminMutation(
    (d: AssignPlanRequest) => assignPlanToClient(d),
    superadminKeys.subscriptions.all()
  );
export const useCancelSubscription = () =>
  useSuperadminMutation((id: string) => cancelSubscription(id), superadminKeys.subscriptions.all());
