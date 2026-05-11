"use client";

import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@aethon/ui/components/resizable";

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-full flex-col overflow-hidden">
            <ResizablePanelGroup orientation="horizontal" className="flex-1">
                <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="h-full overflow-y-auto">{children}</div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={50} minSize={30}>
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        <p>Interactive panel — activate via workspace tabs (Editor, Sandbox, Terminal)</p>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
