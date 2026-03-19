import { api } from './api';
import { Client, ClientContact, ClientHistory } from '@/types/client';

export const clientService = {
    getAll: async (search?: string): Promise<Client[]> => {
        const { data } = await api.get('/clients', {
            params: { search }
        });
        return data;
    },

    getById: async (id: string | number): Promise<Client> => {
        const { data } = await api.get(`/clients/${id}`);
        return data;
    },

    create: async (client: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'contacts' | 'contacts_count'>): Promise<Client> => {
        const { data } = await api.post('/clients', client);
        return data;
    },

    update: async (id: string | number, client: Partial<Client>): Promise<Client> => {
        const { data } = await api.put(`/clients/${id}`, client);
        return data;
    },

    delete: async (id: string | number): Promise<void> => {
        await api.delete(`/clients/${id}`);
    },

    addContact: async (clientId: string | number, contact: Omit<ClientContact, 'id' | 'client_id' | 'created_at' | 'updated_at'>): Promise<ClientContact> => {
        const { data } = await api.post(`/clients/${clientId}/contacts`, contact);
        return data;
    },

    updateContact: async (clientId: string | number, contactId: string | number, contact: Partial<ClientContact>): Promise<ClientContact> => {
        const { data } = await api.put(`/clients/${clientId}/contacts/${contactId}`, contact);
        return data;
    },

    deleteContact: async (clientId: string | number, contactId: string | number): Promise<void> => {
        await api.delete(`/clients/${clientId}/contacts/${contactId}`);
    },

    getHistory: async (): Promise<ClientHistory[]> => {
        const { data } = await api.get('/clients/history');
        return data;
    },
};
