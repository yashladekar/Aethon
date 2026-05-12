import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import type { TopicDocument } from "@aethon/content-core";

export interface GenerateSummaryOptions {
    topic: TopicDocument;
}

/**
 * Builds the prompt for summary generation with a 150-word max constraint.
 */
function buildSummaryPrompt(topic: TopicDocument): string {
    return `You are an expert educator creating concise summaries for a developer learning platform.

Topic: ${topic.metadata.title}
Description: ${topic.metadata.description}
Difficulty: ${topic.metadata.difficulty}

Topic Content:
${topic.body}

Generate a concise summary of this topic in a maximum of 150 words. The summary should:
- Capture the key concepts and takeaways
- Be written in clear, accessible language appropriate for the topic's difficulty level
- Help a learner quickly understand what this topic covers
- NOT exceed 150 words under any circumstances`;
}

/**
 * Generates a concise summary (max 150 words) for a given topic using the Vercel AI SDK.
 *
 * Uses `generateText` with a prompt that constrains the output to 150 words.
 */
export async function generateSummary(options: GenerateSummaryOptions): Promise<string> {
    const { topic } = options;

    const prompt = buildSummaryPrompt(topic);
    const model = google("gemini-2.5-flash");

    const { text } = await generateText({
        model,
        prompt,
        maxTokens: 300, // ~150 words ≈ ~200-300 tokens, constrained by prompt instruction
    });

    return text;
}
