'use client';

import { create } from 'zustand';

interface RoadmapStoreState {
    selectedNodeId: string | null;
    viewport: { x: number; y: number; zoom: number };
    layoutComputed: boolean;
}

interface RoadmapStoreActions {
    selectNode: (nodeId: string | null) => void;
    setViewport: (viewport: { x: number; y: number; zoom: number }) => void;
    setLayoutComputed: (computed: boolean) => void;
    reset: () => void;
}

type RoadmapStore = RoadmapStoreState & RoadmapStoreActions;

const initialState: RoadmapStoreState = {
    selectedNodeId: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    layoutComputed: false,
};

export const useRoadmapStore = create<RoadmapStore>((set) => ({
    ...initialState,
    selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
    setViewport: (viewport) => set({ viewport }),
    setLayoutComputed: (computed) => set({ layoutComputed: computed }),
    reset: () => set(initialState),
}));
