'use client';

export function RoadmapEmptyState() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: '300px',
                color: '#6b7280',
                textAlign: 'center',
                padding: '32px',
            }}
        >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>
                No roadmap content yet
            </h3>
            <p style={{ fontSize: '14px', maxWidth: '320px' }}>
                This roadmap doesn&apos;t have any nodes defined. Add nodes to the roadmap document to see
                the learning path visualization.
            </p>
        </div>
    );
}
