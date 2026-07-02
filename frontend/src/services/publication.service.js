import axiosInstance from '../api/axiosInstance';

class PublicationService {
  // Create / Publish publication
  async createPublication(data) {
    return await axiosInstance.post('/v1/publications', data);
  }

  // Save publication draft
  async saveDraft(data) {
    return await axiosInstance.post('/v1/publications/save-draft', data);
  }

  // Publish publication (from draft or wizard)
  async publish(data) {
    return await axiosInstance.post('/v1/publications/publish', data);
  }

  // Upload file (PDF, DOCX, etc.) with progress tracking
  async uploadFile(formData, onUploadProgress) {
    return await axiosInstance.post('/v1/publications/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  }

  // Get My Publications (with drafts, trash, filters)
  async getMyPublications(params) {
    return await axiosInstance.get('/v1/publications/my', { params });
  }

  // Extract Metadata from PDF/DOCX buffer
  async extractMetadata(formData) {
    return await axiosInstance.post('/v1/publications/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  // Retrieve cached metadata by ID
  async getMetadataCache(id) {
    return await axiosInstance.get(`/v1/publications/metadata/${id}`);
  }

  // Retrieve publications list (supports page, limit, userId filters)
  async getPublications(params) {
    return await axiosInstance.get('/v1/publications', { params });
  }

  // Get researcher profile publications portfolio publicly
  async getPublicationsByProfileSlug(profileSlug, params) {
    return await axiosInstance.get(`/v1/publications/profile/${profileSlug}`, { params });
  }

  // Get single publication by SEO Slug
  async getPublicationBySlug(slug) {
    return await axiosInstance.get(`/v1/publications/${slug}`);
  }

  // Get publication details for reader (tracks reading analytics)
  async getPublicationForReader(slug) {
    return await axiosInstance.get(`/v1/publications/read/${slug}`);
  }

  // Update publication basic info / files / status
  async updatePublication(id, data) {
    return await axiosInstance.patch(`/v1/publications/${id}`, data);
  }

  // Delete publication
  async deletePublication(id) {
    return await axiosInstance.delete(`/v1/publications/${id}`);
  }

  // Restore soft-deleted publication
  async restorePublication(id) {
    return await axiosInstance.post(`/v1/publications/${id}/restore`);
  }

  // Record a download event and increment count
  async trackDownload(id) {
    return await axiosInstance.post(`/v1/publications/${id}/download`);
  }
}

export default new PublicationService();
