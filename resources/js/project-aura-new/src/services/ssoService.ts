import { api } from '@/services/api';

export interface SSOClientInfo {
    client: {
        name: string;
        description: string | null;
        logo_url: string | null;
        homepage_url: string | null;
    };
    scopes: string[];
    redirect_uri: string;
}

export interface OAuthClient {
    id: number;
    name: string;
    client_id: string;
    redirect_uris: string[];
    allowed_scopes: string[] | null;
    is_active: boolean;
    is_confidential: boolean;
    description: string | null;
    logo_url: string | null;
    homepage_url: string | null;
    created_by: { id: number; name: string; email: string } | null;
    created_at: string;
    client_secret?: string; // only returned on create/regenerate
}

export interface CreateClientPayload {
    name: string;
    redirect_uris: string[];
    allowed_scopes?: string[];
    is_confidential?: boolean;
    description?: string;
    logo_url?: string;
    homepage_url?: string;
}

/** Validate an authorization request and get client info for the consent screen. */
export async function validateAuthorize(params: Record<string, string>): Promise<SSOClientInfo> {
    const query = new URLSearchParams(params).toString();
    const { data } = await api.get<SSOClientInfo>(`/oauth/authorize?${query}`);
    return data;
}

/** User approves or denies the SSO authorization request. Returns redirect_to URL. */
export async function approveAuthorize(payload: {
    client_id: string;
    redirect_uri: string;
    scope: string;
    state?: string;
    code_challenge?: string;
    code_challenge_method?: string;
    approved: boolean;
}): Promise<{ redirect_to: string }> {
    const { data } = await api.post<{ redirect_to: string }>('/oauth/authorize', payload);
    return data;
}

/** Auto-authorize for trusted first-party apps (skips consent screen). */
export async function autoAuthorize(clientId: string, redirectUri?: string): Promise<{ redirect_to: string }> {
    const { data } = await api.post<{ redirect_to: string }>('/sso/auto-authorize', {
        client_id: clientId,
        redirect_uri: redirectUri,
    });
    return data;
}

// ─── Admin Client Management ─────────────────────────────────────────────────

export async function listClients(): Promise<OAuthClient[]> {
    const { data } = await api.get<OAuthClient[]>('/oauth/clients');
    return data;
}

export async function getClient(id: number): Promise<OAuthClient> {
    const { data } = await api.get<OAuthClient>(`/oauth/clients/${id}`);
    return data;
}

export async function createClient(payload: CreateClientPayload): Promise<OAuthClient> {
    const { data } = await api.post<OAuthClient>('/oauth/clients', payload);
    return data;
}

export async function updateClient(id: number, payload: Partial<CreateClientPayload> & { is_active?: boolean }): Promise<OAuthClient> {
    const { data } = await api.put<OAuthClient>(`/oauth/clients/${id}`, payload);
    return data;
}

export async function deleteClient(id: number): Promise<void> {
    await api.delete(`/oauth/clients/${id}`);
}

export async function regenerateSecret(id: number): Promise<{ message: string; client_secret: string }> {
    const { data } = await api.post<{ message: string; client_secret: string }>(`/oauth/clients/${id}/regenerate-secret`);
    return data;
}
