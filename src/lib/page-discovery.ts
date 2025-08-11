// Note: File system operations removed for Cloudflare Workers compatibility

export interface PageInfo {
  title: string;
  url: string;
  category?: string;
}

// Map of routes to human-readable titles
const routeTitleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/marquee': 'Timeline',
  '/chat': 'AI Chat',
  '/chat2': 'Chat v2',
  '/chris-messages': 'Chris Messages',
  '/dashboard2': 'Dashboard v2',
  '/events': 'Events',
  '/home2': 'Home v2',
  '/messages-fixed': 'Messages',
  '/protected': 'Protected',
  '/sitemap': 'Sitemap',
  '/test': 'Test',
  '/timeline': 'Timeline',
  '/upload': 'Upload',
  '/auth/login': 'Login',
  '/auth/sign-up': 'Sign Up',
  '/auth/forgot-password': 'Forgot Password',
  '/auth/update-password': 'Update Password',
  '/auth/error': 'Auth Error',
  '/auth/sign-up-success': 'Sign Up Success',
};

// Categorize pages
const pageCategories: Record<string, string> = {
  '/auth/login': 'Authentication',
  '/auth/sign-up': 'Authentication',
  '/auth/forgot-password': 'Authentication',
  '/auth/update-password': 'Authentication',
  '/auth/error': 'Authentication',
  '/auth/sign-up-success': 'Authentication',
  '/chat': 'Communication',
  '/chat2': 'Communication',
  '/chris-messages': 'Communication',
  '/messages-fixed': 'Communication',
  '/events': 'Tracking',
  '/timeline': 'Tracking',
  '/upload': 'Tools',
  '/test': 'Development',
  '/sitemap': 'Development',
  '/protected': 'Development',
};


// Static export for build time
export function getStaticPageList(): PageInfo[] {
  // This is a static list that matches the discovered pages
  // Used during build time when file system access isn't available
  return [
    // Main pages
    { title: 'Dashboard', url: '/', category: 'Main' },
    { title: 'Dashboard v2', url: '/dashboard2', category: 'Main' },
    { title: 'Home v2', url: '/home2', category: 'Main' },
    
    // Communication
    { title: 'Intelligence Hub', url: '/intelligence', category: 'Communication' },
    { title: 'AI Chat', url: '/chat', category: 'Communication' },
    { title: 'Chat v2', url: '/chat2', category: 'Communication' },
    { title: 'Chris Messages', url: '/chris-messages', category: 'Communication' },
    { title: 'Messages', url: '/messages-fixed', category: 'Communication' },
    
    // Tracking
    { title: 'Events', url: '/events', category: 'Tracking' },
    { title: 'Timeline', url: '/timeline', category: 'Tracking' },
    { title: 'Marquee Timeline', url: '/marquee', category: 'Tracking' },
    
    // Tools
    { title: 'Upload', url: '/upload', category: 'Tools' },
    
    // Development
    { title: 'Protected', url: '/protected', category: 'Development' },
    { title: 'Sitemap', url: '/sitemap', category: 'Development' },
    { title: 'Test', url: '/test', category: 'Development' },
    
    // Authentication
    { title: 'Login', url: '/auth/login', category: 'Authentication' },
    { title: 'Sign Up', url: '/auth/sign-up', category: 'Authentication' },
    { title: 'Forgot Password', url: '/auth/forgot-password', category: 'Authentication' },
    { title: 'Update Password', url: '/auth/update-password', category: 'Authentication' },
    { title: 'Auth Error', url: '/auth/error', category: 'Authentication' },
    { title: 'Sign Up Success', url: '/auth/sign-up-success', category: 'Authentication' },
  ];
}