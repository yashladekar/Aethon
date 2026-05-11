"use client";

import { Skeleton } from "@aethon/ui/components/skeleton";

interface PanelSkeletonProps {
    /** Number of skeleton lines to render */
    lines?: number;
}

export function PanelSkeleton({ lines = 8 }: PanelSkeletonProps) {
    const widths = [
        "w-3/4",
        "w-1/2",
        "w-5/6",
        "w-2/3",
        "w-4/5",
        "w-1/3",
        "w-3/5",
        "w-2/5",
    ];

    return (
        <div className="flex h-full w-full flex-col gap-3 p-4">
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${widths[i % widths.length]}`}
                />
            ))}
        </div>
    );
}
