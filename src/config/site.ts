// The one place for the things every page shares: the navigation, the footer
// links, the Skool join link and the site's "next step".
// Change something here and every Astro page picks it up on the next build.
// (Older pages in public/ still carry their own copies until they are rebuilt;
// LINK-REPORT.md lists them.)

export const site = {
  name: 'Wise Women Use AI',
  url: 'https://www.wisewomenuseai.com',
  email: 'hello@wisewomenuseai.com',
  logo: '/assets/logos/WWUAI%20Logo%20OGTP.png',
  ogImage: 'https://www.wisewomenuseai.com/assets/social/og-card.jpg',
  locale: 'en_AU',
};

// Where people join the paid membership on Skool. The free community closed on
// 11 Nov 2026, so nothing on the site should point at the Skool community
// root, its "about" page or a classroom lesson: send people to /architect.
export const skool = {
  join: 'https://www.skool.com/wise-women-use-ai-1109/plans',
};

// The site's next step. NextStep, the following button and the offer panel all
// read this, so changing the offer is a one-line edit.
export const nextStep = {
  label: 'Explore Architect Advantage',
  href: '/architect',
  // Closing-band wording (the home page's, approved 11 Nov 2026). A page can
  // pass its own through the NextStep slots.
  title: 'Keep the work that needs you. Redesign the <span class="em">rest</span>',
  lead: 'Start with one recurring job and turn it into a repeatable system you can check, use and improve.',
};

export type NavLink = { label: string; href: string };

// Header navigation on page-system pages.
export const nav: NavLink[] = [
  { label: 'Free resources', href: '/vault' },
  { label: 'Articles', href: '/blog' },
  { label: 'Membership', href: '/architect' },
  { label: 'Workshops', href: '/work' },
];

export type FooterLink = {
  id: string;
  label: string;
  href: string;
  // Older pages write "AI" in capitals; page-system pages write "ai".
  legacyLabel?: string;
};

export const footerLinks: FooterLink[] = [
  { id: 'vault', label: 'Free resources', href: '/vault' },
  { id: 'blog', label: 'Blog', href: '/blog' },
  { id: 'architect', label: 'Architect Advantage', href: '/architect' },
  { id: 'work', label: 'Work with me', href: '/work' },
  { id: 'community', label: 'Join the community', href: nextStep.href },
  { id: 'about', label: 'About', href: '/about' },
  { id: 'contact', label: 'Contact', href: 'mailto:hello@wisewomenuseai.com' },
  { id: 'privacy', label: 'Privacy', href: '/privacy' },
  { id: 'ai', label: 'How I use ai', legacyLabel: 'How I use AI', href: '/ai-disclosure' },
];

export const social = [
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/wisewomenuseai' },
  { id: 'tiktok', label: 'TikTok', href: 'https://www.tiktok.com/@kellyh.ai' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/kellyh.ai' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/wisewomenuseai' },
] as const;

// Navigation on the older pages that have not been restyled yet. They keep
// their own look, but their links are read from here.
export const legacyNav = {
  // about, architect, thank-you
  ww: [
    { label: 'Articles', href: '/blog' },
    { label: 'Membership', href: '/architect' },
    { label: 'Workshops', href: '/work' },
  ] as NavLink[],
  // privacy, ai-disclosure
  classic: [
    { label: 'Workshop', href: '/workshop' },
    { label: 'Blog', href: '/blog' },
    { label: 'Work with me', href: '/work' },
  ] as NavLink[],
};
