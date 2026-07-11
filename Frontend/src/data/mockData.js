// ─── Current logged-in user ────────────────────────────────────────────────
export const CURRENT_USER = {
  id: 'user-me',
  fullName: 'Dr. James Wilson',
  avatarUrl:
    'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=64&h=64&fit=crop&q=80',
  isOnline: true,
};

// ─── Other users ────────────────────────────────────────────────────────────
export const MOCK_USERS = {
  'user-sarah': {
    id: 'user-sarah',
    fullName: 'Dr. Sarah Jenkins',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&q=80',
    avatarUrlLg:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&q=80',
    isOnline: true,
    institution: 'MIT Applied Sciences Lab',
    department: 'Applied Chemistry',
    positionTitle: 'Senior Researcher',
    citationsCount: 1284,
    hIndex: 24,
    topPublications: [
      {
        title: '"Novel Approaches to Carbon Capture in Urban Infrastructures"',
        journal: 'Nature Sustainability',
        year: 2023,
      },
      {
        title: '"Solvent Optimization for Industrial Carbon Sequestration"',
        journal: 'Chemical Science Journal',
        year: 2022,
      },
    ],
    sharedProjects: [
      { id: 'p1', name: 'UrbanCarbon 2025', color: '#4F46E5', bgColor: '#EEF2FF', icon: 'beaker' },
      { id: 'p2', name: 'Global Emissions Audit', color: '#F59E0B', bgColor: '#FFF7ED', icon: 'cloud' },
    ],
  },
  'user-marcus': {
    id: 'user-marcus',
    fullName: 'Dr. Marcus Chen',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&q=80',
    avatarUrlLg:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&h=160&fit=crop&q=80',
    isOnline: false,
    institution: 'Stanford AstroBiology Institute',
    department: 'Astrobiology',
    positionTitle: 'Research Lead',
    citationsCount: 856,
    hIndex: 18,
    topPublications: [
      {
        title: '"Methane Biosignatures in Exoplanetary Atmospheres"',
        journal: 'Astrobiology Journal',
        year: 2024,
      },
    ],
    sharedProjects: [
      { id: 'p3', name: 'AstroBio Initiative', color: '#22C55E', bgColor: '#DCFCE7', icon: 'beaker' },
    ],
  },
  'user-aris': {
    id: 'user-aris',
    fullName: 'Prof. Aris Thorne',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&q=80',
    avatarUrlLg:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&q=80',
    isOnline: false,
    institution: 'Oxford History of Science',
    department: 'History & Philosophy of Science',
    positionTitle: 'Professor',
    citationsCount: 3421,
    hIndex: 42,
    topPublications: [
      {
        title: '"The Epistemology of Scientific Revolutions"',
        journal: 'Philosophy of Science',
        year: 2021,
      },
      {
        title: '"Paradigm Shifts in Climate Science Discourse"',
        journal: 'Science & Technology Studies',
        year: 2019,
      },
    ],
    sharedProjects: [],
  },
};

// ─── Conversations ───────────────────────────────────────────────────────────
export const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    isGroup: false,
    participants: [CURRENT_USER, MOCK_USERS['user-sarah']],
    lastMessage: {
      content: "I've attached the new dataset for the peer review...",
      timestamp: new Date(Date.now() - 5 * 60_000).toISOString(),
      senderName: 'Sarah',
    },
    unreadCount: 0,
  },
  {
    id: 'conv-2',
    isGroup: true,
    groupName: 'AstroBio Lab Group',
    participants: [CURRENT_USER, MOCK_USERS['user-marcus']],
    lastMessage: {
      content: "Marcus: Let's finalize the abstract by Friday.",
      timestamp: new Date(Date.now() - 45 * 60_000).toISOString(),
      senderName: 'Marcus',
    },
    unreadCount: 2,
  },
  {
    id: 'conv-3',
    isGroup: false,
    participants: [CURRENT_USER, MOCK_USERS['user-aris']],
    lastMessage: {
      content: 'The references in Chapter 4 need more detail...',
      timestamp: new Date(Date.now() - 24 * 3_600_000).toISOString(),
      senderName: 'Aris',
    },
    unreadCount: 0,
  },
  {
    id: 'conv-4',
    isGroup: true,
    groupName: 'Deep Learning 2024',
    participants: [CURRENT_USER],
    lastMessage: {
      content: 'You: Sent the Python script for the model.',
      timestamp: new Date(Date.now() - 3 * 24 * 3_600_000).toISOString(),
      senderName: 'You',
    },
    unreadCount: 0,
  },
];

