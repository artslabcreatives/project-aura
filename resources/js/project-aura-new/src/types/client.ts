export interface ClientContact {
    id: number;
    client_id: number;
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    is_primary: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Client {
    id: number;
    company_name: string;
    industry?: string;
    website?: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
    contacts?: ClientContact[];
    contacts_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface ClientHistory {
    id: number;
    user_id: number;
    client_id?: number;
    action: string;
    target_name?: string;
    details?: any;
    created_at: string;
    user?: {
        id: number;
        name: string;
    };
}

