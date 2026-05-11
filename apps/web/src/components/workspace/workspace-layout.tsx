"use client";

import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@aethon/ui/components/resizable";
import { WorkspacePanel, type WorkspaceMode } from "./workspace-panel";

/** Matches TopicKind from @aethon/shared */
type TopicKind =
    | "concept"
    | "lesson"
    | "project"
    | "tool"
    | "practice"
    | "system_design";

interface WorkspaceLayoutProps {
    /** MDX rendered content for the left panel */
    children: React.ReactNode;
    /** The topic kind — determines whether interactive panel is shown */
    topicKind?: TopicKind;
    /** Explicit mode override for the interactive panel */
    defaultMode?: WorkspaceMode;
    /** Initial code value for the editor */
    editorValue?: string;
    /** Language for the editor */
    editorLanguage?: string;
    /** Sandpack configuration */
    sandpackConfig?: Record<string, unknown>;
}

/**
 * Learning Workspace layout with a resizable split-panel.
 * Left panel: MDX content. Right panel: interactive environment (editor/sandbox/terminal).
 * When topic kind is `concept` or `lesson` with no explicit mode, the right panel
 * shows a content-only message (no heavy components are loaded).
 */
export function WorkspaceLayout({
    children,
    topicKind,
    defaultMode,
    editorValue,
    editorLanguage,
    sandpackConfig,
}: WorkspaceLayoutProps) {
    const contentOnlyKinds: TopicKind[] = ["concept", "lesson"];
    const isContentOnly =
        !defaultMode &&
        topicKind != null &&
        contentOnlyKinds.includes(topicKind);

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <ResizablePanelGroup orientation="horizontal" className="flex-1">
                {/* Left panel: MDX content */}
                <ResizablePanel
                    defaultSize={isContentOnly ? 100 : 50}
                    minSize={30}
                >
                    <div className="h-full overflow-y-auto">{children}</div>
                </ResizablePanel>

                {/* Only render the handle and right panel when interactive mode is active */}
                {!isContentOnly && (
                    <>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={50} minSize={30}>
                            <WorkspacePanel
                                topicKind={topicKind}
                                defaultMode={defaultMode}
                                editorValue={editorValue}
                                editorLanguage={editorLanguage}
                                sandpackConfig={sandpackConfig}
                            />
                        </ResizablePanel>
                    </>
                )}
            </ResizablePanelGroup>
        </div>
    );
}
