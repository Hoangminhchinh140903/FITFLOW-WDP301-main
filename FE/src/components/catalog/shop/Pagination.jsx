export default function Pagination({ page, totalPages, onPageChange }) {
  if (Number(totalPages || 1) <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        className="rounded-full border border-[rgba(16,21,15,0.15)] bg-[#fffaf0] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#10150f] transition hover:bg-[#ebe7dc] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Trước
      </button>
      <span className="text-sm font-bold text-[#596255]">
        Trang {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        className="rounded-full border border-[rgba(16,21,15,0.15)] bg-[#fffaf0] px-4 py-2 text-xs font-black uppercase tracking-wider text-[#10150f] transition hover:bg-[#ebe7dc] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sau
      </button>
    </div>
  );
}
