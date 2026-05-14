"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export interface XTermInnerProps {
    onData?: (data: string) => void;
}

export default function XTermInner({ onData }: XTermInnerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Wait until the container has actual dimensions before initializing xterm.
        // This prevents the "Cannot read properties of undefined (reading 'dimensions')"
        // error that occurs when xterm's Viewport tries to refresh before the render service is ready.
        if (container.offsetWidth === 0 || container.offsetHeight === 0) {
            const observer = new ResizeObserver((entries) => {
                const entry = entries[0];
                if (entry && entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    observer.disconnect();
                    setIsReady(true);
                }
            });
            observer.observe(container);
            return () => observer.disconnect();
        }

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
        terminal.open(container);

        terminalRef.current = terminal;
        fitAddonRef.current = fitAddon;

        // Fit after a frame to ensure layout is stable
        const rafId = requestAnimationFrame(() => {
            try {
                fitAddon.fit();
            } catch {
                // Ignore if fit fails
            }
        });

        if (onData) {
            terminal.onData(onData);
        }

        // Write a welcome message
        terminal.writeln("Welcome to Aethon Terminal");
        terminal.writeln("This is a client-side terminal emulator.");
        terminal.writeln("");

        const resizeObserver = new ResizeObserver(() => {
            if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                try {
                    fitAddon.fit();
                } catch {
                    // Ignore fit errors during rapid resizing
                }
            }
        });
        resizeObserver.observe(container);

        return () => {
            cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            terminal.dispose();
            terminalRef.current = null;
            fitAddonRef.current = null;
        };
    }, [onData, isReady]);

    return <div ref={containerRef} className="h-full w-full" />;
}
