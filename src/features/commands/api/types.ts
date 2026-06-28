import type { ApiResponse } from '@/features/bots/api/types';

export type { ApiResponse };

export type ResponseType = 'text' | 'photo' | 'document';

export interface Command {
  id: string;
  bot_id: string;
  command_trigger: string;
  response_type: ResponseType;
  response_text: string;
  file_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCommandRequest {
  bot_id: string;
  command_trigger: string;
  response_type: ResponseType;
  response_text: string;
  file_url?: string;
}

export interface UpdateCommandRequest {
  command_trigger?: string;
  response_type?: ResponseType;
  response_text?: string;
  file_url?: string;
  is_active?: boolean;
}

export interface PresignedUrlRequest {
  file_name: string;
  content_type: string;
}

export interface PresignedUrlData {
  upload_url: string;
  public_url: string;
}

export type PresignedUrlResponse = ApiResponse<PresignedUrlData>;

export type CommandsListResponse = ApiResponse<Command[]>;
export type CommandResponse = ApiResponse<Command>;
