import { api } from "./api";

export const zohoService = {
  getAuthUrl: async () => {
    const response = await api.get("/zoho/auth-url");
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get("/zoho/status");
    return response.data;
  },

  getFolders: async (accountId?: string) => {
    const response = await api.get("/zoho/folders", {
      params: { account_id: accountId },
    });
    return response.data;
  },

  getMessages: async (folderId: string, params: any = {}) => {
    const response = await api.get(`/zoho/folders/${folderId}/messages`, {
      params,
    });
    return response.data;
  },

  getMessageContent: async (folderId: string, messageId: string) => {
    const response = await api.get(`/zoho/folders/${folderId}/messages/${messageId}/content`);
    return response.data;
  },

  sendMessage: async (data: any) => {
    const response = await api.post("/zoho/messages", data);
    return response.data;
  },

  deleteMessage: async (folderId: string, messageId: string) => {
    const response = await api.delete(`/zoho/folders/${folderId}/messages/${messageId}`);
    return response.data;
  },

  uploadAttachment: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/zoho/messages/attachments", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  handleCallback: async (code: string) => {
    const response = await api.get("/zoho/callback", {
      params: { code },
    });
    return response.data;
  },
};
