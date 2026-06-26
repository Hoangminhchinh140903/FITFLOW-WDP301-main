const formatVnd = (value) => `${Number(value || 0).toLocaleString('vi-VN')}đ`;

export default function OutfitCarousel({ outfits = [], onRentSet, loading = false }) {
  if (loading) {
    return (
      <section className="space-y-3">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`outfit-skeleton-${index}`} className="min-w-[260px] flex-1 rounded-[28px] border border-[rgba(16,21,15,0.1)] bg-[#fffaf0] p-4">
              <div className="aspect-[4/3] animate-pulse rounded-[20px] bg-[#ebe9e3]" />
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-10 w-full animate-pulse rounded-full bg-slate-200" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!outfits.length) return null;

  return (
    <section className="space-y-3" id="collection-outfits">
      <div className="flex items-center justify-between">
        <h2 className="text-[22px] font-black uppercase tracking-tight text-[#10150f]">Dụng cụ gợi ý</h2>
        <p className="text-xs font-semibold text-[#8d9788]">Kéo ngang để xem thêm</p>
      </div>

      <div className="flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {outfits.map((outfit) => (
          <article
            key={outfit.id || outfit._id || outfit.name}
            className="group min-w-[260px] snap-start flex-1 rounded-[28px] border border-[rgba(16,21,15,0.1)] bg-[#fffaf0] p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-[20px] bg-[#ebe9e3]">
              {outfit.image ? (
                <img
                  src={outfit.image}
                  alt={outfit.name || 'dụng cụ'}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale(1.05)"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">Không có ảnh</div>
              )}
            </div>
            <div className="mt-3 space-y-2">
              <h3 className="line-clamp-1 text-sm font-black text-[#10150f]">{outfit.name || 'Dụng cụ'}</h3>
              <p className="text-base font-black text-[#10150f]">{formatVnd(outfit.totalPrice)}</p>
              <button
                type="button"
                onClick={() => onRentSet?.(outfit)}
                className="w-full rounded-full bg-[#10150f] hover:bg-[#1b241b] px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#c9ff3d] transition duration-150 shadow-[0_8px_24px_rgba(16,21,15,0.15)]"
              >
                Thuê set này
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
