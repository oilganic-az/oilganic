import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, RotateCcw, LogOut, Package, Upload, Lock } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { CATEGORIES } from '../../data/categories';
import { Product } from '../../types/product';
import { Button } from '../../components/common/Button/Button';
import { formatCurrency } from '../../utils/formatters';
import { SEO } from '../../components/common/SEO/SEO';
import { ADMIN_AUTH_KEY, ADMIN_LAST_ACTIVE_KEY } from './AdminLoginPage';
import { SESSION_INACTIVITY_TIMEOUT_MS, sanitizeInput, hashString, ADMIN_PASSWORD_HASH } from '../../utils/security';
import styles from './AdminPage.module.css';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct, resetToDefaultProducts } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  // Password change modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Authentication & Inactivity Monitoring
  useEffect(() => {
    const isAuth = sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
    const lastActiveStr = sessionStorage.getItem(ADMIN_LAST_ACTIVE_KEY);
    const lastActive = lastActiveStr ? parseInt(lastActiveStr, 10) : 0;

    if (!isAuth || (lastActive && Date.now() - lastActive > SESSION_INACTIVITY_TIMEOUT_MS)) {
      handleLogout();
      return;
    }

    const updateActivity = () => {
      sessionStorage.setItem(ADMIN_LAST_ACTIVE_KEY, Date.now().toString());
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);

    const interval = setInterval(() => {
      const currentLastActiveStr = sessionStorage.getItem(ADMIN_LAST_ACTIVE_KEY);
      const currentLastActive = currentLastActiveStr ? parseInt(currentLastActiveStr, 10) : 0;
      if (currentLastActive && Date.now() - currentLastActive > SESSION_INACTIVITY_TIMEOUT_MS) {
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

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        if (dataUrl) {
          setEditingProduct({
            ...editingProduct,
            images: [{ src: dataUrl, alt: editingProduct.name || '' }]
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || editingProduct.price === undefined) return;

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
      addProduct(preparedProduct as Omit<Product, 'id'>);
    } else if (editingProduct.id) {
      updateProduct(editingProduct.id, preparedProduct);
    }

    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`"${name}" məhsulunu silməyə əminsiniz?`)) {
      deleteProduct(id);
    }
  };

  const handleReset = () => {
    if (window.confirm('Bütün məhsulları ilkin vəziyyətinə qaytarmaq istədiyinizə əminsiniz? Bütün dəyişikliklər silinəcək.')) {
      resetToDefaultProducts();
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const activeHash = localStorage.getItem('oilganic_admin_password_hash') || ADMIN_PASSWORD_HASH;
      const currentHash = await hashString(currentPassword);

      if (currentHash !== activeHash) {
        setPasswordError('Cari şifrə yanlışdır.');
        return;
      }

      if (newPassword.length < 6) {
        setPasswordError('Yeni şifrə en azı 6 simvoldan ibarət olmalıdır.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordError('Yeni şifrələr uyğun gəlmir.');
        return;
      }

      const newHash = await hashString(newPassword);
      localStorage.setItem('oilganic_admin_password_hash', newHash);
      setPasswordSuccess('Şifrə uğurla dəyişdirildi!');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      setPasswordError('Şifrə dəyişdirilərkən xəta baş verdi.');
    }
  };

  return (
    <>
      <SEO title="Admin İdarəetmə Paneli - Oilganic" description="Məhsulların idarə edilməsi" canonicalPath="/admin" />
      <div className={styles.container}>
        <div className={styles.dashboardHeader}>
          <div>
            <h1 className={styles.dashTitle}>Admin İdarəetmə Paneli</h1>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Məhsulların qiymətlərini, adlarını və parametrlərini real vaxt rejimində dəyişin
            </p>
          </div>
          <div className={styles.dashActions}>
            <Button variant="primary" icon={<Plus size={18} />} onClick={openAddModal}>
              Yeni məhsul əlavə et
            </Button>
            <Button variant="outline" icon={<Lock size={16} />} onClick={() => setIsPasswordModalOpen(true)}>
              Şifrəni dəyiş
            </Button>
            <Button variant="outline" icon={<RotateCcw size={16} />} onClick={handleReset} title="İlkin sıfırlama">
              Sıfırla
            </Button>
            <Button variant="dark" icon={<LogOut size={16} />} onClick={handleLogout}>
              Çıxış
            </Button>
          </div>
        </div>

        {/* Toolbar */}
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
          <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Cəmi: {filteredProducts.length} məhsul
          </span>
        </div>

        {/* Products Table */}
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
      </div>

      {/* Edit / Add Modal */}
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

                {/* Preview Thumbnail */}
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

              <div className={styles.modalFooter}>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Ləğv et
                </Button>
                <Button type="submit" variant="primary">
                  Yadda saxla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox} style={{ maxWidth: '420px' }}>
            <h2 className={styles.modalTitle}>Şifrəni dəyiş</h2>
            
            {passwordError && <div className={styles.errorBanner}>{passwordError}</div>}
            {passwordSuccess && (
              <div className={styles.errorBanner} style={{ background: '#dcfce7', borderColor: '#bbf7d0', color: '#166534' }}>
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Cari şifrə *</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Yeni şifrə *</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="ən azı 6 simvol"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Yeni şifrənin təsdiqi *</label>
                <input
                  type="password"
                  className={styles.formInput}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className={styles.modalFooter}>
                <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                  Ləğv et
                </Button>
                <Button type="submit" variant="primary">
                  Yadda saxla
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
