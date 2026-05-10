export interface SearchDocument {
  id: string;
  title: string;
  body: string;
  tags: string[];
  source: "topic" | "roadmap" | "note" | "snippet";
}
