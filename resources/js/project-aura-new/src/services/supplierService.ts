import { api } from './api';
import { Supplier } from '@/types/supplier';
import { PaginationMeta } from './clientService';

export const supplierService = {
    getPaginated: async (search?: string, page = 1, perPage = 15): Promise<{ data: Supplier[]; meta: PaginationMeta }> => {
        const { data } = await api.get('/suppliers', {
            params: { search: search || undefined, page, per_page: perPage }
        });
        return data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/suppliers/${id}`);
    },
};
