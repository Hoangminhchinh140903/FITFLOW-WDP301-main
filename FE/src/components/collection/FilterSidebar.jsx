const toArray = (value) => (Array.isArray(value) ? value : []);

function ToggleGroup({ title, options = [], selected = [], onToggle }) {
  if (!options.length) return null;
  return (
    <div className="space-y-2">
      <p className="text-xs font-black uppercase tracking-wider text-[#10150f]">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const value = String(option?.value ?? option).trim();
          const label = String(option?.label ?? option).trim();
          if (!value) return null;
          const active = selected.includes(value);
          return (
            <button
              key={`${title}-${value}`}
              type="button"
              onClick={() => onToggle(value)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition focus:outline-none ${
                active
                  ? 'border-[#10150f] bg-[#10150f] text-[#c9ff3d]'
                  : 'border-[rgba(16,21,15,0.15)] bg-white text-[#10150f] hover:border-[#10150f]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterSidebar({
  filters = {},
  selectedFilters,
  onToggleFilter,
  onPriceChange,
  onReset,
}) {
  const categories = toArray(filters?.categories);
  const colors = toArray(filters?.colors);
  const sizes = toArray(filters?.sizes);
  const min = Number(filters?.priceRange?.min || 0);
  const max = Number(filters?.priceRange?.max || 0);
  const selectedMin = Number(selectedFilters?.price?.min ?? min);
  const selectedMax = Number(selectedFilters?.price?.max ?? max);

  return (
    <aside className="space-y-5 rounded-[28px] border border-[rgba(16,21,15,0.1)] bg-[#fffaf0] p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-wider text-[#10150f]">Bộ lọc</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-[#596255] hover:text-[#10150f] transition underline underline-offset-2"
        >
          Đặt lại
        </button>
      </div>

      <ToggleGroup
        title="Danh mục"
        options={categories}
        selected={selectedFilters?.category || []}
        onToggle={(value) => onToggleFilter('category', value)}
      />

      <ToggleGroup
        title="Màu sắc"
        options={colors}
        selected={selectedFilters?.color || []}
        onToggle={(value) => onToggleFilter('color', value)}
      />

      <ToggleGroup
        title="Kích thước"
        options={sizes}
        selected={selectedFilters?.size || []}
        onToggle={(value) => onToggleFilter('size', value)}
      />

      {max > min ? (
        <div className="space-y-3 pt-2 border-t border-[rgba(16,21,15,0.06)]">
          <p className="text-xs font-black uppercase tracking-wider text-[#10150f]">Khoảng giá</p>
          <div className="space-y-3">
            <input
              type="range"
              min={min}
              max={max}
              value={selectedMin}
              onChange={(event) => onPriceChange('min', Number(event.target.value))}
              className="w-full accent-[#10150f]"
            />
            <input
              type="range"
              min={min}
              max={max}
              value={selectedMax}
              onChange={(event) => onPriceChange('max', Number(event.target.value))}
              className="w-full accent-[#10150f]"
            />
            <p className="text-xs font-semibold text-[#8d9788]">
              {selectedMin.toLocaleString('vi-VN')}đ - {selectedMax.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

