export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', color: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 900, color: '#e50914', lineHeight: 1 }}>404</h1>
        <p style={{ fontSize: '1.2rem', color: '#a8a8b3', margin: '16px 0 28px' }}>Lost in the void. This page doesn&apos;t exist.</p>
        <a href="/" style={{ padding: '12px 28px', background: '#e50914', color: 'white', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>Go Home</a>
      </div>
    </div>
  );
}
