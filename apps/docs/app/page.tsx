export default function HomePage() {
    return (
        <main className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
            <h1 className="text-5xl font-bold tracking-tight">Aethon Docs</h1>
            <p className="text-lg text-muted-foreground max-w-xl">
                The reference documentation for the Aethon developer learning platform.
                Browse topics by category or search for what you need.
            </p>
            <div className="flex gap-4">
                <a
                    href="/docs"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                >
                    Browse Docs
                </a>
            </div>
        </main>
    );
}
