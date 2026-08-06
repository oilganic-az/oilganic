import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button/Button';
import { SEO } from '../../components/common/SEO/SEO';
import { useAdminAuth } from '../../components/auth/AdminGuard';
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS } from '../../utils/security';
import styles from './AdminPage.module.css';

const ATTEMPTS_KEY = 'oilganic_login_attempts';
const LOCKOUT_KEY = 'oilganic_lockout_until';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { checkSession } = useAdminAuth();

  useEffect(() => {
    checkLockoutStatus();
  }, []);

  const checkLockoutStatus = (): boolean => {
    const lockoutUntilStr = localStorage.getItem(LOCKOUT_KEY);
    if (lockoutUntilStr) {
      const lockoutUntil = parseInt(lockoutUntilStr, 10);
      const remainingMs = lockoutUntil - Date.now();
      if (remainingMs > 0) {
        setIsLockedOut(true);
        const mins = Math.ceil(remainingMs / 60000);
        setError(`Çoxlu uğursuz cəhd! Hesabınız ${mins} dəqiqəlik müvəqqəti bloklanıb.`);
        return true;
      } else {
        localStorage.removeItem(LOCKOUT_KEY);
        localStorage.removeItem(ATTEMPTS_KEY);
        setIsLockedOut(false);
        setError('');
      }
    }
    return false;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (checkLockoutStatus()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        localStorage.removeItem(ATTEMPTS_KEY);
        localStorage.removeItem(LOCKOUT_KEY);

        const ok = await checkSession();
        if (ok) {
          navigate('/admin');
        } else {
          setError('Sessiya yaradıla bilmədi. Yenidən cəhd edin.');
        }
      } else {
        const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
        localStorage.setItem(ATTEMPTS_KEY, attempts.toString());

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          const lockoutTime = Date.now() + LOCKOUT_DURATION_MS;
          localStorage.setItem(LOCKOUT_KEY, lockoutTime.toString());
          setIsLockedOut(true);
          setError('5 dəfə yanlış giriş cəhdi! Təhlükəsizlik üçün hesab 15 dəqiqəlik bloklandı.');
        } else {
          const remaining = MAX_LOGIN_ATTEMPTS - attempts;
          const msg = data.error || 'İstifadəçi adı və ya şifrə yanlışdır.';
          setError(`${msg} Qalan cəhd: ${remaining}`);
        }
      }
    } catch (err) {
      setError('Serverə qoşulmaq mümkün olmadı. İnternet bağlantınızı yoxlayın.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Admin Girişi" description="Oilganic İdarəetmə Paneli Girişi" canonicalPath="/admin/login" noindex={true} />
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <h1 className={styles.loginTitle}>Admin Paneli</h1>
          <p className={styles.loginSubtitle}>Davam etmək üçün hesabınıza daxil olun</p>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="admin-username" className={styles.formLabel}>İstifadəçi adı</label>
              <input
                id="admin-username"
                type="text"
                className={styles.formInput}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="oilganic.admin"
                disabled={isLockedOut || isSubmitting}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="admin-password" className={styles.formLabel}>Şifrə</label>
              <input
                id="admin-password"
                type="password"
                className={styles.formInput}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLockedOut || isSubmitting}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              disabled={isLockedOut || isSubmitting}
            >
              {isSubmitting ? 'Yoxlanılır...' : 'Daxil ol'}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};
