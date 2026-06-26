export default function ShopHeader() {
  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '34px',
      background: `
        radial-gradient(circle at 82% 18%, rgba(201,255,61,0.28), transparent 28%),
        radial-gradient(circle at 18% 80%, rgba(255,138,42,0.2), transparent 30%),
        linear-gradient(135deg, rgba(16,21,15,0.90), rgba(16,21,15,0.97))
      `,
      padding: '36px 40px',
      color: '#fff',
      marginBottom: '28px',
      boxShadow: '0 24px 70px rgba(16,21,15,.18)',
    }}>
      {/* Dot grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
        maskImage: 'linear-gradient(90deg, #000, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{
          display: 'inline-flex', borderRadius: '999px',
          background: 'rgba(201,255,61,0.14)',
          border: '1px solid rgba(201,255,61,0.35)',
          color: '#c9ff3d', padding: '7px 14px',
          fontSize: '11px', fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '.08em',
          margin: '0 0 16px',
        }}>
          Mua sản phẩm & phụ kiện thể thao
        </p>

        <h1 style={{
          margin: '0 0 12px',
          fontSize: 'clamp(28px, 4.5vw, 52px)',
          fontWeight: 900, lineHeight: 0.94,
          letterSpacing: '-2.5px', textTransform: 'uppercase',
          color: '#fff',
        }}>
          Mua sản phẩm
        </h1>

        <p style={{ margin: 0, color: 'rgba(255,255,255,.75)', fontSize: '16px', lineHeight: 1.65, maxWidth: '600px' }}>
          Khám phá các mẫu sản phẩm và phụ kiện thể thao có sẵn để mua ngay. Chất liệu tốt, form tôn dáng.
        </p>
      </div>
    </section>
  );
}
