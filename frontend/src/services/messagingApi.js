import axiosInstance from '../api/axiosInstance';
import { CURRENT_USER } from '../data/mockData';

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?background=DBEAFE&color=2563EB&name=Researcher';

const profileCache = new Map();

const parseStoredJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const getCurrentUser = () => {
  const storedUser = parseStoredJson('user');
  const storedProfile = parseStoredJson('profile');
  const merged = { ...storedUser, ...storedProfile };
  const id = merged._id || merged.id || merged.userId || merged.user || CURRENT_USER.id;
  const fullName =
    merged.fullName ||
    [merged.firstName, merged.lastName].filter(Boolean).join(' ') ||
    CURRENT_USER.fullName;
  const avatarUrl =
    merged.profileImage ||
    merged.avatarUrl ||
    merged.avatar ||
    CURRENT_USER.avatarUrl;

  return {
    ...CURRENT_USER,
    ...merged,
    id: String(id),
    backendId: id ? String(id) : null,
    fullName,
    avatarUrl,
  };
};

const unwrap = (response) => response?.data ?? response;

const getPageDocs = (payload) => {
  const data = unwrap(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.docs)) return data.docs;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getPagination = (payload) => {
  const data = unwrap(payload);
  return {
    page: Number(data?.page || 1),
    totalPages: Number(data?.totalPages || 1),
  };
};

const makeAvatarUrl = (name) =>
  `https://ui-avatars.com/api/?background=DBEAFE&color=2563EB&name=${encodeURIComponent(name || 'Researcher')}`;

const normalizeUser = (user, currentUser = getCurrentUser()) => {
  if (!user) {
    return {
      id: `unknown-${Date.now()}`,
      backendId: null,
      fullName: 'Unknown Researcher',
      avatarUrl: makeAvatarUrl('Unknown Researcher'),
      avatarUrlLg: makeAvatarUrl('Unknown Researcher'),
      isOnline: false,
      institution: '',
      department: '',
      positionTitle: '',
      citationsCount: 0,
      hIndex: 0,
      topPublications: [],
      sharedProjects: [],
    };
  }

  const rawId = user._id || user.id || user;
  const isCurrentUser = rawId && currentUser.backendId && String(rawId) === String(currentUser.backendId);
  const fullName =
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    (isCurrentUser ? currentUser.fullName : 'Researcher');
  const avatarUrl =
    user.profileImage ||
    user.avatarUrl ||
    user.avatar ||
    (isCurrentUser ? currentUser.avatarUrl : makeAvatarUrl(fullName));

  const normalized = {
    id: rawId ? String(rawId) : `unknown-${Date.now()}`,
    backendId: rawId ? String(rawId) : null,
    fullName,
    avatarUrl,
    avatarUrlLg: avatarUrl,
    isOnline: false,
    institution: user.institution || user.organization || '',
    department: user.department || user.researcherType || '',
    positionTitle: user.positionTitle || user.role || 'Researcher',
    citationsCount: user.citationsCount || 0,
    hIndex: user.hIndex || 0,
    topPublications: user.topPublications || [],
    sharedProjects: user.sharedProjects || [],
  };

  if (normalized.backendId) profileCache.set(normalized.id, normalized);
  return normalized;
};

const normalizeAttachment = (attachment, index = 0) => {
  if (typeof attachment === 'string') {
    return {
      id: `att-${index}-${attachment}`,
      fileName: attachment.split('/').pop() || 'Attachment',
      fileSizeBytes: 0,
      fileType: 'application/octet-stream',
      cdnUrl: attachment,
    };
  }
  return {
    id: attachment.id || attachment._id || `att-${index}`,
    fileName: attachment.fileName || attachment.filename || attachment.name || attachment.url || 'Attachment',
    fileSizeBytes: attachment.fileSizeBytes || attachment.fileSize || attachment.size || 0,
    fileType: attachment.fileType || attachment.type || 'application/octet-stream',
    cdnUrl: attachment.cdnUrl || attachment.url || '#',
  };
};

const normalizeMessage = (message, currentUser = getCurrentUser()) => {
  const sender = normalizeUser(message.sender, currentUser);
  const senderId =
    message.senderId ||
    (String(message.sender?._id || message.sender || '') === String(currentUser.backendId)
      ? (currentUser.backendId || CURRENT_USER.id)
      : sender.id);

  return {
    id: message._id || message.id,
    content: message.text || message.content || '',
    messageType: message.type || message.messageType || 'text',
    senderId,
    senderName: sender.fullName,
    senderAvatarUrl: sender.avatarUrl,
    createdAt: message.createdAt || new Date().toISOString(),
    readAt: message.readAt || (message.readBy?.length ? message.updatedAt : null),
    attachments: message.attachments 
      ? message.attachments.map(normalizeAttachment) 
      : message.attachment 
        ? [normalizeAttachment(message.attachment)] 
        : [],
  };
};

