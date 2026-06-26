import StarRating from './StarRating'

const STAR_ROWS = [5, 4, 3, 2, 1]

export default function ReviewSummary({ summary }) {
  const averageRating = Number(summary?.averageRating || 0)
  const reviewCount = Number(summary?.reviewCount || 0)
  const breakdown = summary?.breakdown || {}

  return (
    <section className="rounded-[28px] border border-[rgba(16,21,15,0.1)] bg-[#fffaf0] p-6 shadow-sm">
      <h3 className="text-sm font-black uppercase tracking-wider text-[#10150f]">Điểm đánh giá trung bình</h3>
      <div className="mt-4 flex flex-col gap-5 lg:flex-row">
        <div className="min-w-[210px] rounded-[20px] border border-[rgba(16,21,15,0.08)] bg-white/50 p-4 text-center">
          <p className="text-4xl font-black text-[#10150f]">{averageRating.toFixed(1)}</p>
          <div className="mt-2 flex justify-center">
            <StarRating value={Math.round(averageRating)} disabled />
          </div>
          <p className="mt-2 text-xs font-semibold text-[#8d9788]">{reviewCount} đánh giá</p>
        </div>

        <div className="flex-1 space-y-2">
          {STAR_ROWS.map((star) => {
            const count = Number(breakdown?.[star] || 0)
            const width = reviewCount > 0 ? `${Math.round((count / reviewCount) * 100)}%` : '0%'

            return (
              <div key={star} className="flex items-center gap-3">
                <span className="min-w-[48px] text-xs font-black uppercase tracking-wider text-[#596255]">{star} sao</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[rgba(16,21,15,0.08)]">
                  <div className="h-full rounded-full bg-[#10150f]" style={{ width }} />
                </div>
                <span className="min-w-[36px] text-right text-xs font-bold text-[#8d9788]">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
