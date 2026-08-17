export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
  errors?: Record<string, string>;
  request_id?: string;
}

export interface ReportSettings {
  enabled: boolean;
  target_chat_id: number;
  bot_id: string;
  report_time: string;
}

export type ReportSettingsResponse = ApiResponse<ReportSettings | null>;

export interface ReportFailure {
  event_type: string;
  telegram_chat_id: number | null;
  detail: string;
  created_at: string;
}

export type ReportFailuresResponse = ApiResponse<ReportFailure[]>;

export interface SaveReportSettingsRequest {
  enabled: boolean;
  target_chat_id: number;
  bot_id: string;
  report_time: string;
}
