export type MediaType = 'none' | 'image' | 'video' | 'document' | 'link';

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

export interface ClientLicense {
  isActivated: boolean;
  clientName: string;
  clientPhone: string;
  hardwareId: string;
  licenseKey: string;
  planName: string;
  activationDate: string;
  allowedDevices: number;
  freeUpdatesUntil: string;
}
