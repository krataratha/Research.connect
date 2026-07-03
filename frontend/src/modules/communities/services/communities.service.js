import axiosInstance from '../../../api/axiosInstance';

const communitiesService = {
  getCommunities: (params) => axiosInstance.get('/v1/communities', { params }),
  getCommunityBySlug: (slug) => axiosInstance.get(`/v1/communities/${slug}`),
  createCommunity: (data) => axiosInstance.post('/v1/communities', data),
  joinCommunity: (id) => axiosInstance.post(`/v1/communities/${id}/join`),

  getPosts: (id, params) => axiosInstance.get(`/v1/communities/${id}/posts`, { params }),
  createPost: (id, data) => axiosInstance.post(`/v1/communities/${id}/posts`, data),
  createComment: (postId, data) => axiosInstance.post(`/v1/communities/posts/${postId}/comments`, data),

  createEvent: (id, data) => axiosInstance.post(`/v1/communities/${id}/events`, data),
  createJob: (id, data) => axiosInstance.post(`/v1/communities/${id}/jobs`, data),
  createAnnouncement: (id, data) => axiosInstance.post(`/v1/communities/${id}/announcements`, data),
};

export default communitiesService;
