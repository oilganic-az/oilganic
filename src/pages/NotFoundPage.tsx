import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button/Button';
import { SEO } from '../components/common/SEO/SEO';

export const NotFoundPage: React.FC = () => {
  return (
    <>
      <SEO title="Səhifə tapılmadı" description="Axtardığınız səhifə tapılmadı." noindex={true} />
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '6rem',
        fontWeight: '900',
        color: 'var(--color-brand-green)',
        lineHeight: 1
      }}>
        404
      </div>
      <h1 style={{ fontSize: '2rem', color: 'var(--color-deep-green)', marginTop: '1rem' }}>
        Səhifə Tapılmadı
      </h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: '2rem' }}>
        Axtardığınız səhifə mövcud deyil və ya ünvanı dəyişdirilib.
      </p>
      <Link to="/">
        <Button variant="primary" icon={<ArrowLeft size={18} />}>
          Ana Səhifəyə Qayıt
        </Button>
      </Link>
    </div>
  </>
);
};
