import { CartItem } from '../types/cart';
import { BUSINESS_CONFIG } from '../config/business';
import { formatCurrency } from './formatters';

export interface CustomerDetails {
  customerName?: string;
  deliveryAddress?: string;
  note?: string;
}

/**
 * Builds encoded WhatsApp URL with structured order summary and customer details
 */
export function buildWhatsAppOrderUrl(
  items: CartItem[],
  customerDetails?: CustomerDetails
): string {
  if (!items || items.length === 0) {
    return `${BUSINESS_CONFIG.whatsappLink}?text=${encodeURIComponent('Salam, Oilganic mağazanız və məhsullarınız haqqında məlumat almaq istəyirəm.')}`;
  }

  const lines: string[] = [
    'Salam, Oilganic mağazasından sifariş vermək istəyirəm:\n'
  ];

  let totalPrice = 0;

  items.forEach((item, index) => {
    const sizeLabel = item.selectedSize ? ` (${item.selectedSize.label})` : '';
    const itemTotal = item.unitPrice * item.quantity;
    totalPrice += itemTotal;

    lines.push(`${index + 1}. ${item.product.name}${sizeLabel} x ${item.quantity} - ${formatCurrency(itemTotal)}`);
  });

  lines.push(`\n*Ümumi məbləğ:* ${formatCurrency(totalPrice)}`);
  lines.push(`\nAd və soyad: ${customerDetails?.customerName?.trim() || ''}`);
  lines.push(`Çatdırılma ünvanı: ${customerDetails?.deliveryAddress?.trim() || ''}`);
  lines.push(`Əlavə qeyd: ${customerDetails?.note?.trim() || ''}`);

  const fullText = lines.join('\n');
  return `${BUSINESS_CONFIG.whatsappLink}?text=${encodeURIComponent(fullText)}`;
}
