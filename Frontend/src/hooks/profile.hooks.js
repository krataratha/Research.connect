import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';

// Fetch My Profile
export const useMyProfile = () => {
  return useQuery({
    queryKey: ['myProfile'],
    queryFn: async () => {
      const { data } = await api.get('/profile/me');
      return data.data;
    },
  });
};

// Fetch another user's profile
export const useUserProfile = (id) => {
  return useQuery({
    queryKey: ['userProfile', id],
    queryFn: async () => {
      const { data } = await api.get(`/profile/user/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

// Update Profile details
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData) => {
      const { data } = await api.put('/profile', profileData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Upload Photo (profile or cover)
export const useUploadPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, isCover }) => {
      const formData = new FormData();
      formData.append(isCover ? 'cover' : 'photo', file);
      const url = isCover ? '/profile/cover' : '/profile/photo';
      const { data } = await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Education CRUD Hooks
export const useAddEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eduData) => {
      const { data } = await api.post('/profile/education', eduData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

export const useUpdateEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, eduData }) => {
      const { data } = await api.put(`/profile/education/${id}`, eduData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

export const useDeleteEducation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/profile/education/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Experience CRUD Hooks
export const useAddExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expData) => {
      const { data } = await api.post('/profile/experience', expData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

export const useUpdateExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, expData }) => {
      const { data } = await api.put(`/profile/experience/${id}`, expData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

export const useDeleteExperience = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/profile/experience/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Awards CRUD Hooks
export const useAddAward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (awardData) => {
      const { data } = await api.post('/profile/awards', awardData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

export const useUpdateAward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, awardData }) => {
      const { data } = await api.put(`/profile/awards/${id}`, awardData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

export const useDeleteAward = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/profile/awards/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Certifications CRUD Hooks
export const useAddCertification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (certData) => {
      const { data } = await api.post('/profile/certifications', certData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

export const useUpdateCertification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, certData }) => {
      const { data } = await api.put(`/profile/certifications/${id}`, certData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

export const useDeleteCertification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`/profile/certifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Google Scholar Sync Hooks
export const useConnectScholar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scholarId) => {
      const { data } = await api.post('/profile/scholar/connect', { scholarId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['scholarStatus'] });
    },
  });
};

export const useSyncScholar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/profile/scholar/sync');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['scholarStatus'] });
    },
  });
};

export const useScholarStatus = () => {
  return useQuery({
    queryKey: ['scholarStatus'],
    queryFn: async () => {
      const { data } = await api.get('/profile/scholar/status');
      return data.data;
    },
  });
};

// Connect ORCID Hook
export const useConnectOrcid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orcid) => {
      const { data } = await api.post('/profile/orcid', { orcid });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Connect Scopus Hook
export const useConnectScopus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scopusId) => {
      const { data } = await api.post('/profile/scopus', { scopusId });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Connect ResearchGate Hook
export const useConnectResearchGate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (researchGateUrl) => {
      const { data } = await api.post('/profile/researchgate', { researchGateUrl });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
    },
  });
};

// Follow Researcher Hook
export const useFollowResearcher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.post('/profile/follow', { userId });
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables] });
    },
  });
};

// Unfollow Researcher Hook
export const useUnfollowResearcher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await api.post('/profile/unfollow', { userId });
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables] });
    },
  });
};

// Share Profile Hook
export const useShareProfile = () => {
  return useMutation({
    mutationFn: async (profileId) => {
      const { data } = await api.post('/profile/share', { profileId });
      return data.data;
    },
  });
};

// Disconnect Google Scholar
export const useDisconnectScholar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/profile/google-scholar/unlink');
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      queryClient.invalidateQueries({ queryKey: ['scholarStatus'] });
    },
  });
};

// Compare Google Scholar
export const useCompareScholar = () => {
  return useQuery({
    queryKey: ['scholarCompare'],
    queryFn: async () => {
      const { data } = await api.get('/profile/google-scholar/compare');
      return data.data;
    },
  });
};
