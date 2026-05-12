import { notFound } from "next/navigation";
import { loadRoadmap } from "@aethon/roadmap-engine";

import { RoadmapView } from "./roadmap-view";

type Props = {
    params: Promise<{
        roadmapId: string;
    }>;
};

export default async function RoadmapPage({ params }: Props) {
    const { roadmapId } = await params;
    const roadmapDocument = await loadRoadmap(roadmapId);

    if (!roadmapDocument) {
        notFound();
    }

    return <RoadmapView document={roadmapDocument} roadmapId={roadmapId} />;
}
