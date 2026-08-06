import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, RotateCcw, LogOut, Package, Upload, Gift, Calendar, CheckCircle2 } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { useCampaigns } from '../../context/CampaignsContext';
import { useAdminAuth } from '../../components/auth/AdminGuard';
import { CATEGORIES } from '../../data/categories';
import { Product } from '../../types/product';
import { Button } from '../../components/common/Button/Button';
import { formatCurrency } from '../../utils/formatters';
import { SEO } from '../../components/common/SEO/SEO';
import { sanitizeInput } from '../../utils/security';
import styles from './AdminPage.module.css';

export const AdminDashboardPage: React.FC = () => {
  const { csrfToken, logout } = useAdminAuth();
  const { products, addProduct, updateProduct, deleteProduct, resetToDefaultProducts } = useProducts();
  const { campaigns, addCampaign, deleteCampaign, toggleCampaignStatus } = useCampaigns();

  const [activeTab, setActiveTab] = useState<'products' | 'campaigns'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Product Modals State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // Async operation feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [statusNotice, setStatusNotice] = useState('');

  // Campaign Modal State
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campTitle, setCampTitle] = useState('');
  const [campConditions, setCampConditions] = useState('');
  const [campStartDate, setCampStartDate] = useState('');
  const [campEndDate, setCampEndDate] = useState('');
  const [campImageSrc, setCampImageSrc] = useState('');

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const openAddModal = () => {
    setIsAddMode(true);
    setEditingProduct({
      name: '',
      slug: '',
      categoryId: 'oils',
      price: 0,
      unitLabel: '100ml',
      shortDescription: '',
      description: '',
      inStock: true,
      featured: false,
      images: [{ src: '/images/products/placeholder.jpg', alt: '' }],
      currency: 'AZN',
      verificationStatus: 'verified'
    });
    setIsEditModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setIsAddMode(false);
    setEditingProduct({ ...product });
    setIsEditModalOpen(true);
  };

  const uploadImageFile = async (file: File, folder: 'products' | 'campaigns'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const fileData = reader.result as string;
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          };
          if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

          const res = await fetch('/api/admin-upload-image', {
            method: 'POST',
            headers,
            credentials: 'include',
            body: JSON.stringify({ fileData, folder })
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.success) {
            return reject(new Error(data.error || 'Şəkil yüklənərkən xəta baş verdi.'));
          }

          resolve(data.url);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Fayl oxunmadı.'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setSaveError('');
    setIsSaving(true);
    try {
      const uploadedUrl = await uploadImageFile(file, 'products');
      setEditingProduct({
        ...editingProduct,
        images: [{ src: uploadedUrl, alt: editingProduct.name || '' }]
      });
      setStatusNotice('Şəkil uğurla yükləndi.');
    } catch (err: unknown) {
      console.error('Image upload failed:', err);
      setSaveError((err as Error).message || 'Şəkil yüklənərkən xəta baş verdi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCampaignImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaveError('');
    setIsSaving(true);
    try {
      const uploadedUrl = await uploadImageFile(file, 'campaigns');
      setCampImageSrc(uploadedUrl);
      setStatusNotice('Kampaniya şəkli uğurla yükləndi.');
    } catch (err: unknown) {
      console.error('Campaign image upload failed:', err);
      setSaveError((err as Error).message || 'Şəkil yüklənərkən xəta baş verdi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || editingProduct.price === undefined) return;

    setSaveError('');
    setStatusNotice('');
    setIsSaving(true);
    try {
      const sanitizedName = sanitizeInput(editingProduct.name);
      const sanitizedShortDesc = sanitizeInput(editingProduct.shortDescription || '');
      const sanitizedDesc = sanitizeInput(editingProduct.description || '');
      const sanitizedUnitLabel = sanitizeInput(editingProduct.unitLabel || 'ədəd');
      const mainImg = editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images[0].src
        : '/images/products/placeholder.jpg';

      let preparedSizes = editingProduct.sizes;
      if (isAddMode || !preparedSizes || preparedSizes.length === 0) {
        const sizeLabel = sanitizedUnitLabel === 'kg' ? '1 kg' : sanitizedUnitLabel;
        preparedSizes = [
          {
            id: `size-${Date.now()}`,
            label: sizeLabel,
            price: Number(editingProduct.price),
            inStock: editingProduct.inStock ?? true,
            verificationStatus: 'verified',
            imageSrc: mainImg
          }
        ];
      }

      const preparedProduct: Partial<Product> = {
        ...editingProduct,
        name: sanitizedName,
        shortDescription: sanitizedShortDesc,
        description: sanitizedDesc,
        unitLabel: sanitizedUnitLabel,
        slug: editingProduct.slug || sanitizedName.toLowerCase().replace(/\s+/g, '-'),
        sizes: preparedSizes,
        images: [{ src: mainImg, alt: sanitizedName }]
      };

      let result;
      if (isAddMode) {
        result = await addProduct(preparedProduct as Omit<Product, 'id'>, csrfToken);
      } else if (editingProduct.id) {
        result = await updateProduct(editingProduct.id, preparedProduct, csrfToken);
      }

      setIsEditModalOpen(false);
      setEditingProduct(null);
      setStatusNotice(result?.message || 'Saxlanıldı, yenilənmə yayımlanır');
    } catch (err: unknown) {
      console.error('Save product error:', err);
      setSaveError((err as Error).message || 'Məhsul saxlanılarkən xəta baş verdi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" məhsulunu silməyə əminsiniz?`)) return;
    setStatusNotice('');
    try {
      const res = await deleteProduct(id, csrfToken);
      setStatusNotice(res.message || 'Saxlanıldı, yenilənmə yayımlanır');
    } catch (err: unknown) {
      console.error('Delete error:', err);
      alert((err as Error).message || 'Məhsul silinərkən xəta baş verdi.');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Bütün məhsulları ilkin vəziyyətinə qaytarmaq istədiyinizə əminsiniz? Bütün dəyişikliklər silinəcək.')) return;
    setStatusNotice('');
    try {
      const res = await resetToDefaultProducts(csrfToken);
      setStatusNotice(res.message || 'Saxlanıldı, yenilənmə yayımlanır');
    } catch (err: unknown) {
      console.error('Reset error:', err);
      alert((err as Error).message || 'Sıfırlama zamanı xəta baş verdi.');
    }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle.trim() || !campConditions.trim()) return;

    setSaveError('');
    setStatusNotice('');
    setIsSaving(true);
    try {
      const res = await addCampaign({
        title: sanitizeInput(campTitle),
        conditions: sanitizeInput(campConditions),
        startDate: campStartDate ? sanitizeInput(campStartDate) : undefined,
        endDate: campEndDate ? sanitizeInput(campEndDate) : undefined,
        imageSrc: campImageSrc ? campImageSrc : undefined
      }, csrfToken);

      setCampTitle('');
      setCampConditions('');
      setCampStartDate('');
      setCampEndDate('');
      setCampImageSrc('');
      setIsCampaignModalOpen(false);
      setStatusNotice(res.message || 'Saxlanıldı, yenilənmə yayımlanır');
    } catch (err: unknown) {
      console.error('Save campaign error:', err);
      setSaveError((err as Error).message || 'Kampaniya saxlanılarkən xəta baş verdi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCampaign = async (id: string, title: string) => {
    if (!window.confirm(`"${title}" kampaniyasını silməyə əminsiniz?`)) return;
    setStatusNotice('');
    try {
      const res = await deleteCampaign(id, csrfToken);
      setStatusNotice(res.message || 'Saxlanıldı, yenilənmə yayımlanır');
    } catch (err: unknown) {
      console.error('Delete campaign error:', err);
      alert((err as Error).message || 'Kampaniya silinərkən xəta baş verdi.');
    }
  };

  const handleToggleCampaign = async (id: string) => {
    setStatusNotice('');
    try {
      const res = await toggleCampaignStatus(id, csrfToken);
      setStatusNotice(res.message || 'Saxlanıldı, yenilənmə yayımlanır');
    } catch (err: unknown) {
      console.error('Toggle campaign error:', err);
      alert((err as Error).message || 'Kampaniya statusu dəyişdirilərkən xəta baş verdi.');
    }
  };

  return (
    <>
      <SEO title="Admin İdarəetmə Paneli" description="Məhsulların və kampaniyaların idarə edilməsi" canonicalPath="/admin" noindex={true} />
      <div className={styles.container}>
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashTitle}>Admin İdarəetmə Paneli</h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Məhsulları və aktiv endirim kampaniyalarını real vaxt rejimində idarə edin
            </p>
          </div>
          <div className={styles.dashActions}>
            <Button
              variant={activeTab === 'products' ? 'primary' : 'outline'}
              icon={<Package size={18} />}
              onClick={() => setActiveTab('products')}
            >
              Məhsullar ({products.length})
            </Button>

            <Button
              variant={activeTab === 'campaigns' ? 'primary' : 'outline'}
              icon={<Gift size={18} />}
              onClick={() => setActiveTab('campaigns')}
            >
              Kampaniyalar ({campaigns.length})
            </Button>

            <Button variant="outline" icon={<LogOut size={18} />} onClick={logout}>
              Çıxış
            </Button>
          </div>
        </div>

        {statusNotice && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: '#15803d',
            fontWeight: 600
          }}>
            <CheckCircle2 size={20} />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <>
            <div className={styles.filterBar}>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Məhsul adı və ya təsviri üzrə axtar..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <select
                className={styles.categorySelect}
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="all">Bütün Kateqoriyalar</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '0.75rem', marginLeft: 'auto' }}>
                <Button variant="primary" icon={<Plus size={18} />} onClick={openAddModal}>
                  Yeni məhsul
                </Button>
                <Button variant="outline" icon={<RotateCcw size={18} />} onClick={handleReset} title="Bütün məhsulları sukut üzrə ilkin halına qaytarır">
                  İlkin halına qaytar
                </Button>
              </div>
            </div>

            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Şəkil</th>
                    <th>Adı & Ölçü</th>
                    <th>Kateqoriya</th>
                    <th>Qiymət</th>
                    <th>Stok</th>
                    <th style={{ textAlign: 'right' }}>Əməliyyat</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                        Məhsul tapılmadı.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(p => (
                      <tr key={p.id}>
                        <td>
                          <img
                            src={p.images[0]?.src || '/images/products/placeholder.jpg'}
                            alt={p.name}
                            className={styles.thumbImg}
                          />
                        </td>
                        <td>
                          <strong>{p.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                            {p.unitLabel || (p.sizes && p.sizes[0]?.label) || '100ml'}
                          </div>
                        </td>
                        <td>
                          <span className={styles.catBadge}>
                            {CATEGORIES.find(c => c.id === p.categoryId)?.name || p.categoryId}
                          </span>
                        </td>
                        <td>
                          <strong>{formatCurrency(p.price)}</strong>
                        </td>
                        <td>
                          <span className={p.inStock ? styles.stockIn : styles.stockOut}>
                            {p.inStock ? 'Stokda var' : 'Tükənib'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.editBtn}
                              onClick={() => openEditModal(p)}
                              title="Düzəliş et"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDelete(p.id, p.name)}
                              title="Sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 2: CAMPAIGNS MANAGEMENT */}
        {activeTab === 'campaigns' && (
          <>
            <div className={styles.filterBar} style={{ justifyContent: 'flex-end' }}>
              <Button variant="primary" icon={<Plus size={18} />} onClick={() => setIsCampaignModalOpen(true)}>
                Yeni kampaniya əlavə et
              </Button>
            </div>

            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Şəkil</th>
                    <th>Kampaniya Adı</th>
                    <th>Tarix Aralığı</th>
                    <th>Şərtlər</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Əməliyyat</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                        <Gift size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p>Aktiv kampaniya tapılmadı. &quot;Yeni kampaniya əlavə et&quot; düyməsinə klikləyərək yenisini yaradın.</p>
                      </td>
                    </tr>
                  ) : (
                    campaigns.map(camp => (
                      <tr key={camp.id}>
                        <td>
                          {camp.imageSrc ? (
                            <img
                              src={camp.imageSrc}
                              alt={camp.title}
                              className={styles.thumbImg}
                              style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '60px', height: '40px', background: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                              <Gift size={20} />
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>{camp.title}</strong>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Calendar size={14} />
                            <span>{camp.startDate || '—'} / {camp.endDate || '—'}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', color: '#6b7280', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {camp.conditions}
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleCampaign(camp.id)}
                            className={camp.isActive ? styles.stockIn : styles.stockOut}
                            style={{ border: 'none', cursor: 'pointer', padding: '0.25rem 0.75rem', borderRadius: '20px' }}
                          >
                            {camp.isActive ? 'Aktiv' : 'Deaktiv'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.deleteBtn}
                              onClick={() => handleDeleteCampaign(camp.id, camp.title)}
                              title="Kampaniyanı sil"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Product Edit / Add Modal */}
      {isEditModalOpen && editingProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h2 className={styles.modalTitle}>
              {isAddMode ? 'Yeni məhsul əlavə et' : 'Məhsula düzəliş et'}
            </h2>
            <form onSubmit={handleSaveProduct}>
              <div className={styles.formGroup}>
                <label htmlFor="prod-name-input" className={styles.formLabel}>Məhsul adı *</label>
                <input
                  id="prod-name-input"
                  type="text"
                  className={styles.formInput}
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label htmlFor="prod-cat-select" className={styles.formLabel}>Kateqoriya *</label>
                  <select
                    id="prod-cat-select"
                    className={styles.formInput}
                    value={editingProduct.categoryId || 'oils'}
                    onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="prod-price-input" className={styles.formLabel}>Qiymət (AZN) *</label>
                  <input
                    id="prod-price-input"
                    type="number"
                    step="0.1"
                    className={styles.formInput}
                    value={editingProduct.price ?? ''}
                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label htmlFor="prod-unit-input" className={styles.formLabel}>Ölçü / Vahid *</label>
                  <input
                    id="prod-unit-input"
                    type="text"
                    className={styles.formInput}
                    placeholder="məs: 100ml, 250ml, 200gr, 1 kg"
                    value={editingProduct.unitLabel || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, unitLabel: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="prod-stock-select" className={styles.formLabel}>Stok vəziyyəti</label>
                  <select
                    id="prod-stock-select"
                    className={styles.formInput}
                    value={editingProduct.inStock ? 'true' : 'false'}
                    onChange={e => setEditingProduct({ ...editingProduct, inStock: e.target.value === 'true' })}
                  >
                    <option value="true">Stokda var</option>
                    <option value="false">Tükənib</option>
                  </select>
                </div>
              </div>

              {/* Image Selection with Local File Upload */}
              <div className={styles.formGroup}>
                <label htmlFor="prod-img-input" className={styles.formLabel}>Məhsul şəkli (lokal şəkil seç / yüklə)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 1.25rem',
                      background: '#15803d',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <Upload size={18} />
                    Kompüterdən şəkil seç
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {editingProduct.images && editingProduct.images.length > 0 && editingProduct.images[0].src && (
                  <div style={{ margin: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={editingProduct.images[0].src}
                      alt="Seçilmiş şəkil"
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    />
                    <span style={{ fontSize: '0.825rem', color: '#6b7280', wordBreak: 'break-all' }}>
                      {editingProduct.images[0].src}
                    </span>
                  </div>
                )}

                <input
                  id="prod-img-input"
                  type="text"
                  className={styles.formInput}
                  placeholder="və ya şəkil yolu daxil edin: /images/products/yag.jpg"
                  value={editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images[0].src : ''}
                  onChange={e => setEditingProduct({
                    ...editingProduct,
                    images: [{ src: e.target.value, alt: editingProduct.name || '' }]
                  })}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="prod-desc-textarea" className={styles.formLabel}>Qısa təsvir</label>
                <textarea
                  id="prod-desc-textarea"
                  className={styles.formInput}
                  rows={2}
                  value={editingProduct.shortDescription || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                />
              </div>

              {saveError && <div className={styles.errorBanner} style={{ marginBottom: '1rem' }}>{saveError}</div>}
              <div className={styles.modalFooter}>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>
                  Ləğv et
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Saxlanılır...' : 'Yadda saxla'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Add Modal */}
      {isCampaignModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ maxWidth: '500px' }}>
            <h2 className={styles.modalTitle}>Yeni kampaniya əlavə et</h2>
            <form onSubmit={handleSaveCampaign}>
              <div className={styles.formGroup}>
                <label htmlFor="camp-title-input" className={styles.formLabel}>Kampaniya adı *</label>
                <input
                  id="camp-title-input"
                  type="text"
                  className={styles.formInput}
                  value={campTitle}
                  onChange={e => setCampTitle(e.target.value)}
                  placeholder="Məs: Hədiyyəli Paket Kampaniyası"
                  required
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label htmlFor="camp-start-input" className={styles.formLabel}>Başlama tarixi</label>
                  <input
                    id="camp-start-input"
                    type="text"
                    className={styles.formInput}
                    value={campStartDate}
                    onChange={e => setCampStartDate(e.target.value)}
                    placeholder="Məs: 1 Avqust"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="camp-end-input" className={styles.formLabel}>Bitmə tarixi</label>
                  <input
                    id="camp-end-input"
                    type="text"
                    className={styles.formInput}
                    value={campEndDate}
                    onChange={e => setCampEndDate(e.target.value)}
                    placeholder="Məs: 15 Avqust"
                  />
                </div>
              </div>

              {/* Optional Campaign Image File Upload */}
              <div className={styles.formGroup}>
                <span className={styles.formLabel}>Kampaniya şəkli (opsional)</span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.625rem 1.25rem',
                      background: '#15803d',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                  >
                    <Upload size={18} />
                    Kompüterdən şəkil seç
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCampaignImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {campImageSrc && (
                  <div style={{ margin: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={campImageSrc}
                      alt="Kampaniya şəkli"
                      style={{ width: '120px', height: '68px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #d1d5db' }}
                    />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="camp-conditions-textarea" className={styles.formLabel}>Kampaniya şərtləri və təsviri *</label>
                <textarea
                  id="camp-conditions-textarea"
                  className={styles.formInput}
                  rows={4}
                  value={campConditions}
                  onChange={e => setCampConditions(e.target.value)}
                  placeholder="Kampaniyanın ətraflı şərtlərini daxil edin..."
                  required
                />
              </div>

              {saveError && <div className={styles.errorBanner} style={{ marginBottom: '1rem' }}>{saveError}</div>}
              <div className={styles.modalFooter}>
                <Button type="button" variant="outline" onClick={() => setIsCampaignModalOpen(false)} disabled={isSaving}>
                  Ləğv et
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? 'Saxlanılır...' : 'Yadda saxla'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
