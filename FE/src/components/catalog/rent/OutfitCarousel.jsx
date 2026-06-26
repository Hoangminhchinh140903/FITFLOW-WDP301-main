import { formatVND } from '../../../pages/public/catalogHelpers';

export default function OutfitCarousel({ outfits = [], onSelectOutfit }) {
  if (outfits.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b border-[rgba(16,21,15,0.08)] pb-2">
        <h2 className="text-lg font-black uppercase tracking-wider text-[#10150f]">Gợi ý dụng cụ trọn set</h2>
        <p className="text-xs font-bold uppercase tracking-wider text-[#8d9788]">Kéo ngang để xem thêm</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {outfits.map((outfit) => (
          <article
            key={outfit.id}
            className="min-w-[260px] flex-1 rounded-[24px] border border-[rgba(16,21,15,0.1)] bg-[#fffaf0] p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-[18px] bg-amber-50">
              {outfit.imageUrl ? (
                <img src={outfit.imageUrl} alt={outfit.name} loading="lazy" className="h-full w-full object-cover transition duration-300 hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-bold text-[#8d9788]">Không có ảnh</div>
              )}
            </div>
            <div className="mt-3 space-y-2">
              <h3 className="line-clamp-1 text-sm font-black text-[#10150f] uppercase tracking-tight">{outfit.name}</h3>
              <p className="text-lg font-black text-[#ff8a2a]">{formatVND(outfit.totalPrice)}</p>
              <button
                type="button"
                onClick={() => onSelectOutfit?.(outfit)}
                className="w-full rounded-full bg-[#c9ff3d] hover:bg-[#d8ff5a] px-3 py-2 text-xs font-black uppercase tracking-wider text-[#10150f] shadow-sm transition hover:-translate-y-0.5"
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
