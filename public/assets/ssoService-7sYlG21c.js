import { b as api } from "./index-C4ZP3eFM.js";
async function validateAuthorize(params) {
  const query = new URLSearchParams(params).toString();
  const { data } = await api.get(`/oauth/authorize?${query}`);
  return data;
}
async function approveAuthorize(payload) {
  const { data } = await api.post("/oauth/authorize", payload);
  return data;
}
async function listClients() {
  const { data } = await api.get("/oauth/clients");
  return data;
}
async function createClient(payload) {
  const { data } = await api.post("/oauth/clients", payload);
  return data;
}
async function updateClient(id, payload) {
  const { data } = await api.put(`/oauth/clients/${id}`, payload);
  return data;
}
async function deleteClient(id) {
  await api.delete(`/oauth/clients/${id}`);
}
async function regenerateSecret(id) {
  const { data } = await api.post(`/oauth/clients/${id}/regenerate-secret`);
  return data;
}
export {
  approveAuthorize as a,
  createClient as c,
  deleteClient as d,
  listClients as l,
  regenerateSecret as r,
  updateClient as u,
  validateAuthorize as v
};
