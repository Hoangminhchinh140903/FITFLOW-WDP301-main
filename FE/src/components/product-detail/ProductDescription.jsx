import { useEffect, useMemo, useRef, useState } from "react";



const getSizeCenter = (row = {}) => {
  const heightMin = Number(row?.heightMin)
  const heightMax = Number(row?.heightMax)
  const weightMin = Number(row?.weightMin)
  const weightMax = Number(row?.weightMax)

  const heightCenter = Number.isFinite(heightMin) && Number.isFinite(heightMax)
    ? (heightMin + heightMax) / 2
    : Number.POSITIVE_INFINITY

  const weightCenter = Number.isFinite(weightMin) && Number.isFinite(weightMax)
    ? (weightMin + weightMax) / 2
    : Number.POSITIVE_INFINITY

  return { heightCenter, weightCenter }
}

const formatRange = (minValue, maxValue) => {
  const minNum = Number(minValue)
  const maxNum = Number(maxValue)
  if (!Number.isFinite(minNum) || !Number.isFinite(maxNum)) return '--'
  return `${minNum}-${maxNum}`
}

const formatOptional = (value) => {
  if (value === null || value === undefined || value === '') return '--'
  const num = Number(value)
  return Number.isFinite(num) ? String(num) : '--'
}

const formatRecommendationSource = (source) => {
  return String(source || '').toLowerCase() === 'product' ? 'size riêng sản phẩm' : 'size global'
}

