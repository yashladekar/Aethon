"use client";

import { Component, Suspense, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@aethon/ui/components/skeleton";

const MonacoEditorInner = dynamic(() => import("./monaco-editor-inner"), {
    ssr: false,
});

function EditorSkeleton() {
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

class EditorErrorBoundary extends Component<
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

function EditorError() {
    return (
        <div className="flex h-full w-full items-center justify-center p-4">
            <div className="text-center">
                <p className="text-sm font-medium text-destructive">
                    Failed to load the code editor
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Try refreshing the page
                </p>
            </div>
        </div>
    );
}

interface EditorPanelProps {
    initialValue?: string;
    onChange?: (value: string) => void;
    language?: string;
}

export function EditorPanel({
    initialValue,
    onChange,
    language,
}: EditorPanelProps) {
    return (
        <EditorErrorBoundary fallback={<EditorError />}>
            <Suspense fallback={<EditorSkeleton />}>
                <MonacoEditorInner
                    initialValue={initialValue}
                    onChange={onChange}
                    language={language}
                />
            </Suspense>
        </EditorErrorBoundary>
    );
}
