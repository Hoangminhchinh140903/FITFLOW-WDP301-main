const SORT_OPTIONS = [
  { value: 'top_liked', label: 'Nổi bật' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'name_asc', label: 'Tên A-Z' },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,21,15,0.15)] bg-[#fffaf0] px-4 py-2 transition hover:bg-[#ebe7dc]">
      <span className="text-[10px] font-black uppercase tracking-wider text-[#596255]">Sắp xếp</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-sm font-bold text-[#10150f] outline-none cursor-pointer"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#10150f] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
