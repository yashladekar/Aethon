export type { MentorContext, QuizGenerationRequest } from "./types.ts";

export { generateQuiz, quizQuestionSchema } from "./tools/generate-quiz.ts";
export type { QuizQuestion, GenerateQuizOptions } from "./tools/generate-quiz.ts";

export { generateSummary } from "./tools/generate-summary.ts";
export type { GenerateSummaryOptions } from "./tools/generate-summary.ts";

export { streamTutorResponse } from "./tools/tutor-response.ts";
export type { TutorResponseOptions } from "./tools/tutor-response.ts";

export { aiEngine } from "./ai-engine.ts";
