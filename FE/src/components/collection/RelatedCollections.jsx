import { Link } from 'react-router-dom';

export default function RelatedCollections({ collections = [] }) {
  if (!collections.length) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-[22px] font-black uppercase tracking-tight text-[#10150f]">Bộ Sưu Tập Liên Quan</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {collections.map((collection) => {
          const slug = collection?.slug || collection?._id || '';
          const image = collection?.banner || collection?.image || '';
          return (
            <Link
              key={slug || collection?.name}
              to={slug ? `/collections/${slug}` : '#'}
              className="group overflow-hidden rounded-[28px] border border-[rgba(16,21,15,0.1)] bg-[#fffaf0] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[0_24px_70px_rgba(16,21,15,0.15)]"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#ebe9e3]">
                {image ? (
                  <img
                    src={image}
                    alt={collection?.name || 'related-collection'}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">Không có ảnh</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="line-clamp-1 text-sm font-black text-[#10150f]">{collection?.name || 'Collection'}</h3>
                <p className="mt-1 text-xs font-semibold text-[#8d9788] line-clamp-2">{collection?.description || ''}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

