import { b as api } from "./index-C4ZP3eFM.js";
const clientService = {
  getAll: async (search) => {
    const { data } = await api.get("/clients", {
      params: { search }
    });
    return data;
  },
  getPaginated: async (search, page = 1, perPage = 15) => {
    const { data } = await api.get("/clients", {
      params: { search: search || void 0, page, per_page: perPage }
    });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/clients/${id}`);
    return data;
  },
  create: async (client) => {
    const { data } = await api.post("/clients", client);
    return data;
  },
  update: async (id, client) => {
    const { data } = await api.put(`/clients/${id}`, client);
    return data;
  },
  delete: async (id) => {
    await api.delete(`/clients/${id}`);
  },
  addContact: async (clientId, contact) => {
    const { data } = await api.post(`/clients/${clientId}/contacts`, contact);
    return data;
  },
  updateContact: async (clientId, contactId, contact) => {
    const { data } = await api.put(`/clients/${clientId}/contacts/${contactId}`, contact);
    return data;
  },
  deleteContact: async (clientId, contactId) => {
    await api.delete(`/clients/${clientId}/contacts/${contactId}`);
  },
  getHistory: async () => {
    const { data } = await api.get("/clients/history");
    return data;
  }
};
export {
  clientService as c
};
