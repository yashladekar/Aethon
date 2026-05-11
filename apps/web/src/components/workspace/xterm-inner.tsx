"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export interface XTermInnerProps {
    onData?: (data: string) => void;
}

export default function XTermInner({ onData }: XTermInnerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const terminal = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: "Menlo, Monaco, 'Courier New', monospace",
            theme: {
                background: "#1e1e1e",
                foreground: "#d4d4d4",
            },
        });

        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(containerRef.current);
        fitAddon.fit();

        terminalRef.current = terminal;
        fitAddonRef.current = fitAddon;

        if (onData) {
            terminal.onData(onData);
        }

        const resizeObserver = new ResizeObserver(() => {
            try {
                fitAddon.fit();
            } catch {
                // Ignore fit errors during rapid resizing
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            terminal.dispose();
            terminalRef.current = null;
            fitAddonRef.current = null;
        };
    }, [onData]);

    return <div ref={containerRef} className="h-full w-full" />;
}
