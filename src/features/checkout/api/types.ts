import type { ApiResponse } from '@/features/bots/api/types';

export interface PublicCheckoutData {
  order_id: string;
  snap_token?: string;
  payment_url?: string;
  client_key?: string;
  bot?: string;
  slug?: string;
  amount?: string;
  package_name?: string;
  status?: string;
}

export type PublicCheckoutResponse = ApiResponse<PublicCheckoutData>;