const normalizeConversation = (conversation, currentUser = getCurrentUser()) => {
  const participants = (conversation.participants || []).map((participant) =>
    normalizeUser(participant, currentUser)
  );
  
  const currentId = currentUser?.backendId || CURRENT_USER.id;
  const hasCurrentUser = participants.some((participant) => participant.id === currentId);

  if (!hasCurrentUser) {
    participants.unshift({
      ...currentUser,
      id: currentId,
      isOnline: true,
    });
  }

  // Mongoose populate might have removed the other user if they don't exist in the DB.
  // We must ensure there is an 'other' participant.
  if (participants.length === 1) {
    participants.push(normalizeUser(null, currentUser));
  }

  const lastMessage = conversation.lastMessage
    ? normalizeMessage(conversation.lastMessage, currentUser)
    : null;

  return {
    id: conversation._id || conversation.id,
    backendId: conversation._id || conversation.id,
    isGroup: conversation.type === 'group',
    groupName: conversation.title || 'Group chat',
    participants,
    lastMessage: lastMessage
      ? {
          content: lastMessage.content,
          timestamp: lastMessage.createdAt || conversation.lastMessageAt,
          senderName: lastMessage.senderName,
        }
      : null,
    unreadCount: conversation.unreadCount || 0,
  };
};

const toBackendAttachments = (attachments = []) =>
  attachments.map((attachment) => attachment.cdnUrl || attachment.url || attachment.fileName || String(attachment));

export const messagingApi = {
  async getConversations() {
    const response = await axiosInstance.get('/v1/messages', {
      params: { sort: '-lastMessageAt', limit: 50 },
    });
    const currentUser = getCurrentUser();
    return getPageDocs(response).map((conversation) => normalizeConversation(conversation, currentUser));
  },

  async createConversation(participantId) {
    const response = await axiosInstance.get(`/v1/messages/with/${participantId}`);
    return normalizeConversation(unwrap(response), getCurrentUser());
  },

  async getMessages(convId, page = 0) {
    const response = await axiosInstance.get(`/v1/messages/${convId}`, {
      params: {
        page: Number(page) + 1,
        limit: 25,
        sort: '-createdAt',
      },
    });
    const currentUser = getCurrentUser();
    const pagination = getPagination(response);
    const messages = getPageDocs(response).map((message) => normalizeMessage(message, currentUser));

    return {
      messages,
      hasMore: pagination.page < pagination.totalPages,
      page,
    };
  },

  async sendMessage(convId, content, attachments = []) {
    const attachmentId = attachments.length > 0 ? attachments[0].id : undefined;
    const response = await axiosInstance.post(`/v1/messages/send`, {
      conversationId: convId,
      text: content,
      attachmentId
    });
    return normalizeMessage(unwrap(response), getCurrentUser());
  },

  async markRead(messageId) {
    return { readAt: new Date().toISOString(), messageId };
  },

  async markConversationRead(convId) {
    const response = await axiosInstance.patch(`/v1/messages/${convId}/read`);
    return unwrap(response);
  },

  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/v1/messages/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        onProgress?.(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      },
    });

    const uploaded = unwrap(response);
    const url = uploaded?.url || uploaded?.secure_url || uploaded?.path || uploaded?.fileUrl;

    return {
      id: uploaded?._id || uploaded?.id || `att-${Date.now()}`,
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type,
      cdnUrl: url || DEFAULT_AVATAR,
    };
  },

  async getUserProfile(userId) {
    // We want to fetch the real, full profile with metrics and publications from the backend.
    // The previously cached version (from normalizeUser) only has basic data (name/avatar).
    try {
      // Try fetching by profileSlug first (more reliable), then fall back to userId
      const response = await axiosInstance.get(`/v1/profile/${userId}`);
      const raw = response?.data?.data || response?.data || {};

      const profile = {
        id: userId,
        backendId: raw._id || raw.id || userId,
        profileSlug: raw.profileSlug || raw.username || userId,
        fullName:
          raw.fullName ||
          [raw.firstName, raw.lastName].filter(Boolean).join(' ') ||
          'Researcher',
        avatarUrl:
          raw.profileImage || raw.avatarUrl || raw.avatar ||
          makeAvatarUrl(raw.fullName || 'Researcher'),
        avatarUrlLg:
          raw.profileImageLg || raw.profileImage || raw.avatarUrl || raw.avatar ||
          makeAvatarUrl(raw.fullName || 'Researcher'),
        institution: raw.institution || raw.organization || '',
        department: raw.department || raw.researcherType || '',
        positionTitle: raw.positionTitle || raw.role || 'Researcher',
        citationsCount:
          raw.citationsCount || raw.metrics?.citationsCount || raw.totalCitations || 0,
        hIndex:
          raw.hIndex || raw.metrics?.hIndex || raw.h_index || 0,
        topPublications: (raw.topPublications || raw.publications || []).slice(0, 3).map((p) => ({
          title: p.title || p.name || '',
          journal: p.journal || p.venue || p.publisher || '',
          year: p.year || p.publishedYear || '',
        })),
        sharedProjects: [],
      };

      profileCache.set(userId, profile);
      return profile;
    } catch {
      // Return minimal fallback — don't crash the UI
      return profileCache.get(userId) || {
        id: userId,
        fullName: 'Researcher',
        avatarUrl: makeAvatarUrl('Researcher'),
        avatarUrlLg: makeAvatarUrl('Researcher'),
        institution: '',
        department: '',
        positionTitle: 'Researcher',
        citationsCount: 0,
        hIndex: 0,
        topPublications: [],
        sharedProjects: [],
      };
    }
  },

  async updatePresence(isOnline) {
    return { isOnline };
  },
};
