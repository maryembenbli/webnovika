export function formatCurrency(value, locale = 'fr') {
  const safe = Number(value || 0);
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-TN' : 'fr-TN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
}

export function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export function imgUrl(path) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
}
