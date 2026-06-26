export default function ProductInfo({
  name,
  rentPriceText,
  salePriceText,
  isRentable = true,
  variantContent,
  actionsContent,
}) {
  return (
    <div className="rounded-[28px] border border-[rgba(16,21,15,0.1)] bg-[#fffaf0] p-6 shadow-sm space-y-5">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-6 items-center rounded-full bg-[#10150f] px-3 text-[10px] font-black uppercase tracking-wider text-[#c9ff3d]">
            Còn hàng
          </span>
        </div>

        <h1 className="text-[24px] font-black leading-tight text-[#10150f] md:text-[28px] uppercase tracking-tight">
          {name || "Sản phẩm"}
        </h1>
        <p className="text-xs font-bold uppercase tracking-wider text-[#8d9788]">Bởi Fitflow Collection</p>
      </div>

      <div className="rounded-2xl border border-[rgba(16,21,15,0.1)] bg-white/50 p-4">
        <div className="grid grid-cols-2 gap-4">
          {isRentable && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#596255]">
                Giá thuê / ngày
              </p>
              <p className="mt-1 text-2xl font-black text-[#10150f]">
                {rentPriceText}
              </p>
            </div>
          )}

          <div className={isRentable ? "border-l border-[rgba(16,21,15,0.1)] pl-4" : ""}>
            <p className="text-[10px] font-black uppercase tracking-wider text-[#596255]">
              Giá mua
            </p>
            <p className="mt-1 text-2xl font-black text-[#10150f]">
              {salePriceText}
            </p>
          </div>
        </div>
      </div>

      {variantContent}
      {actionsContent}
    </div>
  );
}
