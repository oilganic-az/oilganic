import { describe, it, expect } from 'vitest';
import { buildWhatsAppOrderUrl } from './whatsapp';
import { PRODUCTS } from '../data/products';

describe('WhatsApp Order URL Generator', () => {
  it('generates appropriate message when cart is empty', () => {
    const url = buildWhatsAppOrderUrl([]);
    expect(url).toContain('https://wa.me/994773343536?text=');
    expect(url).toContain(encodeURIComponent('Salam, Oilganic mağazanız və məhsullarınız haqqında məlumat almaq istəyirəm.'));
  });

  it('formats multi-item order message and calculates total correctly', () => {
    const item1 = PRODUCTS[0];
    const item2 = PRODUCTS[2];

    const sampleItems = [
      {
        id: `${item1.id}-size-0`,
        product: item1,
        selectedSize: item1.sizes![0],
        quantity: 2,
        unitPrice: item1.sizes![0].price
      },
      {
        id: `${item2.id}-size-0`,
        product: item2,
        selectedSize: item2.sizes![0],
        quantity: 1,
        unitPrice: item2.sizes![0].price
      }
    ];

    const expectedTotal = (item1.sizes![0].price * 2) + item2.sizes![0].price;

    const url = buildWhatsAppOrderUrl(sampleItems);
    expect(url).toContain('https://wa.me/994773343536?text=');
    expect(url).toContain(encodeURIComponent(item1.name));
    expect(url).toContain(encodeURIComponent(item2.name));
    expect(url).toContain(encodeURIComponent(`${expectedTotal} ₼`));
  });

  it('includes customer name, delivery address, and notes when provided', () => {
    const item = PRODUCTS[0];
    const sampleItems = [
      {
        id: `${item.id}-size-0`,
        product: item,
        selectedSize: item.sizes![0],
        quantity: 1,
        unitPrice: item.price
      }
    ];

    const customerDetails = {
      customerName: 'Elvin Məmmədov',
      deliveryAddress: 'Nizami r-nu, Neftçilər m/st',
      note: 'Zəng edin'
    };

    const url = buildWhatsAppOrderUrl(sampleItems, customerDetails);
    expect(url).toContain(encodeURIComponent('Ad və soyad: Elvin Məmmədov'));
    expect(url).toContain(encodeURIComponent('Çatdırılma ünvanı: Nizami r-nu, Neftçilər m/st'));
    expect(url).toContain(encodeURIComponent('Əlavə qeyd: Zəng edin'));
  });

  it('encodes Azerbaijani special characters safely in URL', () => {
    const item = PRODUCTS[0];
    const url = buildWhatsAppOrderUrl([
      {
        id: item.id,
        product: item,
        selectedSize: item.sizes![0],
        quantity: 1,
        unitPrice: item.price
      }
    ]);

    expect(url).not.toContain(' ');
    expect(url).toContain('%C9%99'); // URL encoded 'ə'
  });
});
