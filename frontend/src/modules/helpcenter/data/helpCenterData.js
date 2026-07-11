// helpCenterData.js — all static data for the Help Center page

export const CATEGORIES = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'New to ResearchConnect? Start here with setup guides and onboarding tutorials.',
    count: 24,
    iconName: 'Rocket',
    iconColor: '#2563EB',
    iconBg: 'linear-gradient(135deg, #DBEAFE, #EDE9FE)',
    badgeBg: '#DBEAFE',
    badgeColor: '#2563EB',
    accentBorder: '#2563EB',
  },
  {
    id: 'publishing',
    name: 'Publishing Papers',
    description: 'Learn how to upload, format, and publish your research papers and preprints.',
    count: 18,
    iconName: 'Upload',
    iconColor: '#22C55E',
    iconBg: 'linear-gradient(135deg, #DCFCE7, #D1FAE5)',
    badgeBg: '#DCFCE7',
    badgeColor: '#22C55E',
    accentBorder: '#22C55E',
  },
  {
    id: 'account',
    name: 'Account & Profile',
    description: 'Manage your profile, privacy settings, notifications, and security options.',
    count: 15,
    iconName: 'UserCog',
    iconColor: '#4F46E5',
    iconBg: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
    badgeBg: '#EDE9FE',
    badgeColor: '#4F46E5',
    accentBorder: '#4F46E5',
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    description: 'Connect with co-authors, join research groups, and manage shared projects.',
    count: 22,
    iconName: 'Users',
    iconColor: '#22C55E',
    iconBg: 'linear-gradient(135deg, #DCFCE7, #D1FAE5)',
    badgeBg: '#DCFCE7',
    badgeColor: '#22C55E',
    accentBorder: '#22C55E',
  },
];

export const ARTICLES = [
  {
    id: 'upload-first-paper',
    title: 'How to upload your first paper',
    category: 'Getting Started',
    categoryColor: '#2563EB',
    categoryBg: '#DBEAFE',
    description:
      'Step-by-step guide to uploading, formatting, and publishing your research paper on ResearchConnect for the first time.',
  },
  {
    id: 'format-and-metadata',
    title: 'How to format and add metadata to your paper',
    category: 'Publishing',
    categoryColor: '#22C55E',
    categoryBg: '#DCFCE7',
    description:
      'Learn how to properly tag your paper with keywords, abstract, and DOI so it gets discovered by the right researchers.',
  },
  {
    id: 'institutional-verification',
    title: 'Setting up institutional verification',
    category: 'Account',
    categoryColor: '#4F46E5',
    categoryBg: '#EDE9FE',
    description:
      'Verify your institutional email to unlock researcher-only features and increase your profile credibility.',
  },
  {
    id: 'invite-coauthors',
    title: 'How to invite co-authors',
    category: 'Collaboration',
    categoryColor: '#22C55E',
    categoryBg: '#DCFCE7',
    description:
      'Add co-authors to your publications, manage authorship order, and handle authorship claims.',
  },
  {
    id: 'orcid-account',
    title: 'Connecting your ORCID account',
    category: 'Account',
    categoryColor: '#4F46E5',
    categoryBg: '#EDE9FE',
    description:
      'Link your ORCID iD to automatically sync your publication list and researcher profile.',
  },
  {
    id: 'research-feed',
    title: 'Using the research feed effectively',
    category: 'Getting Started',
    categoryColor: '#2563EB',
    categoryBg: '#DBEAFE',
    description:
      'Customize your research feed with keywords, follow researchers, and discover relevant new papers.',
  },
  {
    id: 'create-workspace',
    title: 'Creating a collaboration workspace',
    category: 'Collaboration',
    categoryColor: '#22C55E',
    categoryBg: '#DCFCE7',
    description:
      'Set up a shared workspace for your research team, assign roles, and manage collaborative documents and drafts.',
  },
  {
    id: 'notification-preferences',
    title: 'Managing notification preferences',
    category: 'Account',
    categoryColor: '#4F46E5',
    categoryBg: '#EDE9FE',
    description:
      'Control which email and in-app notifications you receive and how frequently.',
  },
];

export const TABS = ['All Topics', 'Getting Started', 'Publishing', 'Account', 'Collaboration'];

export const TUTORIALS = [
  {
    id: 'tut-1',
    category: 'Getting Started',
    categoryBg: '#DBEAFE',
    categoryColor: '#2563EB',
    thumbnailGradient: 'linear-gradient(135deg, #DBEAFE 0%, #EDE9FE 100%)',
    title: 'Complete Guide: Publishing Your First Paper',
    description:
      'Walk through the entire paper upload process from PDF to published in under 10 minutes.',
    duration: '8:24',
    views: '12.4k views',
    date: '2 weeks ago',
  },
  {
    id: 'tut-2',
    category: 'Collaboration',
    categoryBg: '#DCFCE7',
    categoryColor: '#22C55E',
    thumbnailGradient: 'linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)',
    title: 'Setting Up Your First Collaboration Workspace',
    description:
      'Learn how to create workspaces, invite team members, and manage roles for co-authored research.',
    duration: '6:15',
    views: '8.7k views',
    date: '1 month ago',
  },
  {
    id: 'tut-3',
    category: 'Collaboration',
    categoryBg: '#FEF3C7',
    categoryColor: '#F59E0B',
    thumbnailGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
    title: 'How to Find and Add Co-Authors',
    description:
      'Discover researchers in your field and collaborate on publications using ResearchConnect tools.',
    duration: '5:42',
    views: '6.2k views',
    date: '3 weeks ago',
  },
];

export const SYSTEM_SERVICES = [
  { name: 'Web Application', status: 'Operational' },
  { name: 'Search Engine', status: 'Operational' },
  { name: 'File Storage', status: 'Operational' },
  { name: 'Email Notifications', status: 'Operational' },
  { name: 'Real-time Messaging', status: 'Operational' },
];

// 30 uptime bars: index 14 is orange, rest green
export const UPTIME_BARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  status: i === 14 ? 'degraded' : 'operational',
}));

export const BOT_RESPONSES = {
  upload:
    'To upload a paper:\n1) Click the Upload Publication button in the sidebar\n2) Drag and drop your PDF\n3) Fill in metadata (auto-extracted)\n4) Set visibility\n5) Click Publish.\n\nWould you like a step-by-step video guide?',
  account:
    'For account help, go to Settings (gear icon in sidebar). You can update your profile, manage notifications, change your password, and connect your ORCID. What specific setting do you need help with?',
  password:
    'To reset your password:\n1) Go to the login page\n2) Click Forgot password\n3) Enter your institutional email\n4) Check your inbox for the reset link (expires in 1 hour).',
  fallback:
    "I'm not sure about that specific topic. Let me connect you with a human agent, or you can browse our Help Center articles above. Would you like me to search for relevant articles?",
};

export const QUICK_REPLY_CHIPS = [
  'How do I upload a paper?',
  'I need account help',
  'How do I reset my password?',
];

export const POPULAR_SEARCHES = [
  'Getting Started',
  'Upload Paper',
  'Co-Authors',
  'Account Settings',
  'Research Feed',
];
