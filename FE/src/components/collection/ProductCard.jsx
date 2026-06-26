import { Eye } from 'lucide-react';

const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

const resolveTag = (product = {}) => {
  if (product?.isHot || String(product?.tag || '').toUpperCase() === 'HOT') return 'HOT';
  if (product?.isNew || String(product?.tag || '').toUpperCase() === 'NEW') return 'NEW';
  return '';
};

export default function ProductCard({ product, onRentNow, onBuyNow, onQuickView }) {
  const image = product?.image || product?.imageUrl || product?.images?.[0] || '';
  const rentPrice = Number(product?.baseRentPrice ?? product?.price ?? 0);
  const buyPrice = Number(product?.baseSalePrice ?? 0);
  const displayPrice = rentPrice > 0 ? rentPrice : buyPrice;
  const tag = resolveTag(product);

  return (
    <article
      className="group overflow-hidden rounded-[28px] border border-[rgba(16,21,15,0.1)] bg-[#fffaf0] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[0_24px_70px_rgba(16,21,15,0.18)]"
      onClick={() => onQuickView?.(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onQuickView?.(product);
        }
      }}
    >
      <div className="relative">
        <div className="aspect-[3/4] overflow-hidden bg-[#ebe9e3]">
          {image ? (
            <img
              src={image}
              alt={product?.name || 'product'}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">Không có ảnh</div>
          )}
        </div>

        {tag ? (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide text-white ${
              tag === 'HOT' ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          >
            {tag}
          </span>
        ) : null}

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onQuickView?.(product);
          }}
          className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-[#10150f]/85 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wider text-[#c9ff3d] transition duration-300 hover:bg-[#10150f]"
        >
          <Eye size={13} />
          Xem nhanh
        </button>
      </div>

      <div className="space-y-3 p-3.5">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-black text-[#10150f] uppercase tracking-tight">{product?.name || 'Sản phẩm'}</h3>
        <p className="text-[17px] font-black text-[#10150f]">{formatVnd(displayPrice)}</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRentNow?.(product);
            }}
            className="w-full rounded-full bg-[#c9ff3d] px-3 py-2.5 text-xs font-black uppercase tracking-wider text-[#10150f] transition duration-300 hover:bg-[#d8ff5a] border-0"
          >
            Thuê
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onBuyNow?.(product);
            }}
            className="w-full rounded-full border border-[rgba(16,21,15,0.12)] bg-[#fffaf0] px-3 py-2.5 text-xs font-black uppercase tracking-wider text-[#10150f] transition duration-300 hover:bg-[#ebe7dc]"
          >
            Mua
          </button>
        </div>
      </div>
    </article>
  );
}
