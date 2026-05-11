"use client";

import { useRef, useEffect, useCallback } from "react";
import Editor, { type OnMount, type OnChange } from "@monaco-editor/react";

type EditorInstance = Parameters<OnMount>[0];

interface MonacoEditorInnerProps {
    initialValue?: string;
    onChange?: (value: string) => void;
    language?: string;
}

export default function MonacoEditorInner({
    initialValue = "",
    onChange,
    language = "typescript",
}: MonacoEditorInnerProps) {
    const editorRef = useRef<EditorInstance | null>(null);

    const handleMount: OnMount = (editorInstance) => {
        editorRef.current = editorInstance;
    };

    const handleChange: OnChange = useCallback(
        (value) => {
            if (onChange && value !== undefined) {
                onChange(value);
            }
        },
        [onChange]
    );

    useEffect(() => {
        return () => {
            const editorInstance = editorRef.current;
            if (editorInstance) {
                const model = editorInstance.getModel();
                if (model) {
                    model.dispose();
                }
                editorInstance.dispose();
                editorRef.current = null;
            }
        };
    }, []);

    return (
        <Editor
            height="100%"
            defaultLanguage={language}
            defaultValue={initialValue}
            onMount={handleMount}
            onChange={handleChange}
            theme="vs-dark"
            options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
            }}
        />
    );
}
