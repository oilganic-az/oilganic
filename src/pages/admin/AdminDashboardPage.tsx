import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, RotateCcw, LogOut, Package, Upload, Gift, Calendar } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { useProducts } from '../../context/ProductsContext';
import { useCampaigns } from '../../context/CampaignsContext';
import { CATEGORIES } from '../../data/categories';
import { Product } from '../../types/product';
import { Button } from '../../components/common/Button/Button';
import { formatCurrency } from '../../utils/formatters';
import { SEO } from '../../components/common/SEO/SEO';
import { ADMIN_AUTH_KEY, ADMIN_LAST_ACTIVE_KEY } from './AdminLoginPage';
import { SESSION_INACTIVITY_TIMEOUT_MS, sanitizeInput } from '../../utils/security';
import styles from './AdminPage.module.css';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
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

  // Campaign Modal State
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campTitle, setCampTitle] = useState('');
  const [campConditions, setCampConditions] = useState('');
  const [campStartDate, setCampStartDate] = useState('');
  const [campEndDate, setCampEndDate] = useState('');
  const [campImageSrc, setCampImageSrc] = useState('');

  // Inactivity Monitoring while Dashboard is active
  useEffect(() => {
    const updateActivity = () => {
      sessionStorage.setItem(ADMIN_LAST_ACTIVE_KEY, Date.now().toString());
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);

    const interval = setInterval(() => {
      const currentLastActiveStr = sessionStorage.getItem(ADMIN_LAST_ACTIVE_KEY);
      const currentLastActive = currentLastActiveStr ? parseInt(currentLastActiveStr, 10) : 0;
      if (!currentLastActive || Date.now() - currentLastActive > SESSION_INACTIVITY_TIMEOUT_MS) {
        handleLogout();
      }
    }, 60000);

    return () => {
      window.removeEventListener('mousemove', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      clearInterval(interval);
    };
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    sessionStorage.removeItem(ADMIN_LAST_ACTIVE_KEY);
    navigate('/admin/login');
  };

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
      unitLabel: 'ədəd',
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

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setSaveError('');
    setIsSaving(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const fileRef = storageRef(storage, filename);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      setEditingProduct({
        ...editingProduct,
        images: [{ src: downloadUrl, alt: editingProduct.name || '' }]
      });
    } catch (err) {
      console.error('Image upload failed:', err);
      setSaveError('Şəkil yüklənərkən xəta baş verdi. Yenidən cəhd edin.');
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
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `campaigns/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const fileRef = storageRef(storage, filename);
      await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(fileRef);
      setCampImageSrc(downloadUrl);
    } catch (err) {
      console.error('Campaign image upload failed:', err);
      setSaveError('Şəkil yüklənərkən xəta baş verdi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || editingProduct.price === undefined) return;

    setSaveError('');
    setIsSaving(true);
    try {
      const sanitizedName = sanitizeInput(editingProduct.name);
      const sanitizedShortDesc = sanitizeInput(editingProduct.shortDescription || '');
      const sanitizedDesc = sanitizeInput(editingProduct.description || '');
      const sanitizedUnitLabel = sanitizeInput(editingProduct.unitLabel || 'ədəd');

      const sizeLabel = sanitizedUnitLabel === 'kg' ? '1 kg' : sanitizedUnitLabel;
      const mainImg = editingProduct.images && editingProduct.images.length > 0
        ? editingProduct.images[0].src
        : '/images/products/placeholder.jpg';

      const preparedProduct: Partial<Product> = {
        ...editingProduct,
        name: sanitizedName,
        shortDescription: sanitizedShortDesc,
        description: sanitizedDesc,
        unitLabel: sanitizedUnitLabel,
        slug: editingProduct.slug || sanitizedName.toLowerCase().replace(/\s+/g, '-'),
        sizes: [
          {
            id: `size-${Date.now()}`,
            label: sizeLabel,
            price: Number(editingProduct.price),
            inStock: editingProduct.inStock ?? true,
            verificationStatus: 'verified',
            imageSrc: mainImg
          }
        ],
        images: [{ src: mainImg, alt: sanitizedName }]
      };

      if (isAddMode) {
        await addProduct(preparedProduct as Omit<Product, 'id'>);
      } else if (editingProduct.id) {
        await updateProduct(editingProduct.id, preparedProduct);
      }

      setIsEditModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error('Save product error:', err);
      setSaveError('Məhsul saxlanılarkən xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`"${name}" məhsulunu silməyə əminsiniz?`)) return;
    try {
      await deleteProduct(id);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Məhsul silinərkən xəta baş verdi.');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Bütün məhsulları ilkin vəziyyətinə qaytarmaq istədiyinizə əminsiniz? Bütün dəyişikliklər silinəcək.')) return;
    try {
      await resetToDefaultProducts();
    } catch (err) {
      console.error('Reset error:', err);
      alert('Sıfırlama zamanı xəta baş verdi.');
    }
  };

  // Password change is now managed via server-side environment variables.

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle.trim() || !campConditions.trim()) return;

    setSaveError('');
    setIsSaving(true);
    try {
      await addCampaign({
        title: sanitizeInput(campTitle),
        conditions: sanitizeInput(campConditions),
        startDate: campStartDate ? sanitizeInput(campStartDate) : undefined,
        endDate: campEndDate ? sanitizeInput(campEndDate) : undefined,
        imageSrc: campImageSrc ? campImageSrc : undefined
      });

      setCampTitle('');
      setCampConditions('');
      setCampStartDate('');
      setCampEndDate('');
      setCampImageSrc('');
      setIsCampaignModalOpen(false);
    } catch (err) {
      console.error('Save campaign error:', err);
      setSaveError('Kampaniya saxlanılarkən xəta baş verdi.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SEO title="Admin İdarəetmə Paneli - Oilganic" description="Məhsulların və kampaniyaların idarə edilməsi" canonicalPath="/admin" />
      <div className={styles.container}>
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashTitle}>Admin İdarəetmə Paneli</h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Məhsulları və aktiv endirim kampaniyalarını real vaxt rejimində dəyişin
            </p>
          </div>
          <div className={styles.dashActions}>
            <Button
              variant={activeTab === 'products' ? 'primary' : 'outline'}
              icon={<Package size={18} />}
              onClick={() => setActiveTab('products')}
            >
              Məhsullar
            </Button>
            <Button
              variant={activeTab === 'campaigns' ? 'primary' : 'outline'}
              icon={<Gift size={18} />}
              onClick={() => setActiveTab('campaigns')}
            >
              Kampaniyalar
            </Button>
            <Button variant="dark" icon={<LogOut size={16} />} onClick={handleLogout}>
              Çıxış
            </Button>
          </div>
        </div>

        {/* Tab 1: Products Management */}
        {activeTab === 'products' && (
          <>
            <div className={styles.toolbar}>
              <div className={styles.searchBox}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Məhsul axtarın..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className={styles.categorySelect}
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="all">Bütün kateqoriyalar</option>
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              
              <Button variant="primary" icon={<Plus size={16} />} onClick={openAddModal}>
                Yeni məhsul
              </Button>
              
              <Button variant="outline" icon={<RotateCcw size={16} onClick={handleReset} />} title="İlkin sıfırlama">
                Sıfırla
              </Button>

              <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Cəmi: {filteredProducts.length} məhsul
              </span>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Şəkil</th>
                    <th>Məhsul adı</th>
                    <th>Kateqoriya</th>
                    <th>Qiymət</th>
                    <th>Ölçü / Vahid</th>
                    <th>Stok vəziyyəti</th>
                    <th style={{ textAlign: 'right' }}>Əməliyyatlar</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                        <Package size={36} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                        <p>Heç bir məhsul tapılmadı</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map(prod => (
                      <tr key={prod.id}>
                        <td>
                          <img
                            src={prod.images && prod.images.length > 0 ? prod.images[0].src : ''}
                            alt={prod.name}
                            className={styles.thumbImg}
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </td>
                        <td>
                          <strong style={{ color: '#111827' }}>{prod.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{prod.slug}</div>
                        </td>
                        <td>
                          {CATEGORIES.find(c => c.id === prod.categoryId)?.name || prod.categoryId}
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#15803d' }}>
                            {formatCurrency(prod.price)}
                          </span>
                        </td>
                        <td>{prod.sizes && prod.sizes.length > 0 ? prod.sizes[0].label : (prod.unitLabel || 'ədəd')}</td>
                        <td>
                          <span
                            className={`${styles.stockBadge} ${
                              prod.inStock ? styles.inStock : styles.outOfStock
                            }`}
                          >
                            {prod.inStock ? 'Stokda var' : 'Tükənib'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={styles.actionBtns} style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className={styles.editBtn}
                              onClick={() => openEditModal(prod)}
                              title="Düzəliş et"
                            >
                              <Edit2 size={14} style={{ marginRight: '4px' }} /> Düzəliş et
                            </button>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => handleDelete(prod.id, prod.name)}
                              title="Sil"
                            >
                              <Trash2 size={14} style={{ marginRight: '4px' }} /> Sil
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

        {/* Tab 2: Campaigns Management */}
        {activeTab === 'campaigns' && (
          <>
            <div className={styles.toolbar}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#113c22' }}>Kampaniya siyahısı</h3>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  Cəmi: {campaigns.length} kampaniya
                </span>
              </div>
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => setIsCampaignModalOpen(true)}
              >
                Yeni kampaniya əlavə et
              </Button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Şəkil</th>
                    <th>Kampaniya adı</th>
                    <th>Müddət</th>
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
                        <p>Aktiv kampaniya tapılmadı. "Yeni kampaniya əlavə et" düyməsinə klikləyərək yenisini yaradın.</p>
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
                            />
                          ) : (
                            <div className={styles.thumbImg} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
                              <Gift size={20} color="#9ca3af" />
                            </div>
                          )}
                        </td>
                        <td>
                          <strong style={{ color: '#111827' }}>{camp.title}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                            <Calendar size={14} color="#6b7280" />
                            <span>{camp.startDate || '—'} / {camp.endDate || '—'}</span>
                          </div>
                        </td>
                        <td>
                          <p style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }} title={camp.conditions}>
                            {camp.conditions}
                          </p>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`${styles.stockBadge} ${
                              camp.isActive ? styles.inStock : styles.outOfStock
                            }`}
                            onClick={() => toggleCampaignStatus(camp.id)}
                            style={{ cursor: 'pointer', border: 'none' }}
                            title="Statusu dəyiş"
                          >
                            {camp.isActive ? 'Aktiv' : 'Passiv'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => {
                              if (window.confirm(`"${camp.title}" kampaniyasını silməyə əminsiniz?`)) {
                                deleteCampaign(camp.id);
                              }
                            }}
                          >
                            <Trash2 size={14} style={{ marginRight: '4px' }} /> Sil
                          </button>
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
                <label className={styles.formLabel}>Məhsul adı *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={editingProduct.name || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.grid2}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Kateqoriya *</label>
                  <select
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
                  <label className={styles.formLabel}>Qiymət (AZN) *</label>
                  <input
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
                  <label className={styles.formLabel}>Ölçü / Vahid *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="məs: 100ml, 250ml, 200gr, 1 kg"
                    value={editingProduct.unitLabel || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, unitLabel: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Stok vəziyyəti</label>
                  <select
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
                <label className={styles.formLabel}>Məhsul şəkli (lokal şəkil seç / yüklə)</label>
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
                      {editingProduct.images[0].src.startsWith('data:') ? 'Lokal yüklənmiş şəkil (Base64)' : editingProduct.images[0].src}
                    </span>
                  </div>
                )}

                <input
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
                <label className={styles.formLabel}>Qısa təsvir</label>
                <textarea
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
                <label className={styles.formLabel}>Kampaniya adı *</label>
                <input
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
                  <label className={styles.formLabel}>Başlama tarixi</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    value={campStartDate}
                    onChange={e => setCampStartDate(e.target.value)}
                    placeholder="Məs: 1 Avqust"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bitmə tarixi</label>
                  <input
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
                <label className={styles.formLabel}>Kampaniya şəkli (opsional)</label>
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
                <label className={styles.formLabel}>Kampaniya şərtləri və təsviri *</label>
                <textarea
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

      {/* Password change is now managed via Vercel environment variables (ADMIN_PASSWORD). */}
    </>
  );
};
