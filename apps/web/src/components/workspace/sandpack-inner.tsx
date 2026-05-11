"use client";

import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
} from "@codesandbox/sandpack-react";

export interface SandpackConfig {
    files: Record<string, string>;
    dependencies?: Record<string, string>;
    entry?: string;
    template?: "react" | "react-ts" | "vanilla" | "vanilla-ts" | "vue" | "angular" | "svelte";
}

interface SandpackInnerProps {
    config?: SandpackConfig;
}

export default function SandpackInner({ config }: SandpackInnerProps) {
    const files = config?.files ?? {
        "/App.tsx": `export default function App() {
  return <h1>Hello Sandpack</h1>;
}`,
    };

    const customSetup = config?.dependencies
        ? { dependencies: config.dependencies }
        : undefined;

    return (
        <SandpackProvider
            template={config?.template ?? "react-ts"}
            files={files}
            customSetup={customSetup}
            options={{
                activeFile: config?.entry,
            }}
            theme="dark"
        >
            <SandpackLayout style={{ height: "100%", border: "none" }}>
                <SandpackCodeEditor
                    showLineNumbers
                    showTabs
                    style={{ height: "100%" }}
                />
                <SandpackPreview
                    showOpenInCodeSandbox={false}
                    showRefreshButton
                    style={{ height: "100%" }}
                />
            </SandpackLayout>
        </SandpackProvider>
    );
}
