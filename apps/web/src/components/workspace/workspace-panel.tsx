"use client";

import { useCallback, useRef, useState } from "react";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@aethon/ui/components/tabs";
import { Button } from "@aethon/ui/components/button";
import { Code2, Play, Terminal, TriangleIcon, Trash2 } from "lucide-react";
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

interface ConsoleOutput {
    type: "log" | "error" | "warn" | "info" | "result";
    content: string;
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
    const [output, setOutput] = useState<ConsoleOutput[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const codeRef = useRef<string>(editorValue ?? "");

    const handleEditorChange = useCallback((value: string) => {
        codeRef.current = value;
    }, []);

    const handleRunCode = useCallback(() => {
        setIsRunning(true);
        setOutput([]);

        const logs: ConsoleOutput[] = [];

        // Capture console methods
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
        };

        const formatArgs = (...args: unknown[]) =>
            args
                .map((arg) => {
                    if (typeof arg === "object") {
                        try {
                            return JSON.stringify(arg, null, 2);
                        } catch {
                            return String(arg);
                        }
                    }
                    return String(arg);
                })
                .join(" ");

        console.log = (...args: unknown[]) => {
            logs.push({ type: "log", content: formatArgs(...args) });
            originalConsole.log(...args);
        };
        console.error = (...args: unknown[]) => {
            logs.push({ type: "error", content: formatArgs(...args) });
            originalConsole.error(...args);
        };
        console.warn = (...args: unknown[]) => {
            logs.push({ type: "warn", content: formatArgs(...args) });
            originalConsole.warn(...args);
        };
        console.info = (...args: unknown[]) => {
            logs.push({ type: "info", content: formatArgs(...args) });
            originalConsole.info(...args);
        };

        try {
            // Execute the code
            const result = new Function(codeRef.current)();
            if (result !== undefined) {
                logs.push({ type: "result", content: `→ ${formatArgs(result)}` });
            }
        } catch (error) {
            logs.push({
                type: "error",
                content: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
            });
        } finally {
            // Restore console
            console.log = originalConsole.log;
            console.error = originalConsole.error;
            console.warn = originalConsole.warn;
            console.info = originalConsole.info;

            setOutput(logs);
            setIsRunning(false);
        }
    }, []);

    const handleClearOutput = useCallback(() => {
        setOutput([]);
    }, []);

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

            <TabsContent value="editor" className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 border-b px-3 py-1.5">
                    <Button
                        size="sm"
                        variant="default"
                        onClick={handleRunCode}
                        disabled={isRunning}
                        className="h-7 gap-1.5 text-xs"
                    >
                        <TriangleIcon className="size-3 rotate-90 fill-current" />
                        {isRunning ? "Running..." : "Run"}
                    </Button>
                    {output.length > 0 && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleClearOutput}
                            className="h-7 gap-1.5 text-xs"
                        >
                            <Trash2 className="size-3" />
                            Clear
                        </Button>
                    )}
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                    <EditorPanel
                        initialValue={editorValue}
                        onChange={handleEditorChange}
                        language={editorLanguage}
                    />
                </div>
                {output.length > 0 && (
                    <div className="flex-none max-h-48 overflow-y-auto border-t bg-[#1e1e1e] p-3 font-mono text-xs">
                        <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Output
                        </div>
                        {output.map((line, i) => (
                            <div
                                key={i}
                                className={
                                    line.type === "error"
                                        ? "text-red-400"
                                        : line.type === "warn"
                                            ? "text-yellow-400"
                                            : line.type === "result"
                                                ? "text-green-400"
                                                : "text-gray-300"
                                }
                            >
                                {line.content}
                            </div>
                        ))}
                    </div>
                )}
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
