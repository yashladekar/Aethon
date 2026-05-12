import { streamText, type StreamTextResult } from "ai";
import { google } from "@ai-sdk/google";
import type { MentorContext } from "../types.ts";

export interface TutorResponseOptions {
    question: string;
    mentorContext: MentorContext;
    topicTitle?: string;
    topicContent?: string;
}

/**
 * Builds the system prompt for the tutor, grounded in the learner's current topic and roadmap.
 */
function buildTutorSystemPrompt(mentorContext: MentorContext, topicTitle?: string, topicContent?: string): string {
    const contextParts: string[] = [
        "You are an expert programming tutor on the Aethon learning platform.",
        "You provide clear, helpful explanations grounded in the learner's current context.",
        "",
        "Guidelines:",
        "- Be concise but thorough",
        "- Use code examples when helpful",
        "- Reference the topic content when relevant",
        "- Encourage understanding over memorization",
        "- If the question is outside the current topic scope, gently redirect",
    ];

    if (mentorContext.currentTopicId) {
        contextParts.push("", `Current Topic ID: ${mentorContext.currentTopicId}`);
    }

    if (mentorContext.activeRoadmapId) {
        contextParts.push(`Active Roadmap ID: ${mentorContext.activeRoadmapId}`);
    }

    contextParts.push(`Learner ID: ${mentorContext.learnerId}`);

    if (topicTitle) {
        contextParts.push("", `Topic: ${topicTitle}`);
    }

    if (topicContent) {
        contextParts.push("", "Topic Content:", topicContent);
    }

    return contextParts.join("\n");
}

/**
 * Streams a tutoring response for a learner's question using the Vercel AI SDK.
 *
 * Uses `streamText` to provide real-time streaming responses grounded in the
 * learner's current topic and roadmap context via `MentorContext`.
 */
export function streamTutorResponse(options: TutorResponseOptions): StreamTextResult<Record<string, never>> {
    const { question, mentorContext, topicTitle, topicContent } = options;

    const model = google("gemini-2.5-flash");
    const system = buildTutorSystemPrompt(mentorContext, topicTitle, topicContent);

    const result = streamText({
        model,
        system,
        prompt: question,
    });

    return result;
}
