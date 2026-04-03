export type BlogSection = { type: 'h2' | 'p'; text: string };

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

const siteUrl = 'https://kifol.io';

export const blogPosts: BlogPost[] = [
  {
    slug: 'why-digital-portfolios-help-kids-stand-out',
    title: 'Why digital portfolios help kids stand out',
    description:
      'How a living record of growth, creativity, and milestones supports applications, conversations with teachers, and family pride.',
    publishedAt: '2026-03-12',
    author: 'Kifolio Team',
    tags: ['Parents', 'Education', 'Portfolios'],
    thumbnail: '/marketing/quote.png',
    thumbnailAlt: 'Decorative quote graphic',
    sections: [
      {
        type: 'p',
        text: 'Schools, programs, and coaches see hundreds of similar applications. What cuts through is a clear story: who your child is, what they care about, and how they have grown over time. A digital portfolio turns scattered photos and files into that story.',
      },
      {
        type: 'h2',
        text: 'Show progress, not just peaks',
      },
      {
        type: 'p',
        text: 'Report cards and trophies capture moments. Portfolios capture arcs: the first hesitant drawing, the science fair that clicked, the season they learned to lead. That narrative helps mentors and admissions readers understand your child beyond a single data point.',
      },
      {
        type: 'h2',
        text: 'Start small, stay consistent',
      },
      {
        type: 'p',
        text: 'You do not need a perfect system on day one. Add a highlight when something matters—a project, a kindness, a breakthrough. Over months, those entries add up to something powerful you can share when it counts.',
      },
    ],
  },
  {
    slug: 'documenting-milestones-without-the-pressure',
    title: 'Documenting milestones without the pressure',
    description:
      'Practical ways to capture childhood wins and challenges in a portfolio that feels supportive, not performative.',
    publishedAt: '2026-02-28',
    author: 'Kifolio Team',
    tags: ['Family', 'Wellbeing', 'Tips'],
    thumbnail: '/marketing/doodle-1.svg',
    thumbnailAlt: 'Playful doodle illustration',
    sections: [
      {
        type: 'p',
        text: 'The best portfolios are honest. They include messy drafts, second tries, and quiet wins alongside the big moments. That balance helps kids see themselves as learners, not as performers chasing approval.',
      },
      {
        type: 'h2',
        text: 'Let your child choose sometimes',
      },
      {
        type: 'p',
        text: 'When children pick what goes in, ownership goes up and anxiety goes down. You can still guide—suggest a photo from the recital or a paragraph they are proud of—but giving them a voice builds confidence.',
      },
      {
        type: 'h2',
        text: 'Use prompts on slow weeks',
      },
      {
        type: 'p',
        text: 'Not every week has a trophy. Simple prompts help: “What did you try this week?” or “What made you curious?” Those answers often become the most memorable entries later.',
      },
    ],
  },
  {
    slug: 'sharing-portfolios-with-teachers-and-coaches',
    title: 'Sharing portfolios with teachers and coaches',
    description:
      'How to share a polished, privacy-aware portfolio link so instructors can celebrate progress and write stronger recommendations.',
    publishedAt: '2026-01-15',
    author: 'Kifolio Team',
    tags: ['Sharing', 'Privacy', 'School'],
    thumbnail: '/marketing/doodle-2.svg',
    thumbnailAlt: 'Playful doodle illustration',
    sections: [
      {
        type: 'p',
        text: 'Teachers and coaches are rooting for your child, but they are busy. A single link to a well-organized portfolio saves them time and gives them context for recommendations, placement, or awards.',
      },
      {
        type: 'h2',
        text: 'Privacy first',
      },
      {
        type: 'p',
        text: 'Choose what is public and what stays password-protected. Kifolio lets you control visibility so you can share confidently with a coach without exposing everything to the open web.',
      },
      {
        type: 'h2',
        text: 'Update before big moments',
      },
      {
        type: 'p',
        text: 'Before parent-teacher conferences, tryouts, or applications, refresh the latest highlights. A current portfolio signals that you are engaged and makes it easy for others to advocate for your child.',
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