// ─── Messages — Page 0 (newest, backend returns newest-first) ────────────────
const SARAH_AVA = MOCK_USERS['user-sarah'].avatarUrl;
const ME_AVA = CURRENT_USER.avatarUrl;

export const MOCK_MESSAGES_P0 = {
  'conv-1': [
    {
      id: 'msg-c1-4',
      content: "Got them. Reviewing now. Let's touch base in an hour?",
      messageType: 'text',
      senderId: 'user-me',
      senderName: 'Dr. James Wilson',
      senderAvatarUrl: ME_AVA,
      createdAt: new Date(Date.now() - 35 * 60_000).toISOString(),
      readAt: null,
      attachments: [],
    },
    {
      id: 'msg-c1-3',
      content:
        'Yes, the 5% increase was key. Here is the full dataset and the updated draft of our methodology section.',
      messageType: 'text',
      senderId: 'user-sarah',
      senderName: 'Dr. Sarah Jenkins',
      senderAvatarUrl: SARAH_AVA,
      createdAt: new Date(Date.now() - 36 * 60_000).toISOString(),
      readAt: null,
      attachments: [
        {
          id: 'att-1',
          fileName: 'Carbon_Analysis_Q3.pdf',
          fileSizeBytes: 4_404_019,
          fileType: 'application/pdf',
          cdnUrl: '#',
        },
        {
          id: 'att-2',
          fileName: 'Solvent_Trial_Data_V2.xlsx',
          fileSizeBytes: 1_887_437,
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          cdnUrl: '#',
        },
      ],
    },
    {
      id: 'msg-c1-2',
      content:
        "That's fantastic news, Sarah. Did the adjustment to the solvent concentration make the difference? I'd love to see the raw data when you have a moment.",
      messageType: 'text',
      senderId: 'user-me',
      senderName: 'Dr. James Wilson',
      senderAvatarUrl: ME_AVA,
      createdAt: new Date(Date.now() - 42 * 60_000).toISOString(),
      readAt: new Date(Date.now() - 38 * 60_000).toISOString(),
      attachments: [],
    },
    {
      id: 'msg-c1-1',
      content:
        "Hello! I've finally finished the preliminary analysis on the CO2 capture metrics. The results are looking much more promising than we initially thought.",
      messageType: 'text',
      senderId: 'user-sarah',
      senderName: 'Dr. Sarah Jenkins',
      senderAvatarUrl: SARAH_AVA,
      createdAt: new Date(Date.now() - 45 * 60_000).toISOString(),
      readAt: null,
      attachments: [],
    },
  ],

  'conv-2': [
    {
      id: 'msg-c2-2',
      content: "Let's finalize the abstract by Friday. I'll draft the methods section tonight.",
      messageType: 'text',
      senderId: 'user-marcus',
      senderName: 'Dr. Marcus Chen',
      senderAvatarUrl: MOCK_USERS['user-marcus'].avatarUrl,
      createdAt: new Date(Date.now() - 45 * 60_000).toISOString(),
      readAt: null,
      attachments: [],
    },
    {
      id: 'msg-c2-1',
      content: 'The new biosignature data from SETI is very promising. Uploading it now.',
      messageType: 'text',
      senderId: 'user-me',
      senderName: 'Dr. James Wilson',
      senderAvatarUrl: ME_AVA,
      createdAt: new Date(Date.now() - 60 * 60_000).toISOString(),
      readAt: new Date(Date.now() - 55 * 60_000).toISOString(),
      attachments: [],
    },
  ],

  'conv-3': [
    {
      id: 'msg-c3-2',
      content:
        'The references in Chapter 4 need more detail, especially the primary sources from the 1960s.',
      messageType: 'text',
      senderId: 'user-aris',
      senderName: 'Prof. Aris Thorne',
      senderAvatarUrl: MOCK_USERS['user-aris'].avatarUrl,
      createdAt: new Date(Date.now() - 24 * 3_600_000).toISOString(),
      readAt: null,
      attachments: [],
    },
    {
      id: 'msg-c3-1',
      content: "I'll review Chapter 4 thoroughly and send feedback by tomorrow.",
      messageType: 'text',
      senderId: 'user-me',
      senderName: 'Dr. James Wilson',
      senderAvatarUrl: ME_AVA,
      createdAt: new Date(Date.now() - 25 * 3_600_000).toISOString(),
      readAt: new Date(Date.now() - 24 * 3_600_000 - 10 * 60_000).toISOString(),
      attachments: [],
    },
  ],

  'conv-4': [],
};

