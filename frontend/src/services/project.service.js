import axiosInstance from '../api/axiosInstance';

const projectService = {
  getProjects: (params = {}) => axiosInstance.get('/v1/projects', { params }),
  createProject: (data) => axiosInstance.post('/v1/projects', data),
  updateProject: (id, data) => axiosInstance.patch(`/v1/projects/${id}`, data),
  applyToProject: (id, message) => axiosInstance.post(`/v1/projects/${id}/applications`, { message }),
  getApplications: (id) => axiosInstance.get(`/v1/projects/${id}/applications`),
  reviewApplication: (projectId, applicationId, action) => axiosInstance.patch(`/v1/projects/${projectId}/applications/${applicationId}`, { action }),
  deleteProject: (id) => axiosInstance.delete(`/v1/projects/${id}`)
};

export default projectService;
