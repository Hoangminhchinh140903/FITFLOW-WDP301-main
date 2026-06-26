import DatePicker from './DatePicker';

export default function RentHero({ startDate, endDate, onChangeStartDate, onChangeEndDate }) {
  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '34px',
      background: `
        radial-gradient(circle at 80% 20%, rgba(201,255,61,0.28), transparent 30%),
        radial-gradient(circle at 15% 82%, rgba(255,138,42,0.22), transparent 32%),
        linear-gradient(135deg, rgba(16,21,15,0.90), rgba(16,21,15,0.97))
      `,
      padding: '36px 40px',
      color: '#fff',
      boxShadow: '0 24px 70px rgba(16,21,15,.18)',
      marginBottom: '28px',
    }}>
      {/* Dot grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)',
        backgroundSize: '52px 52px',
        maskImage: 'linear-gradient(90deg, #000, transparent 70%)',
      }} />

      <div style={{ display: 'grid', gap: '28px', gridTemplateColumns: '1.3fr 1fr', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        {/* Left: text */}
        <div>
          <p style={{
            display: 'inline-flex', borderRadius: '999px',
            background: 'rgba(201,255,61,0.14)',
            border: '1px solid rgba(201,255,61,0.35)',
            color: '#c9ff3d', padding: '7px 14px',
            fontSize: '11px', fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '.08em',
            margin: '0 0 16px',
          }}>
            Trải nghiệm thuê đồ tại FITFLOW
          </p>
          <h1 style={{
            margin: '0 0 14px',
            fontSize: 'clamp(26px, 4vw, 42px)',
            fontWeight: 900, lineHeight: 0.94,
            letterSpacing: '-2px', textTransform: 'uppercase',
            color: '#fff',
          }}>
            Thuê đồ thể thao dễ dàng
          </h1>
          <p style={{ margin: 0, color: 'rgba(255,255,255,.78)', fontSize: '16px', lineHeight: 1.65 }}>
            Chọn ngày nhận, ngày trả và khám phá bộ sưu tập gợi ý sẵn theo nhu cầu tập luyện, thi đấu hoặc trải nghiệm.
          </p>
        </div>

        {/* Right: date picker */}
        <div style={{
          borderRadius: '24px',
          border: '1px solid rgba(201,255,61,.2)',
          background: 'rgba(255,255,255,.08)',
          backdropFilter: 'blur(10px)',
          padding: '16px',
        }}>
          <DatePicker
            startDate={startDate}
            endDate={endDate}
            onChangeStartDate={onChangeStartDate}
            onChangeEndDate={onChangeEndDate}
          />
        </div>
      </div>

      {/* Media query fallback via style tag */}
      <style>{`
        @media (max-width: 768px) {
          .rent-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