// ─── Messages — Page 1 (older messages, only for conv-1) ────────────────────
export const MOCK_MESSAGES_P1 = {
  'conv-1': [
    {
      id: 'msg-c1-p1-3',
      content: "Perfect. I'll prepare a summary of the key findings alongside the raw data.",
      messageType: 'text',
      senderId: 'user-me',
      senderName: 'Dr. James Wilson',
      senderAvatarUrl: ME_AVA,
      createdAt: new Date(Date.now() - 2 * 3_600_000).toISOString(),
      readAt: new Date(Date.now() - 2 * 3_600_000 + 120_000).toISOString(),
      attachments: [],
    },
    {
      id: 'msg-c1-p1-2',
      content:
        "I'll send you the preliminary results from last week's trials. The CO2 absorption rate has improved by 12%.",
      messageType: 'text',
      senderId: 'user-sarah',
      senderName: 'Dr. Sarah Jenkins',
      senderAvatarUrl: SARAH_AVA,
      createdAt: new Date(Date.now() - 2 * 3_600_000 - 5 * 60_000).toISOString(),
      readAt: null,
      attachments: [],
    },
    {
      id: 'msg-c1-p1-1',
      content:
        'Good morning Sarah! How are the Q3 trials progressing? We need the data for the board presentation next week.',
      messageType: 'text',
      senderId: 'user-me',
      senderName: 'Dr. James Wilson',
      senderAvatarUrl: ME_AVA,
      createdAt: new Date(Date.now() - 2 * 3_600_000 - 30 * 60_000).toISOString(),
      readAt: new Date(Date.now() - 2 * 3_600_000 - 25 * 60_000).toISOString(),
      attachments: [],
    },
  ],
};

// ─── Auto-reply pool (Sarah) ─────────────────────────────────────────────────
export const SARAH_AUTO_REPLIES = [
  "I was thinking we should schedule a proper call to walk through the methodology. Does tomorrow at 3 PM work for you?",
  "By the way, the peer reviewers flagged our temperature coefficient section. Can we add a supplementary data table?",
  "Great news! I just heard from the journal — they've extended our submission deadline by two more weeks! 🎉",
  "Should we bring in Dr. Patel from the thermodynamics department? His insight on the solvent kinetics could really strengthen the paper.",
  "I've started drafting the Discussion section. I'll share a first pass by end of day.",
  "Just re-ran the replication test — the 5% solvent increase holds consistently across all four sample groups. Very encouraging!",
  "Can you double-check my error bars on Figure 3? I want to make sure we're accounting for all the measurement uncertainty.",
  "I've pushed the revised methodology to the shared drive. Let me know if the changes address the reviewers' concerns.",
];

// ─── Time formatting utilities ───────────────────────────────────────────────
export function formatConvTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays === 0) return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatMsgTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function formatLastSeen(isoString) {
  if (!isoString) return 'Offline';
  const diffMs = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diffMs / 60_000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}