export default function ProductDescription({
  category = "",
  description = "",
  sizeGuideRows = [],
  sizeGuideSource = 'global',
  selectedGender = 'female',
  onGenderChange,
  sizeRecommendationInput = { heightCm: '', weightKg: '' },
  onSizeRecommendationInputChange,
  onRecommendSize,
  sizeRecommendationResult = null,
  sizeRecommendationError = '',
  sizeRecommendationLoading = false,
}) {
  const [tab, setTab] = useState("description");
  const [expanded, setExpanded] = useState(false);
  const sizeSectionRef = useRef(null);
  const safeText = String(description || "").trim();
  const shouldCollapse = safeText.length > 280;

  const tabs = useMemo(() => {
    const list = [
      { key: "description", label: "Mô tả" },
      { key: "policy", label: "Chính sách thuê" },
    ];
    if (['Shoes', 'Apparel'].includes(category)) {
      list.push({ key: "size", label: "Bảng size" });
    }
    return list;
  }, [category]);

  const sortedSizeRows = useMemo(() => (
    (Array.isArray(sizeGuideRows) ? sizeGuideRows : []).slice().sort((a, b) => {
      const orderA = Number(a?.displayOrder)
      const orderB = Number(b?.displayOrder)
      const hasOrderA = Number.isFinite(orderA)
      const hasOrderB = Number.isFinite(orderB)
      if (hasOrderA && hasOrderB && orderA !== orderB) {
        return orderA - orderB
      }

      if (hasOrderA !== hasOrderB) {
        return hasOrderA ? -1 : 1
      }

      const centerA = getSizeCenter(a)
      const centerB = getSizeCenter(b)
      if (centerA.heightCenter !== centerB.heightCenter) {
        return centerA.heightCenter - centerB.heightCenter
      }

      if (centerA.weightCenter !== centerB.weightCenter) {
        return centerA.weightCenter - centerB.weightCenter
      }

      return String(a?.sizeLabel || '').localeCompare(String(b?.sizeLabel || ''))
    })
  ), [sizeGuideRows])

  const displayText = useMemo(() => {
    if (!shouldCollapse || expanded) return safeText || "Chưa có mô tả.";
    return `${safeText.slice(0, 280)}...`;
  }, [expanded, safeText, shouldCollapse]);

  useEffect(() => {
    const handleOpenSizeGuide = () => {
      setTab('size');
      requestAnimationFrame(() => {
        sizeSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    };

    window.addEventListener('open-size-guide', handleOpenSizeGuide);
    return () => {
      window.removeEventListener('open-size-guide', handleOpenSizeGuide);
    };
  }, []);

  return (
    <section className="border-t border-[rgba(16,21,15,0.08)] pt-6">
      <div className="flex gap-6 border-b border-[rgba(16,21,15,0.08)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`relative pb-3 text-xs font-black uppercase tracking-wider transition ${
              tab === t.key
                ? "text-[#10150f] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-[#10150f]"
                : "text-[#8d9788] hover:text-[#596255]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "description" && (
        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-[#10150f]">Về sản phẩm</h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#596255] font-semibold">
              {displayText}
            </p>
            {shouldCollapse && (
              <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="mt-3 text-xs font-black uppercase tracking-wider text-[#10150f] underline hover:opacity-85"
              >
                {expanded ? "Thu gọn" : "Xem thêm"}
              </button>
            )}
          </div>

          <div className="rounded-[24px] border border-[rgba(16,21,15,0.1)] bg-[#fffaf0] p-5">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-[#8d9788]">Cách thuê hoạt động</h4>
            {['Tennis', 'Badminton', 'Pickleball'].includes(category) ? (
              <ol className="mt-4 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10150f] text-[11px] font-black text-[#c9ff3d]">1</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#10150f]">Đặt cọc 50%</p>
                    <p className="text-[11px] font-semibold text-[#8d9788] mt-0.5">Thanh toán 50% giá trị vợt để giữ lịch thuê.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10150f] text-[11px] font-black text-[#c9ff3d]">2</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#10150f]">Xác minh danh tính</p>
                    <p className="text-[11px] font-semibold text-[#8d9788] mt-0.5">Để lại Căn cước công dân khi nhận vợt tại cửa hàng.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10150f] text-[11px] font-black text-[#c9ff3d]">3</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#10150f]">Hoàn trả cọc</p>
                    <p className="text-[11px] font-semibold text-[#8d9788] mt-0.5">Hoàn lại tiền cọc sau khi trừ phí thuê và phí hỏng hóc (nếu có).</p>
                  </div>
                </li>
              </ol>
            ) : (
              <ol className="mt-4 space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10150f] text-[11px] font-black text-[#c9ff3d]">1</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#10150f]">Thuê 4 ngày</p>
                    <p className="text-[11px] font-semibold text-[#8d9788] mt-0.5">Nhận trước 2 ngày, trả sau sự kiện 1 ngày.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10150f] text-[11px] font-black text-[#c9ff3d]">2</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#10150f]">Bảo dưỡng hấp miễn phí</p>
                    <p className="text-[11px] font-semibold text-[#8d9788] mt-0.5">Dịch vụ bảo dưỡng bao gồm trong mỗi đơn thuê.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#10150f] text-[11px] font-black text-[#c9ff3d]">3</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#10150f]">Đổi trả dễ dàng</p>
                    <p className="text-[11px] font-semibold text-[#8d9788] mt-0.5">Nhãn vận chuyển trả hàng đã được chuẩn bị sẵn.</p>
                  </div>
                </li>
              </ol>
            )}
          </div>
        </div>
      )}

      {tab === "policy" && (
        <div className="mt-6 max-w-2xl space-y-3 text-sm leading-relaxed text-[#596255] font-semibold">
          {['Tennis', 'Badminton', 'Pickleball'].includes(category) ? (
            <>
              <p>Chính sách thuê là cọc 50% giá trị vợt và khi khách đến lấy vợt phải để lại căn cước công dân để xác minh.</p>
              <p>Sau khi hết thời gian thuê và trả lại vợt, shop sẽ tiến hành kiểm tra xác minh tình trạng vợt. Khách hàng sẽ được hoàn lại tiền cọc trừ đi tiền thuê vợt niêm yết và chi phí khắc phục hỏng hóc của vợt (nếu có).</p>
            </>
          ) : (
            <>
              <p>Không cần bảo dưỡng, dịch vụ bảo dưỡng chuyên nghiệp đã bao gồm trong giá thuê.</p>
            </>
          )}
        </div>
      )}

      {tab === "size" && (
        <div ref={sizeSectionRef} id="size-guide" className="mt-6">
          {category === 'Shoes' ? (
            <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#10150f]">Bảng size giày tiêu chuẩn</h3>
              <div className="overflow-x-auto rounded-[24px] border border-[rgba(16,21,15,0.1)] bg-white shadow-sm overflow-hidden">
                <table className="w-full min-w-[600px] border-collapse">
                  <thead className="bg-[#10150f] text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-[#c9ff3d]">Size (EU)</th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-white">Chiều dài chân (cm)</th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-white">US Nam</th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-white">US Nữ</th>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-white">UK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {eu: '36', len: '22.5 - 23.0', usM: '4.5', usW: '6.0', uk: '4.0'},
                      {eu: '37', len: '23.0 - 23.5', usM: '5.0', usW: '6.5', uk: '4.5'},
                      {eu: '38', len: '23.5 - 24.0', usM: '6.0', usW: '7.5', uk: '5.5'},
                      {eu: '39', len: '24.5 - 25.0', usM: '6.5', usW: '8.0', uk: '6.0'},
                      {eu: '40', len: '25.0 - 25.5', usM: '7.0', usW: '8.5', uk: '6.5'},
                      {eu: '41', len: '26.0 - 26.5', usM: '8.0', usW: '9.5', uk: '7.5'},
                      {eu: '42', len: '26.5 - 27.0', usM: '8.5', usW: '10.0', uk: '8.0'},
                      {eu: '43', len: '27.5 - 28.0', usM: '9.5', usW: '11.0', uk: '9.0'},
                      {eu: '44', len: '28.0 - 28.5', usM: '10.0', usW: '11.5', uk: '9.5'},
                      {eu: '45', len: '29.0 - 29.5', usM: '11.0', usW: '12.5', uk: '10.5'},
                    ].map((row) => (
                      <tr key={row.eu} className="border-t border-[rgba(16,21,15,0.06)] hover:bg-[#fffaf0]/40 transition">
                        <td className="px-4 py-3 text-sm font-black text-[#10150f]">{row.eu}</td>
                        <td className="px-4 py-3 text-sm text-[#596255] font-semibold">{row.len}</td>
                        <td className="px-4 py-3 text-sm text-[#596255] font-semibold">{row.usM}</td>
                        <td className="px-4 py-3 text-sm text-[#596255] font-semibold">{row.usW}</td>
                        <td className="px-4 py-3 text-sm text-[#596255] font-semibold">{row.uk}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#10150f]">Gợi ý chọn size</h3>
                  <p className="mt-1 text-[11px] font-semibold text-[#8d9788]">Dựa trên {formatRecommendationSource(sizeGuideSource)}</p>
                </div>

                <div className="flex rounded-xl bg-[#fffaf0] p-1 border border-[rgba(16,21,15,0.08)]">
                  <button
                    type="button"
                    onClick={() => onGenderChange?.('male')}
                    className={`flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition ${
                      selectedGender === 'male'
                        ? 'bg-white text-[#10150f] shadow-sm'
                        : 'text-[#8d9788] hover:text-[#596255]'
                    }`}
                  >
                    Nam
                  </button>
                  <button
                    type="button"
                    onClick={() => onGenderChange?.('female')}
                    className={`flex-1 rounded-lg py-2 text-xs font-black uppercase tracking-wider transition ${
                      selectedGender === 'female'
                        ? 'bg-white text-[#10150f] shadow-sm'
                        : 'text-[#8d9788] hover:text-[#596255]'
                    }`}
                  >
                    Nữ
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#596255]">Chiều cao (cm)</label>
                    <input
                      type="number"
                      placeholder="VD: 170"
                      value={sizeRecommendationInput.heightCm}
                      onChange={(e) => onSizeRecommendationInputChange?.('heightCm', e.target.value)}
                      className="h-10 w-full rounded-xl border border-[rgba(16,21,15,0.12)] bg-white px-3 text-sm text-[#10150f] font-semibold outline-none focus:border-[#c9ff3d] focus:ring-2 focus:ring-[#c9ff3d]/20 transition placeholder:text-[#8d9788]/60"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#596255]">Cân nặng (kg)</label>
                    <input
                      type="number"
                      placeholder="VD: 65"
                      value={sizeRecommendationInput.weightKg}
                      onChange={(e) => onSizeRecommendationInputChange?.('weightKg', e.target.value)}
                      className="h-10 w-full rounded-xl border border-[rgba(16,21,15,0.12)] bg-white px-3 text-sm text-[#10150f] font-semibold outline-none focus:border-[#c9ff3d] focus:ring-2 focus:ring-[#c9ff3d]/20 transition placeholder:text-[#8d9788]/60"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onRecommendSize}
                    disabled={sizeRecommendationLoading || !sizeRecommendationInput.heightCm || !sizeRecommendationInput.weightKg}
                    className="h-10 rounded-full bg-[#10150f] hover:bg-[#1b241b] px-5 text-xs font-black uppercase tracking-wider text-[#c9ff3d] transition disabled:opacity-60"
                  >
                    {sizeRecommendationLoading ? 'Đang tính...' : 'Tính size'}
                  </button>
                </div>

                {sizeRecommendationError ? (
                  <p className="text-xs font-bold text-rose-600">{sizeRecommendationError}</p>
                ) : null}

                {sizeRecommendationResult ? (
                  <div className="rounded-xl border border-[rgba(16,21,15,0.12)] bg-[#fffaf0] p-3 text-sm text-[#10150f]">
                    <p className="font-black">
                      Gợi ý size: <span className="text-[#10150f] text-lg font-black ml-1">{sizeRecommendationResult?.recommendedSize || '--'}</span>
                    </p>
                  </div>
                ) : null}
              </div>

              {sortedSizeRows.length > 0 ? (
                <div className="overflow-x-auto rounded-[24px] border border-[rgba(16,21,15,0.1)] bg-white shadow-sm overflow-hidden">
                  <table className="w-full min-w-[920px] border-collapse">
                    <thead className="bg-[#10150f] text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-[#c9ff3d]">Size</th>
                        <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-white">Chiều cao (cm)</th>
                        <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-white">Cân nặng (kg)</th>
                        <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-white">Dài áo (cm)</th>
                        <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-white">Rộng (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSizeRows.map((row) => (
                        <tr key={`${row.gender}-${row.sizeLabel}`} className="border-t border-[rgba(16,21,15,0.06)] hover:bg-[#fffaf0]/40 transition">
                          <td className="px-4 py-3 text-sm font-black text-[#10150f]">{row.sizeLabel}</td>
                          <td className="px-4 py-3 text-sm text-[#596255] font-semibold">{formatRange(row.heightMin, row.heightMax)}</td>
                          <td className="px-4 py-3 text-sm text-[#596255] font-semibold">{formatRange(row.weightMin, row.weightMax)}</td>
                          <td className="px-4 py-3 text-sm text-[#596255] font-semibold">{formatOptional(row.itemLength)}</td>
                          <td className="px-4 py-3 text-sm text-[#596255] font-semibold">{formatOptional(row.itemWidth)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm">Chưa có dữ liệu bảng size cho giới tính đã chọn.</p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
