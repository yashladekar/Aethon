export const mdxComponents = {
  h1: (props: any) => (
    <h1
      className="text-4xl font-bold mb-6"
      {...props}
    />
  ),

  h2: (props: any) => (
    <h2
      className="text-3xl font-semibold mt-10 mb-4"
      {...props}
    />
  ),

  p: (props: any) => (
    <p
      className="leading-7 mb-4 text-muted-foreground"
      {...props}
    />
  ),

  code: (props: any) => (
    <code
      className="bg-muted px-1 py-0.5 rounded text-sm"
      {...props}
    />
  ),
};