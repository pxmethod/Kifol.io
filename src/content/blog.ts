import { SITE_ORIGIN } from '@/lib/seo';

export type BlogSection =
  | { type: 'h2'; text: string }
  | {
      type: 'p';
      text: string;
      trailingLink?: { href: string; label: string };
    };

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  author: string;
  tags: string[];
  thumbnail: string;
  thumbnailAlt: string;
  sections: BlogSection[];
};

/** Shown under the blog index title and on the marketing “From the blog” section */
export const BLOG_INTRO_COPY =
  "Ideas for documenting milestones, building portfolios, and sharing your child's story with confidence.";

const siteUrl = SITE_ORIGIN;

export const blogPosts: BlogPost[] = [
  {
    slug: 'gym-owners-parents-kifolio-track-every-win',
    title: 'Why gym owners and parents are turning to Kifolio to track every win',
    description:
      'How martial arts studios, gymnastics gyms, and youth programs use Kifolio as a free achievement tracker, coach endorsements, and parent-ready portfolios.',
    publishedAt: '2026-04-10',
    author: 'Kifolio Team',
    tags: ['Gyms', 'Coaches', 'Parents', 'Sports', 'Martial arts'],
    thumbnail: '/blog/gym_children_gymnastics.jpg',
    thumbnailAlt:
      'Children practicing gymnastics in a gym — document belts, skills, and competitions in one student portfolio',
    sections: [
      {
        type: 'p',
        text: "Whether you run a martial arts studio, a gymnastics academy, a cheer gym, or a youth fitness program, you know that what happens inside your facility goes far beyond physical training. Kids are earning belts, hitting new skills, competing at tournaments, and growing in ways that deserve to be documented and celebrated. The challenge has always been that those moments get scattered — photos buried on a parent's phone, certificates stuffed in a drawer, coach's notes that never make it home. Kifolio, the free digital portfolio for kids, changes that entirely. It gives gym owners, coaches, and parents one beautiful, organized place to capture every achievement, milestone, and breakthrough — from the first class to the championship podium.",
      },
      {
        type: 'p',
        text: "For gym owners specifically, recommending Kifolio to your families is one of the most valuable things you can do for retention and community. When parents can see their child's journey laid out visually as a children's achievement tracker, they stay engaged, stay enrolled, and stay proud. Kifolio's endorsement feature is a particular game-changer for gyms: coaches and instructors can be invited to leave verified comments directly on a student's achievements. That means when a student earns a new belt rank, masters a back handspring, or wins their first competition, their coach's voice is part of the record. This teacher endorsement portfolio feature transforms a simple participation ribbon into a meaningful, credentialed milestone that families will treasure for years.",
      },
      {
        type: 'p',
        text: 'For parents, Kifolio works beautifully as a martial arts belt tracker app, a sports achievement app for kids, and an all-in-one athletic development journal. Instead of wondering "when exactly did she test for her blue belt?" or "what were his competition results last spring?", everything lives in a clean visual timeline. Parents can log belt promotions, skills evaluations, tournament placements, training milestones, and coach feedback — all organized by date and category in Kifolio\'s child portfolio app. Videos and photos upload easily, so that winning floor routine or sparring match highlight is never lost. It\'s the kind of organized, polished record that makes parents feel like they\'re truly honoring their child\'s hard work, not just watching it pass by.',
      },
      {
        type: 'p',
        text: "The SEO keywords that bring gym parents to tools like this — how to track my child's achievements, organize kids school projects online, sports achievement app for kids — all point to the same underlying need: parents want to feel on top of their child's growth and have something real to show for it. Kifolio meets that need beautifully, and for gym families in particular, it bridges the athletic and academic worlds seamlessly. When a student's gymnastics discipline, competitive record, and coach endorsements live alongside their school projects and honors in one student portfolio platform, the picture admissions officers and scholarship committees see becomes dramatically more compelling.",
      },
      {
        type: 'p',
        text: "Kifolio is completely free and takes minutes to set up — no credit card, no complicated onboarding. Gym owners can share it with their community as a simple, powerful add-on to the experience they already provide. And for parents who've been meaning to track their child's achievements but never found the right tool, there's no better time to start than today. Every stripe earned, every skill unlocked, every competition placed — it all matters. Kifolio makes sure none of it gets lost. Start building your child's portfolio at",
        trailingLink: { href: 'https://kifol.io', label: 'kifol.io' },
      },
    ],
  },
  {
    slug: 'kifolio-portfolio-app-college-applications',
    title:
      'How to use Kifolio as your ultimate portfolio app for college applications',
    description:
      'Build a free digital portfolio from elementary school through college apps: highlights, teacher endorsements, and exports that tell the full story beyond grades.',
    publishedAt: '2026-04-09',
    author: 'Kifolio Team',
    tags: ['College', 'Portfolios', 'Parents', 'Applications'],
    thumbnail: '/blog/college_graduation_001.jpg',
    thumbnailAlt:
      'Graduate in cap and gown — building a student portfolio through school helps families prepare for college applications',
    sections: [
      {
        type: 'p',
        text: "When it comes to college prep, grades and test scores only tell part of the story. Admissions teams want to see the full picture — the projects, the leadership, the growth. That's exactly why Kifolio, the free digital portfolio platform for children, was built. As a student portfolio platform designed to capture every milestone from elementary school through graduation, Kifolio gives families a powerful head start on one of the most important seasons of a student's life: the college application process.",
      },
      {
        type: 'p',
        text: 'So how does it actually work? Parents start by creating a dedicated profile for their child and adding "highlights" — individual entries for awards, school projects, test scores, volunteer hours, athletic achievements, and more. Think of it as a children\'s achievement tracker that lives online, always organized, always ready to share. Instead of hunting through old emails or digging through boxes of certificates come junior year, everything is documented in one polished timeline. For families wondering how to track their child\'s achievements in a meaningful way, Kifolio makes it effortless — and free.',
      },
      {
        type: 'p',
        text: "One of Kifolio's standout features for kids' scholarship application portfolios and college prep is the teacher endorsement tool. Parents can invite teachers, coaches, or mentors to add verified comments directly to specific achievements, creating a teacher endorsement portfolio that carries real credibility with admissions committees. When a student's science fair win includes a note from their instructor, or a leadership role comes with a coach's endorsement, it transforms a simple list of activities into a living, breathing record of character. This is the kind of authentic context that complements official transcripts and helps admissions teams see the full story behind the student.",
      },
      {
        type: 'p',
        text: "Kifolio is also built for families with diverse paths. Whether you're managing a homeschool portfolio tracker, documenting belt promotions with a martial arts belt tracker app, or logging stats and highlights as a sports achievement app for kids, Kifolio handles it all in one place. It's equally effective for organizing science fair wins, coding competition awards, debate team records, and community service hours — everything colleges and scholarship committees look for. When it's time to apply, families can export a polished portfolio to accompany transcripts, résumés, and scholarship submissions, giving students a clear edge over applicants who only submit a standard activity list.",
      },
      {
        type: 'p',
        text: "The best part? Kifolio is completely free. As a child portfolio app with no hidden costs or paywalls, it removes any barrier to starting early — and starting early is everything. The students who stand out in college admissions aren't just the ones with the best GPA; they're the ones who can clearly show their growth, their passions, and their impact over time. With Kifolio, that story builds itself, one highlight at a time. Get started today at",
        trailingLink: { href: 'https://kifol.io', label: 'kifol.io' },
      },
    ],
  },
];

export function getAllPostsSorted(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getCanonicalPostUrl(slug: string): string {
  return `${siteUrl}/blog/${slug}`;
}

export function getCanonicalBlogUrl(): string {
  return `${siteUrl}/blog`;
}
