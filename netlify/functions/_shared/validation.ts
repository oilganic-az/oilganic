import { Product, ProductSize, ProductImage } from '../../../src/types/product';
import { Campaign } from '../../../src/types/campaign';

const ALLOWED_PRODUCT_FIELDS = new Set([
  'id',
  'slug',
  'name',
  'categoryId',
  'shortDescription',
  'description',
  'price',
  'currency',
  'unitLabel',
  'sizes',
  'images',
  'ingredients',
  'usage',
  'storage',
  'allergens',
  'origin',
  'productionType',
  'manufacturer',
  'inStock',
  'featured',
  'tags',
  'woltUrl',
  'verificationStatus',
  'priceStatus',
  'quantityStatus'
]);

export function validateSafeImagePath(src: string): boolean {
  if (!src || typeof src !== 'string') return false;
  if (src.includes('..') || src.includes('\0')) return false;

  if (src.startsWith('/')) {
    return src.startsWith('/images/') || src.startsWith('/uploads/') || src.startsWith('/brand/');
  }

  if (src.startsWith('http://') || src.startsWith('https://')) {
    return true;
  }

  return false;
}

export function validateProductServer(data: unknown): Product {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Məhsul obyekti yanlışdır.');
  }

  const obj = data as Record<string, unknown>;

  // Reject unknown / dangerous fields
  for (const key of Object.keys(obj)) {
    if (!ALLOWED_PRODUCT_FIELDS.has(key)) {
      throw new Error(`İcazə verilməyən sahə aşkar edildi: ${key}`);
    }
  }

  if (typeof obj.id !== 'string' || !obj.id.trim() || obj.id.length > 100) {
    throw new Error('Məhsul ID-si yanlışdır.');
  }

  if (typeof obj.name !== 'string' || !obj.name.trim() || obj.name.length > 120) {
    throw new Error('Məhsul adı yanlışdır (maksimum 120 simvol).');
  }

  if (typeof obj.slug !== 'string' || !obj.slug.trim() || obj.slug.length > 120 || !/^[a-z0-9-]+$/.test(obj.slug)) {
    throw new Error('Məhsul slug-ı yanlışdır (yalnız kiçik hərflər, rəqəmlər və tire).');
  }

  if (typeof obj.categoryId !== 'string' || !obj.categoryId.trim()) {
    throw new Error('Məhsul kateqoriyası tələb olunur.');
  }

  if (typeof obj.shortDescription !== 'string' || obj.shortDescription.length > 500) {
    throw new Error('Qısa təsvir 500 simvoldan çox ola bilməz.');
  }

  if (obj.description !== undefined && typeof obj.description !== 'string') {
    throw new Error('Təsvir mətni yanlışdır.');
  }

  if (obj.price !== null && obj.price !== undefined) {
    if (typeof obj.price !== 'number' || !Number.isFinite(obj.price) || obj.price < 0) {
      throw new Error('Qiymət mənfi olmayan ədəd olmalıdır.');
    }
  }

  if (obj.currency !== undefined && obj.currency !== 'AZN') {
    throw new Error('Valyuta AZN olmalıdır.');
  }

  if (typeof obj.inStock !== 'boolean') {
    throw new Error('Stok vəziyyəti (inStock) boolean olmalıdır.');
  }

  // Validate sizes array if present
  const sizes: ProductSize[] = [];
  if (obj.sizes !== undefined) {
    if (!Array.isArray(obj.sizes)) {
      throw new Error('Ölçülər (sizes) massiv olmalıdır.');
    }

    const sizeIds = new Set<string>();
    for (const [idx, s] of obj.sizes.entries()) {
      if (!s || typeof s !== 'object') throw new Error(`Ölçü [${idx}] obyekt deyil.`);
      const sObj = s as Record<string, unknown>;

      if (typeof sObj.id !== 'string' || !sObj.id.trim()) throw new Error(`Ölçü [${idx}] ID yoxdur.`);
      if (sizeIds.has(sObj.id)) throw new Error(`Təkrarlanan ölçü ID: ${sObj.id}`);
      sizeIds.add(sObj.id);

      if (typeof sObj.label !== 'string' || !sObj.label.trim()) throw new Error(`Ölçü [${idx}] adı yoxdur.`);
      if (sObj.price !== null && (typeof sObj.price !== 'number' || !Number.isFinite(sObj.price) || sObj.price < 0)) {
        throw new Error(`Ölçü [${idx}] qiyməti yanlışdır.`);
      }
      if (typeof sObj.inStock !== 'boolean') throw new Error(`Ölçü [${idx}] stok vəziyyəti boolean deyil.`);

      sizes.push({
        id: sObj.id,
        label: sObj.label,
        price: sObj.price as number | null,
        inStock: sObj.inStock
      });
    }
  }

  // Validate images
  const images: ProductImage[] = [];
  if (!Array.isArray(obj.images)) {
    throw new Error('Məhsul şəkilləri (images) massiv olmalıdır.');
  }

  for (const [idx, img] of obj.images.entries()) {
    if (!img || typeof img !== 'object') throw new Error(`Şəkil [${idx}] obyekt deyil.`);
    const imgObj = img as Record<string, unknown>;

    if (typeof imgObj.src !== 'string' || !validateSafeImagePath(imgObj.src)) {
      throw new Error(`Şəkil [${idx}] unvanı təhlükəsiz deyil: ${imgObj.src}`);
    }

    images.push({
      src: imgObj.src,
      alt: typeof imgObj.alt === 'string' ? imgObj.alt : obj.name
    });
  }

  return {
    id: obj.id,
    slug: obj.slug,
    name: obj.name,
    categoryId: obj.categoryId,
    shortDescription: obj.shortDescription,
    description: (obj.description as string) || undefined,
    price: (obj.price as number) ?? null,
    currency: 'AZN',
    unitLabel: (obj.unitLabel as string) || undefined,
    sizes: sizes.length > 0 ? sizes : undefined,
    images: images.length > 0 ? images : [{ src: '/images/products/placeholder.jpg', alt: obj.name }],
    inStock: obj.inStock,
    verificationStatus: 'verified'
  };
}

