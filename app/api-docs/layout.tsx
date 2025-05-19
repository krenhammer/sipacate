export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="api-docs-layout">
      {children}
    </div>
  );
}

// Set metadata for SEO
export const metadata = {
  title: 'Sipacate API Documentation',
  description: 'Interactive API documentation for Sipacate services',
}; 