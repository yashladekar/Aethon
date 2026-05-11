"use client";

import { AlertCircle } from "lucide-react";

interface PanelErrorProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function PanelError({
    title = "Failed to load panel",
    message = "Something went wrong while loading this component. Try refreshing the page.",
    onRetry,
}: PanelErrorProps) {
    return (
        <div className="flex h-full w-full items-center justify-center p-6">
            <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="size-8 text-destructive" />
                <div>
                    <p className="text-sm font-medium text-destructive">
                        {title}
                    </p>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                        {message}
                    </p>
                </div>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="mt-2 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                        Try again
                    </button>
                )}
            </div>
        </div>
    );
}
