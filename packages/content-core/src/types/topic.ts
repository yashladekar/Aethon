export interface TopicFrontmatter {
  title: string;
  description: string;

  difficulty?: "beginner" | "intermediate" | "advanced";

  estimatedTime?: number;

  tags?: string[];

  prerequisites?: string[];

  relatedTopics?: string[];
}

export interface Topic {
  slug: string;

  path: string;

  content: string;

  frontmatter: TopicFrontmatter;

  readingTime: string;
}