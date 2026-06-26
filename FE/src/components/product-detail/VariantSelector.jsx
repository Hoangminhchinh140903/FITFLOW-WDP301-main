import SizeSelector from './SizeSelector'

export default function VariantSelector({
  sizes,
  selectedSize,
  conditionOptions = [],
  selectedConditionKey = '',
  onConditionChange,
  onSizeChange,
  isSizeDisabled,
  isFreeSize,
  hasSizes = false,
}) {
  return (
    <div className="space-y-4 border-t border-[rgba(16,21,15,0.08)] pt-4">
      {hasSizes ? (
        <>
          <SizeSelector
            sizes={sizes}
            selectedSize={selectedSize}
            onSelect={onSizeChange}
            isDisabled={isSizeDisabled}
            isFreeSize={isFreeSize}
          />
          <button
            type="button"
            className="h-10 w-full rounded-full border border-[rgba(16,21,15,0.15)] bg-[#fffaf0] px-4 text-xs font-black uppercase tracking-wider text-[#10150f] hover:bg-[#ebe7dc] transition mt-2"
            onClick={() => window.dispatchEvent(new Event('open-size-guide'))}
          >
            Bảng tư vấn size
          </button>
        </>
      ) : (
        <div className="space-y-2">
          <div className="rounded-xl border border-[rgba(16,21,15,0.1)] bg-white/50 px-3 py-2 text-xs font-bold text-[#596255]">
            Sản phẩm không phân size
          </div>
          <button
            type="button"
            className="h-10 w-full rounded-full border border-[rgba(16,21,15,0.15)] bg-[#fffaf0] px-4 text-xs font-black uppercase tracking-wider text-[#10150f] hover:bg-[#ebe7dc] transition"
            onClick={() => window.dispatchEvent(new Event('open-size-guide'))}
          >
            Bảng tư vấn size
          </button>
        </div>
      )}

      {conditionOptions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-xs font-black uppercase tracking-wider text-[#10150f]">
              Tình trạng sản phẩm
            </p>
            <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-600">
              Chỉ áp dụng khi Mua
            </span>
          </div>
          <p className="text-[11px] font-semibold text-[#8d9788]">
            Khi thuê, hệ thống tự động chọn sản phẩm phù hợp.
          </p>
          <div className="flex flex-wrap gap-2">
            {conditionOptions.map((option) => {
              const active = selectedConditionKey === option.key
              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => onConditionChange?.(option.key)}
                  className={`inline-flex h-10 items-center justify-center rounded-full border px-4 text-xs font-black uppercase tracking-wider transition focus:outline-none ${
                    active
                      ? 'border-[#10150f] bg-[#10150f] text-[#c9ff3d]'
                      : 'border-[rgba(16,21,15,0.15)] bg-white text-[#10150f] hover:border-[#10150f]'
                  }`}
                  aria-pressed={active}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

