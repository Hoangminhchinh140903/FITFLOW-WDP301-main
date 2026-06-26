const PRICE_OPTIONS = [
  { value: '', label: 'Tất cả mức giá' },
  { value: 'low', label: 'Dưới 300.000đ' },
  { value: 'mid', label: '300.000đ - 700.000đ' },
  { value: 'high', label: 'Trên 700.000đ' },
];

export default function FilterSidebar({
  mode = 'shop',
  categories = [],
  filters,
  onChange,
  onReset,
  sizeOptions = [],
  colorOptions = [],
  className = '',
}) {
  const isRent = mode === 'rent';

  return (
    <aside className={`space-y-5 rounded-[28px] border border-[rgba(16,21,15,0.1)] bg-[#fffaf0] p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between border-b border-[rgba(16,21,15,0.08)] pb-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#10150f]">Bộ lọc</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-black uppercase tracking-wider text-[#ff8a2a] transition hover:opacity-80"
        >
          Đặt lại
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#596255]">Danh mục</label>
        <select
          value={filters.category}
          onChange={(event) => onChange('category', event.target.value)}
          className="w-full rounded-xl border border-[rgba(16,21,15,0.12)] bg-white px-3 py-2 text-sm text-[#10150f] font-semibold outline-none focus:border-[#c9ff3d] focus:ring-2 focus:ring-[#c9ff3d]/20 transition"
        >
          <option value="">{isRent ? 'Xem tất cả sản phẩm' : 'Tất cả danh mục'}</option>
          {categories.map((category) => (
            <option key={category.value} value={category.value}>
              {category.displayName} ({category.count || 0})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#596255]">Màu sắc</label>
        <select
          value={filters.color}
          onChange={(event) => onChange('color', event.target.value)}
          className="w-full rounded-xl border border-[rgba(16,21,15,0.12)] bg-white px-3 py-2 text-sm text-[#10150f] font-semibold outline-none focus:border-[#c9ff3d] focus:ring-2 focus:ring-[#c9ff3d]/20 transition"
        >
          <option value="">Tất cả màu</option>
          {colorOptions.map((color) => (
            <option key={color} value={color}>
              {color}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#596255]">Kích cỡ</label>
        <select
          value={filters.size}
          onChange={(event) => onChange('size', event.target.value)}
          className="w-full rounded-xl border border-[rgba(16,21,15,0.12)] bg-white px-3 py-2 text-sm text-[#10150f] font-semibold outline-none focus:border-[#c9ff3d] focus:ring-2 focus:ring-[#c9ff3d]/20 transition"
        >
          <option value="">Tất cả kích cỡ</option>
          {sizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#596255]">Sản phẩm</label>
        <select
          value={filters.productType}
          onChange={(event) => onChange('productType', event.target.value)}
          className="w-full rounded-xl border border-[rgba(16,21,15,0.12)] bg-white px-3 py-2 text-sm text-[#10150f] font-semibold outline-none focus:border-[#c9ff3d] focus:ring-2 focus:ring-[#c9ff3d]/20 transition"
        >
          <option value="">Tất cả sản phẩm</option>
          <option value="apparel">Quần áo</option>
          <option value="shoes">Giày</option>
          <option value="accessories">Phụ kiện</option>
          <option value="racket">Vợt (Tennis/Pickleball)</option>
        </select>
      </div>


      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#596255]">Khoảng giá</label>
        <select
          value={filters.price}
          onChange={(event) => onChange('price', event.target.value)}
          className="w-full rounded-xl border border-[rgba(16,21,15,0.12)] bg-white px-3 py-2 text-sm text-[#10150f] font-semibold outline-none focus:border-[#c9ff3d] focus:ring-2 focus:ring-[#c9ff3d]/20 transition"
        >
          {PRICE_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
