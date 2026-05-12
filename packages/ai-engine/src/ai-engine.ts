import { generateQuiz } from "./tools/generate-quiz.ts";
import { generateSummary } from "./tools/generate-summary.ts";
import { streamTutorResponse } from "./tools/tutor-response.ts";

/**
 * Composes all AI engine tools into a single export.
 *
 * Each capability is a separate function following the tool-based architecture
 * described in the design. All AI calls are server-side only.
 */
export const aiEngine = {
    generateQuiz,
    generateSummary,
    streamTutorResponse,
};
