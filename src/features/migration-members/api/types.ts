export interface MigrationMember {
  id: string;
  client_id: string;
  package_id: string;
  username: string;
  expired_at: string;
  status: 'pending' | 'claimed' | string;
  created_at: string;
  claimed_at: string | null;
}

export interface MigrationMembersResponse {
  success: boolean;
  code: number;
  message: string;
  data: MigrationMember[];
  request_id?: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface MigrationMemberFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  package_id?: string;
}

export interface MigrationImportMember {
  username: string;
  expired_at: string;
}

export interface MigrationImportPayload {
  package_id: string;
  members: MigrationImportMember[];
}

export interface MigrationImportError {
  row: number;
  username: string;
  error: string;
}

export interface MigrationImportResult {
  total_submitted: number;
  imported: number;
  skipped: number;
  errors: MigrationImportError[];
}

export interface MigrationImportResponse {
  success: boolean;
  code: number;
  message: string;
  data: MigrationImportResult;
  request_id?: string;
}
