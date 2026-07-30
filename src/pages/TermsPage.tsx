import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', color: 'var(--color-deep-green)', marginBottom: '1.5rem' }}>
        İstifadə və sifariş şərtləri
      </h1>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
        Oilganic e-commerce platformasından istifadə qaydaları və sifariş şərtləri aşağıda qeyd edilmişdir.
      </p>
      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-deep-green)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
        1. Sifarişlərin rəsmiləşdirilməsi
      </h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
        Saytımız vasitəsilə hazırlanan sifarişlər dərhal WhatsApp operatorumuza və ya Wolt tətbiqinə yönləndirilir və təsdiq edildikdən sonra icraya götürülür.
      </p>
      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-deep-green)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
        2. Məhsul məlumatları və məsləhətlər
      </h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
        Saytda yerləşdirilən bütün məhsul tərkibləri və istifadə qaydaları ümumi məlumatlandırma xarakteri daşıyır və peşəkar tibbi məsləhəti əvəz etmir.
      </p>
    </div>
  );
};
