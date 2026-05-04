'use client';
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: '#0a0a0f', color: 'white', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚙️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>Configuration Required</h1>
          <p style={{ color: '#a8a8b3', lineHeight: 1.7, marginBottom: 24 }}>
            Please add your <strong style={{ color: '#e50914' }}>TMDB API key</strong> and <strong style={{ color: '#e50914' }}>Firebase config</strong> to <code style={{ background: '#16161f', padding: '2px 8px', borderRadius: 4 }}>.env.local</code> and restart the server.
          </p>
          <button onClick={reset} style={{ padding: '10px 24px', background: '#e50914', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
