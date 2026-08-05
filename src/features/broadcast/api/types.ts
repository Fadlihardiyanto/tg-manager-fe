import type { ApiResponse } from '@/features/bots/api/types';

export type TargetType = 'group' | 'member';
export type MessageType = 'text' | 'photo' | 'document';
export type BroadcastStatus = 'pending' | 'processing' | 'completed' | 'scheduled';

export interface FailedDetail {
  chat_id: number;
  error: string;
}

export interface Broadcast {
  id: string;
  bot_id: string;
  target_type: TargetType;
  message_type: MessageType;
  message_text: string;
  file_url: string | null;
  status: BroadcastStatus;
  total_targets: number;
  sent_count: number;
  failed_count: number;
  failed_details: FailedDetail[] | null;
  scheduled_at?: string;
  created_at: string;
}

export interface CreateBroadcastRequest {
  target_type: TargetType;
  message_type: MessageType;
  message_text: string;
  file_url?: string;
  scheduled_at?: string;
  is_immediate?: boolean;
  group_ids?: string[];
}

export interface PresignedUrlRequest {
  file_name: string;
  content_type: string;
}

export interface PresignedUrlData {
  upload_url: string;
  public_url: string;
  expires_at: string;
}

export type BroadcastsListResponse = ApiResponse<Broadcast[]>;
export type BroadcastResponse = ApiResponse<Broadcast>;
export type PresignedUrlResponse = ApiResponse<PresignedUrlData>;

export interface BroadcastReachData {
  group_count: number;
  member_count: number;
}

export type BroadcastReachResponse = ApiResponse<BroadcastReachData>;
