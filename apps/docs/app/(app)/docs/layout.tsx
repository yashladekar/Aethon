export default function Layout({ children }: LayoutProps<'/'>) {
    return (
        <body className="flex flex-col min-h-screen">
            <div>{children}</div>
        </body>
    );
}
