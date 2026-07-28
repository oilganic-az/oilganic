/**
 * Formats a number into AZN currency string
 * Example: 18 -> "18.00 ₼" or "18 ₼"
 */
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2).replace(/\.00$/, '')} ₼`;
}

/**
 * Formats raw phone number to readable local format
 */
export function formatPhone(phone: string): string {
  return phone.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
}
