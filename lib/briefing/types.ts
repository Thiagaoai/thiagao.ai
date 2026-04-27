export const BRIEFING_TAGS = [
  'AI',
  'Automacao',
  'DevTools',
  'Hardware',
  'BigTech',
  'Agents',
  'Startups',
  'Infra',
] as const;

export type BriefingTag = (typeof BRIEFING_TAGS)[number];

export type BriefingStatus = 'draft' | 'published' | 'archived';

export type BriefingSource = {
  title: string;
  url: string;
  publisher: string;
  publishedAt?: string;
};

export type BriefingPost = {
  id: string;
  slug: string;
  status: BriefingStatus;
  title: string;
  dek: string;
  brief: string;
  takeaway: string;
  category: BriefingTag;
  tags: string[];
  sources: BriefingSource[];
  relevanceScore: number;
  readingMinutes: number;
  publishedAt: string | null;
  createdAt: string;
};

export type BriefingDraftInput = Omit<
  BriefingPost,
  'id' | 'status' | 'publishedAt' | 'createdAt'
> & {
  status?: BriefingStatus;
};

export type SubscriberInput = {
  email: string;
  source?: string;
};

export type AgentRunRecord = {
  status: 'success' | 'error';
  startedAt: string;
  finishedAt: string;
  sourceCount: number;
  draftCount: number;
  notes: string[];
  error?: string;
};

export type NewsletterSubscriber = {
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced';
  source: string;
  createdAt: string;
  updatedAt: string;
};

export type NewsletterEmailLog = {
  id: string;
  email: string;
  subject: string;
  status: 'sent' | 'failed' | 'skipped';
  provider: string;
  providerId: string | null;
  campaign: string | null;
  error: string | null;
  createdAt: string;
};

export type NewsletterAgentRun = {
  id: string;
  status: 'success' | 'error';
  startedAt: string;
  finishedAt: string;
  sourceCount: number;
  draftCount: number;
  notes: string[];
  error: string | null;
  createdAt: string;
};
