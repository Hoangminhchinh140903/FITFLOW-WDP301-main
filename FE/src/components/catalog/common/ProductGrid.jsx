import ProductCard from './ProductCard';

function ProductCardSkeleton() {
  return (
    <div style={{
      overflow: 'hidden',
      borderRadius: '28px',
      border: '1px solid rgba(16,21,15,.1)',
      background: '#fffaf0',
    }}>
      <div style={{
        aspectRatio: '3/4',
        background: 'linear-gradient(90deg, #ebe9e3 25%, #e0ddd7 50%, #ebe9e3 75%)',
        backgroundSize: '200% 100%',
        animation: 'ff-shimmer 1.4s infinite',
      }} />
      <div style={{ padding: '16px', display: 'grid', gap: '10px' }}>
        <div style={{ height: '14px', width: '70%', borderRadius: '8px', background: 'linear-gradient(90deg, #ebe9e3 25%, #e0ddd7 50%, #ebe9e3 75%)', backgroundSize: '200% 100%', animation: 'ff-shimmer 1.4s infinite' }} />
        <div style={{ height: '22px', width: '50%', borderRadius: '8px', background: 'linear-gradient(90deg, #ebe9e3 25%, #e0ddd7 50%, #ebe9e3 75%)', backgroundSize: '200% 100%', animation: 'ff-shimmer 1.4s infinite' }} />
        <div style={{ height: '40px', width: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #ebe9e3 25%, #e0ddd7 50%, #ebe9e3 75%)', backgroundSize: '200% 100%', animation: 'ff-shimmer 1.4s infinite' }} />
      </div>
      <style>{`@keyframes ff-shimmer { to { background-position: -200% 0; } }`}</style>
    </div>
  );
}

export default function ProductGrid({
  products = [],
  loading = false,
  mode = 'shop',
  favoriteIds = new Set(),
  favoriteLoadingIds = new Set(),
  onToggleFavorite,
  onQuickView,
  onPrimaryAction,
  onSecondaryAction,
  emptyText = 'Không có sản phẩm phù hợp.',
}) {
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '20px',
  };

  if (loading) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{
        borderRadius: '24px',
        border: '2px dashed rgba(16,21,15,.15)',
        background: '#fffaf0',
        padding: '60px 20px',
        textAlign: 'center',
        color: '#8d9788',
        fontWeight: 700,
        fontSize: '15px',
      }}>
        {emptyText}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media (max-width: 1100px) { .ff-product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; } }
        @media (max-width: 768px)  { .ff-product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; } }
        @media (max-width: 480px)  { .ff-product-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <div className="ff-product-grid" style={gridStyle}>
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            mode={mode}
            isFavorite={favoriteIds.has(product._id)}
            favoriteLoading={favoriteLoadingIds.has(product._id)}
            onToggleFavorite={onToggleFavorite}
            onQuickView={onQuickView}
            onPrimaryAction={onPrimaryAction}
            onSecondaryAction={onSecondaryAction}
          />
        ))}
      </div>
    </>
  );
}
