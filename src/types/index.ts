export type MediaType = 'none' | 'image' | 'video' | 'document' | 'link';

export type DispatchMode = 
  | 'direct_cloud'       // إرسال سحابي مباشر عبر السيرفر بدون فتح أي نافذة متصفح نهائياً
  | 'single_tab_flow'    // إرسال تتابعي ذكي عبر نافذة إرسال واحدة موحدة (تمنع إغراق الشاشة بالنوافذ)
  | 'individual_popup'   // فتح نافذة لكل رقم يدوياً
  | 'simulation';        // وضع المحاكاة والتدريب الداخلي

export interface GatewayConfig {
  gatewayType: 'meta_cloud' | 'custom_webhook' | 'local_qr_session';
  phoneNumberId?: string;
  accessToken?: string;
  senderPhoneNumber?: string;
  webhookUrl?: string;
  sessionStatus: 'connected' | 'idle' | 'authorizing' | 'error';
  lastError?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  customVar?: string;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';
  sentAt?: string;
  error?: string;
}

export interface CampaignSettings {
  delayMin: number; // in seconds
  delayMax: number; // in seconds
  batchSize: number;
  batchPauseSeconds: number;
  spintaxEnabled: boolean;
  safeMode: boolean;
}

export interface MessagePayload {
  text: string;
  mediaType: MediaType;
  mediaUrl: string;
  mediaName: string;
  mediaCaption: string;
  ctaText: string;
  ctaUrl: string;
}

export interface AutoResponderRule {
  id: string;
  name: string;
  keywords: string[];
  matchType: 'contains' | 'exact' | 'starts_with';
  responseText: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  isActive: boolean;
}

export interface TutorialVideo {
  id: string;
  title: string;
  duration: string;
  category: string;
  description: string;
  steps: string[];
  thumbnail: string;
}
