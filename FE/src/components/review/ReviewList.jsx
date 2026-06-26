import ReviewItem from './ReviewItem'

export default function ReviewList({
  reviews = [],
  loading = false,
  pagination = null,
  onLoadMore,
}) {
  const total = Number(pagination?.total || 0)
  const page = Number(pagination?.page || 1)
  const pages = Number(pagination?.pages || 1)
  const canLoadMore = page < pages

  if (loading && reviews.length === 0) {
    return (
      <div className="rounded-[28px] border border-[rgba(16,21,15,0.1)] bg-[#fffaf0] px-4 py-6 text-sm font-semibold text-[#596255]">
        Đang tải đánh giá...
      </div>
    )
  }

  if (!loading && reviews.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-[rgba(16,21,15,0.15)] bg-[#fffaf0]/40 px-4 py-8 text-center text-sm font-semibold text-[#596255]">
        Chưa có đánh giá nào
      </div>
    )
  }

  return (
    <section className="space-y-3">
      <p className="text-xs font-black uppercase tracking-wider text-[#596255]">Tất cả ({total})</p>
      {reviews.map((review) => (
        <ReviewItem key={review._id} review={review} />
      ))}

      {canLoadMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          className="h-10 rounded-full border border-[rgba(16,21,15,0.15)] bg-[#fffaf0] px-6 text-xs font-black uppercase tracking-wider text-[#10150f] hover:bg-[#ebe7dc] transition"
        >
          Xem thêm
        </button>
      ) : null}
    </section>
  )
}
