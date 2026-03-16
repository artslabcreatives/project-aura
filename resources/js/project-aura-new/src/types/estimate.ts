import { Client } from './client';

export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export interface EstimateLineItem {
    id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    total?: number;
}

export interface Estimate {
    id?: number;
    estimate_number?: string;
    client_id: number;
    client?: Client;
    title: string;
    description?: string;
    status: EstimateStatus;
    line_items?: EstimateLineItem[];
    subtotal?: number;
    tax_rate?: number;
    tax_amount?: number;
    total_amount?: number;
    valid_until?: string;
    notes?: string;
    project_id?: number;
    created_at?: string;
    updated_at?: string;
}
