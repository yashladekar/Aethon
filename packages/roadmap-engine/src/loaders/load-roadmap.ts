import type { RoadmapDocument } from '../schema/roadmap-document.schema';

// Static imports for content-driven roadmaps.
// This keeps JSON loading inside the engine boundary and avoids
// direct imports in Next.js page components.
import frontendRoadmap from '../../../../content/roadmaps/frontend.json';

const roadmapRegistry: Record<string, RoadmapDocument> = {
    frontend: frontendRoadmap as unknown as RoadmapDocument,
};

/**
 * Loads a roadmap document by its ID.
 *
 * Currently resolves from the static content/roadmaps directory.
 * Future implementations can extend this to load from DB, API, or AI-generated sources.
 */
export async function loadRoadmap(id: string): Promise<RoadmapDocument | null> {
    return roadmapRegistry[id] ?? null;
}

/**
 * Returns all available roadmap IDs for static generation or listing.
 */
export function getAvailableRoadmapIds(): string[] {
    return Object.keys(roadmapRegistry);
}
