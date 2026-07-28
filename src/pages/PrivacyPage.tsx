import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', color: 'var(--color-deep-green)', marginBottom: '1.5rem' }}>
        Məxfilik Siyasəti
      </h1>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '1rem' }}>
        Oilganic olaraq müştərilərimizin məxfilik və fərdi məlumatlarının təhlükəsizliyinə böyük hörmətlə yanaşırıq.
      </p>
      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-deep-green)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
        1. Toplanan Məlumatlar
      </h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
        Sifarişinizi rəsmiləşdirmək üçün təqdim etdiyiniz ad, telefon nömrəsi və çatdırılma ünvanı yalnız sifarişinizin çatdırılması məqsədilə istifadə olunur və üçüncü tərəflərə ötürülmür.
      </p>
      <h3 style={{ fontSize: '1.25rem', color: 'var(--color-deep-green)', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
        2. Səbət Məlumatları (LocalStorage)
      </h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
        Saytımızda toplanan səbət məlumatları brauzerinizin təhlükəsiz yerli yaddaşında (localStorage) saxlanılır və yalnız sizin rahatlığınız üçün istifadə edilir.
      </p>
    </div>
  );
};
