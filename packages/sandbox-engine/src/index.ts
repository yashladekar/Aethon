export type SandboxRuntime = "sandpack" | "monaco" | "xterm" | "webcontainer";

export interface SandboxScenario {
  id: string;
  title: string;
  runtime: SandboxRuntime;
  instructions: string;
}
