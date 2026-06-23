export function normalizePhone10(value = '') {
  return String(value).replace(/\D/g, '').slice(0, 10);
}

export function isPhone10(value = '') {
  return normalizePhone10(value).length === 10;
}
