import { api } from '@/services/api';
import axios from 'axios';

export interface ChatMessage {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
  metadata?: ChatMessageMetadata | string | null;
  created_at?: string;
}

export interface ChatMessageMetadata {
  actions?: ChatActionResult[];
  memory_summary?: string | null;
  attachments?: ChatAttachment[];
  attachment_count?: number;
  [key: string]: unknown;
}

export interface ChatAttachment {
  id: number;
  name: string;
  mime_type?: string | null;
  size: number;
}

export interface ChatActionResult {
  type: string;
  status: 'completed' | 'failed' | string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface ChatSession {
  id: number;
  title: string;
  status: 'active' | 'completed' | 'archived';
  mode?: 'operations' | 'scenario' | 'mattermost';
  memory_summary?: string | null;
  stats?: ContextStats;
  messages: ChatMessage[];
  created_at?: string;
  updated_at?: string;
}

export interface ContextStats {
  snapshot_at: string;
  total_projects: number;
  active_projects: number;
  total_tasks: number;
  overdue_tasks_total: number;
  unassigned_tasks_total: number;
  blocked_tasks_total: number;
  active_users: number;
  overworked_users: number;
  idle_users: number;
}

export interface ScenarioPolicy {
  id: number;
  session_id: number | null;
  scenario_key: string;
  scenario_title: string;
  scenario_description: string | null;
  conditions: Record<string, unknown> | null;
  boundaries: Record<string, unknown> | null;
  notifications: Record<string, unknown> | null;
  reactions: Record<string, unknown> | null;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export const chatbotService = {
  async getSessions(): Promise<ChatSession[]> {
    const { data } = await api.get('/ai-chatbot/sessions');
    return data;
  },

  async createSession(mode: 'operations' | 'scenario' = 'operations'): Promise<ChatSession> {
    const { data } = await api.post('/ai-chatbot/sessions', { mode });
    return data;
  },

  async getSession(id: number): Promise<ChatSession> {
    const { data } = await api.get(`/ai-chatbot/sessions/${id}`);
    return data;
  },

  async sendMessage(sessionId: number, message: string, attachments: File[] = []): Promise<ChatMessage> {
    try {
      if (attachments.length > 0) {
        const form = new FormData();
        form.append('message', message);
        attachments.forEach(file => form.append('attachments[]', file));

        const { data } = await api.post(`/ai-chatbot/sessions/${sessionId}/messages`, form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
      }

      const { data } = await api.post(`/ai-chatbot/sessions/${sessionId}/messages`, { message });
      return data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error));
    }
  },

  async completeSession(sessionId: number): Promise<void> {
    await api.post(`/ai-chatbot/sessions/${sessionId}/complete`);
  },

  async refreshContext(sessionId: number): Promise<{ stats: ContextStats; refreshed_at: string }> {
    const { data } = await api.post(`/ai-chatbot/sessions/${sessionId}/refresh-context`);
    return data;
  },

  async getPolicies(): Promise<ScenarioPolicy[]> {
    const { data } = await api.get('/ai-chatbot/policies');
    return data;
  },

  async updatePolicy(id: number, updates: Partial<ScenarioPolicy>): Promise<ScenarioPolicy> {
    const { data } = await api.put(`/ai-chatbot/policies/${id}`, updates);
    return data;
  },
};

function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { error?: string; message?: string } | undefined;
    return payload?.error ?? payload?.message ?? 'Sorry, something went wrong. Please try again.';
  }

  return error instanceof Error ? error.message : 'Sorry, something went wrong. Please try again.';
}