export function validateCampaignServer(data: unknown): Campaign {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Kampaniya obyekti yanlışdır.');
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.id !== 'string' || !obj.id.trim()) {
    throw new Error('Kampaniya ID-si tələb olunur.');
  }

  if (typeof obj.title !== 'string' || !obj.title.trim() || obj.title.length > 150) {
    throw new Error('Kampaniya başlığı yanlışdır.');
  }

  if (typeof obj.conditions !== 'string' || !obj.conditions.trim()) {
    throw new Error('Kampaniya şərtləri tələb olunur.');
  }

  if (typeof obj.isActive !== 'boolean') {
    throw new Error('Aktivlik vəziyyəti (isActive) boolean olmalıdır.');
  }

  if (obj.imageSrc !== undefined && obj.imageSrc !== '' && typeof obj.imageSrc === 'string') {
    if (!validateSafeImagePath(obj.imageSrc)) {
      throw new Error(`Kampaniya şəkli unvanı təhlükəsiz deyil: ${obj.imageSrc}`);
    }
  }

  return {
    id: obj.id,
    title: obj.title,
    conditions: obj.conditions,
    isActive: obj.isActive,
    startDate: (obj.startDate as string) || undefined,
    endDate: (obj.endDate as string) || undefined,
    imageSrc: (obj.imageSrc as string) || undefined
  };
}

export function validateImageSignature(buffer: Buffer): 'jpeg' | 'png' | 'webp' {
  if (buffer.length < 12) {
    throw new Error('Şəkil faylı çox kiçikdir və ya zədələnib.');
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'jpeg';
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'png';
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46; // "RIFF"
  const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50; // "WEBP"

  if (isRiff && isWebp) {
    return 'webp';
  }

  throw new Error('Yalnız JPEG, PNG və ya WebP formatlı şəkillərə icazə verilir. İcra oluna bilən fayllar qadağandır.');
}
