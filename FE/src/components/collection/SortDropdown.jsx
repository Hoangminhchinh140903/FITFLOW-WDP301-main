const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng' },
  { value: 'price_desc', label: 'Giá giảm' },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(16,21,15,0.15)] bg-[#fffaf0] px-4 py-2 transition duration-150">
      <span className="text-[10px] font-black uppercase tracking-wider text-[#8d9788]">Sắp xếp</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="bg-transparent text-xs font-black uppercase tracking-wider text-[#10150f] outline-none cursor-pointer"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
