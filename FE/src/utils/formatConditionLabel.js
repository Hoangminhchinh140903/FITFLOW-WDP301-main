export const formatConditionLabel = (percent) => {
  const normalized = Number(percent);

  if (normalized === 100) return 'Mới - 100%';
  if (normalized >= 90) return `Tình trạng tốt - ${normalized}%`;
  return `Tình trạng ổn - ${normalized}%`;
};

export const getConditionBadgeClass = (percent) => {
  const normalized = Number(percent);
  if (normalized === 100) return 'bg-emerald-100 text-emerald-700';
  if (normalized >= 90) return 'bg-sky-100 text-sky-700';
  return 'bg-amber-100 text-amber-700';
};

