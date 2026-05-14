"use client";

import { Component, Suspense, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@aethon/ui/components/skeleton";
import type { SandpackConfig } from "./sandpack-inner";

const SandpackInner = dynamic(
    () => import("./sandpack-inner").catch(() => {
        // Return a fallback component if the chunk fails to load
        return {
            default: () => (
                <div className="flex h-full w-full items-center justify-center p-4">
                    <div className="text-center">
                        <p className="text-sm font-medium text-destructive">
                            Failed to load the sandbox environment
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            This may be a bundler compatibility issue. Try refreshing the page.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            ),
        };
    }),
    { ssr: false }
);

function SandpackSkeleton() {
    return (
        <div className="flex h-full w-full flex-col gap-2 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/3" />
        </div>
    );
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class SandpackErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    override render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

function SandpackError() {
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <div className="text-center">
                <p className="text-sm font-medium text-destructive">
                    Failed to load the sandbox
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Try refreshing the page
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
                >
                    Reload Page
                </button>
            </div>
        </div>
    );
}

interface SandboxPanelProps {
    config?: SandpackConfig;
}

export function SandboxPanel({ config }: SandboxPanelProps) {
    return (
        <SandpackErrorBoundary fallback={<SandpackError />}>
            <Suspense fallback={<SandpackSkeleton />}>
                <SandpackInner config={config} />
            </Suspense>
        </SandpackErrorBoundary>
    );
}
