import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES_P0,
  MOCK_MESSAGES_P1,
  MOCK_USERS,
  CURRENT_USER,
} from '../data/mockData';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const messagingApi = {
  /** GET /conversations */
  async getConversations() {
    await delay(700);
    return JSON.parse(JSON.stringify(MOCK_CONVERSATIONS)); // deep clone
  },

  /**
   * GET /conversations/:id/messages?page=N
   * Backend returns newest-first; frontend reverses to chronological order.
   * @returns {{ messages: Message[], hasMore: boolean, page: number }}
   */
  async getMessages(convId, page = 0) {
    await delay(550);
    const pages = {
      0: MOCK_MESSAGES_P0[convId] || [],
      1: MOCK_MESSAGES_P1[convId] || [],
    };
    const msgs = pages[page] || [];
    const hasMore = page === 0 && (MOCK_MESSAGES_P1[convId]?.length ?? 0) > 0;
    return { messages: JSON.parse(JSON.stringify(msgs)), hasMore, page };
  },

  /**
   * POST /conversations/:id/messages
   * Simulates 5% random send failure for optimistic-UI testing.
   */
  async sendMessage(convId, content, attachments = []) {
    await delay(380 + Math.random() * 250);
    if (Math.random() < 0.05) throw new Error('Network error — please retry');
    return {
      id: `msg-${Date.now()}`,
      content,
      messageType: 'text',
      senderId: CURRENT_USER.id,
      senderName: CURRENT_USER.fullName,
      senderAvatarUrl: CURRENT_USER.avatarUrl,
      createdAt: new Date().toISOString(),
      readAt: null,
      attachments,
    };
  },

  /** PATCH /messages/:id/read */
  async markRead(messageId) {
    await delay(150);
    return { readAt: new Date().toISOString() };
  },

  /**
   * POST /upload  (multipart/form-data)
   * Fake progress is handled by the caller via the onProgress callback.
   */
  async uploadFile(file, onProgress) {
    // Simulate incremental progress
    let progress = 0;
    const tick = setInterval(() => {
      progress = Math.min(progress + 15, 85);
      onProgress?.(progress);
    }, 200);

    await delay(2000);
    clearInterval(tick);
    onProgress?.(100);

    return {
      id: `att-${Date.now()}`,
      fileName: file.name,
      fileSizeBytes: file.size,
      fileType: file.type,
      cdnUrl: '#',
    };
  },

  /** GET /users/:id */
  async getUserProfile(userId) {
    await delay(480);
    const user = MOCK_USERS[userId];
    if (!user) throw new Error(`User ${userId} not found`);
    return JSON.parse(JSON.stringify(user));
  },

  /** PATCH /users/presence */
  async updatePresence(isOnline) {
    await delay(80);
    return { isOnline };
  },
};
