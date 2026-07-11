import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';

// Fetch My Publications
export const useMyPublications = () => {
  return useQuery({
    queryKey: ['myPublications'],
    queryFn: async () => {
      const { data } = await api.get('/publications/my');
      return data.data;
    },
  });
};

// Fetch Single Publication details
export const usePublicationDetails = (id) => {
  return useQuery({
    queryKey: ['publication', id],
    queryFn: async () => {
      const { data } = await api.get(`/publications/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Create Publication
export const useCreatePublication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pubData) => {
      const { data } = await api.post('/publications', pubData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPublications'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Update Publication
export const useUpdatePublication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pubData }) => {
      const { data } = await api.put(`/publications/${id}`, pubData);
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myPublications'] });
      queryClient.invalidateQueries({ queryKey: ['publication', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Delete Publication
export const useDeletePublication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/publications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPublications'] });
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Resolve DOI Metadata
export const useResolveDoi = () => {
  return useMutation({
    mutationFn: async (doi) => {
      const { data } = await api.get(`/publications/doi/${encodeURIComponent(doi)}`);
      return data.data;
    },
  });
};

// Upload Publication File (PDF, Dataset, etc.)
export const useUploadPublicationFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ publicationId, fileType, file }) => {
      const formData = new FormData();
      formData.append('publicationId', publicationId);
      formData.append('fileType', fileType);
      formData.append('file', file);
      const { data } = await api.post('/publications/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publication', variables.publicationId] });
      queryClient.invalidateQueries({ queryKey: ['myPublications'] });
    },
  });
};

// Remove Publication File
export const useRemovePublicationFile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileId }) => {
      await api.delete(`/publications/files/${fileId}`);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myPublications'] });
      // Note: We invalidate all publication queries to ensure details update
      queryClient.invalidateQueries({ queryKey: ['publication'] });
    },
  });
};

// Fetch Version History
export const useVersionHistory = (id) => {
  return useQuery({
    queryKey: ['publicationVersions', id],
    queryFn: async () => {
      const { data } = await api.get(`/publications/${id}/versions`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Rollback Version
export const useRollbackVersion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, versionNumber }) => {
      const { data } = await api.post(`/publications/${id}/rollback`, { versionNumber });
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publication', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['publicationVersions', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['myPublications'] });
    },
  });
};

// Search Publications
export const useSearchPublications = (queryParams) => {
  return useQuery({
    queryKey: ['searchPublications', queryParams],
    queryFn: async () => {
      const { data } = await api.get('/publications', { params: queryParams });
      return data.data;
    },
  });
};

// Comments Hooks
export const useComments = (pubId) => {
  return useQuery({
    queryKey: ['publicationComments', pubId],
    queryFn: async () => {
      const { data } = await api.get(`/publications/${pubId}/comments`);
      return data.data;
    },
    enabled: !!pubId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pubId, commentText, parentId }) => {
      const { data } = await api.post(`/publications/${pubId}/comments`, { commentText, parentId });
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publicationComments', variables.pubId] });
    },
  });
};
