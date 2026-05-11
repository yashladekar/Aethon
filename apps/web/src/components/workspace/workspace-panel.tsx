"use client";

import { useState } from "react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@aethon/ui/components/tabs";
import { Code2, Play, Terminal } from "lucide-react";
import { EditorPanel } from "./editor-panel";
import { SandboxPanel } from "./sandbox-panel";
import { TerminalPanel } from "./terminal-panel";

/** Matches TopicKind from @aethon/shared */
type TopicKind =
    | "concept"
    | "lesson"
    | "project"
    | "tool"
    | "practice"
    | "system_design";

export type WorkspaceMode = "editor" | "sandbox" | "terminal";

interface WorkspacePanelProps {
    /** The topic kind — determines whether interactive panel is shown by default */
    topicKind?: TopicKind;
    /** Explicit mode override — forces the interactive panel to show */
    defaultMode?: WorkspaceMode;
    /** Initial code value for the editor */
    editorValue?: string;
    /** Language for the editor */
    editorLanguage?: string;
    /** Sandpack configuration */
    sandpackConfig?: Record<string, unknown>;
}

/**
 * Tab switcher for the interactive right panel.
 * Conditionally renders EditorPanel, SandboxPanel, or TerminalPanel based on active tab.
 * Defaults to content-only (returns null) when topic kind is `concept` or `lesson`
 * with no explicit mode.
 */
export function WorkspacePanel({
    topicKind,
    defaultMode,
    editorValue,
    editorLanguage,
    sandpackConfig,
}: WorkspacePanelProps) {
    const contentOnlyKinds: TopicKind[] = ["concept", "lesson"];
    const shouldHidePanel =
        !defaultMode &&
        topicKind != null &&
        contentOnlyKinds.includes(topicKind);

    const [activeMode, setActiveMode] = useState<WorkspaceMode>(
        defaultMode ?? "editor"
    );

    if (shouldHidePanel) {
        return (
            <div className="flex h-full items-center justify-center p-6 text-center">
                <p className="text-sm text-muted-foreground">
                    This topic is content-only. Select a different topic or
                    activate an interactive mode to use this panel.
                </p>
            </div>
        );
    }

    return (
        <Tabs
            value={activeMode}
            onValueChange={(value) => setActiveMode(value as WorkspaceMode)}
            className="flex h-full flex-col"
        >
            <div className="flex-none border-b px-2">
                <TabsList variant="line">
                    <TabsTrigger value="editor">
                        <Code2 className="size-3.5" />
                        Editor
                    </TabsTrigger>
                    <TabsTrigger value="sandbox">
                        <Play className="size-3.5" />
                        Sandbox
                    </TabsTrigger>
                    <TabsTrigger value="terminal">
                        <Terminal className="size-3.5" />
                        Terminal
                    </TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 overflow-hidden">
                <EditorPanel
                    initialValue={editorValue}
                    language={editorLanguage}
                />
            </TabsContent>

            <TabsContent value="sandbox" className="flex-1 overflow-hidden">
                <SandboxPanel config={sandpackConfig as never} />
            </TabsContent>

            <TabsContent value="terminal" className="flex-1 overflow-hidden">
                <TerminalPanel />
            </TabsContent>
        </Tabs>
    );
}
