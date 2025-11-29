export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  readTime?: string;
  tags?: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Kilo Code with GLM code plan",
    excerpt: "My AI agent setup",
    content: `# GLM Coding Plan

I purchased the Z AI GLM coding plan. I heard great things about the price to intelligence ratio. I paid $9 for 3 months. I wish I would have only gone for the 1 month option. The AI landscape just changes too fast. The next AI plan I pay for will probable be GPT plus. The Open AI lock in is getting more prevalant with Codex and Atlas.

## Kilo Code
I only have one complaint from Kilo Code. Sometimes when I ask a question in the "Ask" mode, it will answer and then switch into "Code" mode and start making changes without even asking permission to switch modes. 



`,
    author: "Treyson Brown",
    publishDate: "Nov 3, 2025",
  },
];
