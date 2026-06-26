import { Heart, Eye, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatVND } from '../../../pages/public/catalogHelpers';

export default function ProductCard({
  product,
  mode = 'shop',
  isFavorite = false,
  favoriteLoading = false,
  onToggleFavorite,
  onQuickView,
  onPrimaryAction,
  onSecondaryAction,
}) {
  const isRent = mode === 'rent';
  const availableQuantity = Number(product?.availableQuantity || 0);
  const rentableRaw = Number(product?.rentableQuantity);
  const rentableQuantity = Number.isFinite(rentableRaw) ? rentableRaw : availableQuantity;
  const inStock = isRent ? rentableQuantity > 0 : availableQuantity > 0;
  const rentPrice = Number(product?.baseRentPrice || product?.baseSalePrice || 0);
  const salePrice = Number(product?.baseSalePrice || product?.baseRentPrice || 0);

  return (
    <article style={{
      overflow: 'hidden',
      borderRadius: '28px',
      border: '1px solid rgba(16,21,15,.1)',
      background: '#fffaf0',
      transition: 'transform .24s ease, box-shadow .24s ease',
      display: 'flex',
      flexDirection: 'column',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 24px 70px rgba(16,21,15,.18)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* ── Image container ── */}
      <div style={{ position: 'relative' }}>
        <Link
          to={`/products/${product._id}`}
          style={{
            display: 'block',
            aspectRatio: '3/4',
            overflow: 'hidden',
            background: '#ebe9e3',
          }}
        >
          {product?.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: 'block',
                transition: 'transform 0.5s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8d9788', fontWeight: 700, fontSize: '13px' }}>
              Không có ảnh
            </div>
          )}
        </Link>

        {/* Favorite button */}
        <button
          type="button"
          onClick={() => onToggleFavorite?.(product)}
          disabled={favoriteLoading}
          aria-label="Yêu thích"
          style={{
            position: 'absolute', top: '10px', right: '10px',
            width: '36px', height: '36px',
            borderRadius: '50%', border: `1px solid ${isFavorite ? '#ff8a2a' : 'rgba(16,21,15,.12)'}`,
            background: 'rgba(255,250,240,.92)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: favoriteLoading ? 'not-allowed' : 'pointer',
            opacity: favoriteLoading ? 0.6 : 1,
            color: isFavorite ? '#ff8a2a' : '#596255',
            transition: 'color .15s, border-color .15s',
          }}
        >
          {favoriteLoading
            ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
            : <Heart size={15} fill={isFavorite ? 'currentColor' : 'none'} />
          }
        </button>

        {/* Quick view */}
        <button
          type="button"
          onClick={() => onQuickView?.(product)}
          style={{
            position: 'absolute', bottom: '10px', right: '10px',
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            borderRadius: '999px',
            background: 'rgba(16,21,15,.82)',
            color: '#c9ff3d',
            padding: '7px 12px',
            fontSize: '11px', fontWeight: 900,
            border: 0, cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: '.04em',
            transition: 'background .15s',
          }}
        >
          <Eye size={13} />
          Xem nhanh
        </button>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '16px 18px 18px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
        {/* Category pill */}
        {product?.category && (
          <span style={{
            display: 'inline-flex', padding: '4px 10px', borderRadius: '999px',
            background: '#10150f', color: '#c9ff3d',
            fontSize: '10px', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '.06em', width: 'fit-content',
          }}>
            {product.category}
          </span>
        )}

        <h3 style={{ margin: 0, fontWeight: 900, fontSize: '15px', lineHeight: 1.3, color: '#10150f', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product?.name || 'Sản phẩm'}
        </h3>

        {/* Price */}
        <div>
          {isRent ? (
            <>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#10150f', letterSpacing: '-0.5px' }}>{formatVND(rentPrice)}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#8d9788', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Giá thuê/ngày</p>
            </>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#10150f', letterSpacing: '-0.5px' }}>{formatVND(salePrice)}</p>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#8d9788', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>Giá bán</p>
            </>
          )}
        </div>

        {!inStock && (
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 900, color: '#c53030', textTransform: 'uppercase' }}>Hết hàng</p>
        )}

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: isRent ? '1fr 1fr' : '1fr', gap: '8px', marginTop: 'auto' }}>
          <button
            type="button"
            onClick={() => onPrimaryAction?.(product)}
            disabled={!inStock}
            style={{
              height: '40px', borderRadius: '999px', border: 0,
              background: !inStock ? '#ccc' : '#c9ff3d',
              color: !inStock ? '#888' : '#10150f',
              fontWeight: 900, fontSize: '12px',
              textTransform: 'uppercase', letterSpacing: '.03em',
              cursor: !inStock ? 'not-allowed' : 'pointer',
              transition: 'background .15s',
            }}
          >
            {isRent ? 'Thuê ngay' : 'Thêm vào giỏ'}
          </button>

          {isRent && (
            <button
              type="button"
              onClick={() => onSecondaryAction?.(product)}
              style={{
                height: '40px', borderRadius: '999px',
                border: '1px solid rgba(16,21,15,.12)',
                background: '#fffaf0', color: '#10150f',
                fontWeight: 900, fontSize: '12px',
                textTransform: 'uppercase', letterSpacing: '.03em',
                cursor: 'pointer', transition: 'background .15s',
              }}
            >
              Đặt lịch thử
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
