import { b as api } from "./index-C4ZP3eFM.js";
const reportService = {
  async getReports(projectId) {
    const url = projectId ? `/reports?project_id=${projectId}` : "/reports";
    const response = await api.get(url);
    return response.data;
  },
  async getReport(id) {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },
  async uploadReport(data) {
    const formData = new FormData();
    formData.append("project_id", data.project_id);
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("report_file", data.report_file);
    const response = await api.post("/reports", formData);
    return response.data;
  },
  async updateReport(id, data) {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    if (data.report_file) formData.append("report_file", data.report_file);
    const response = await api.post(`/reports/${id}`, formData);
    return response.data;
  },
  async tlApprove(id, comment) {
    const response = await api.post(`/reports/${id}/tl-approve`, { comment });
    return response.data;
  },
  async hrApprove(id, comment) {
    const response = await api.post(`/reports/${id}/hr-approve`, { comment });
    return response.data;
  },
  async reject(id, comment) {
    const response = await api.post(`/reports/${id}/reject`, { comment });
    return response.data;
  },
  async addComment(id, comment) {
    const response = await api.post(`/reports/${id}/comment`, { comment });
    return response.data;
  }
};
export {
  reportService as r
};
