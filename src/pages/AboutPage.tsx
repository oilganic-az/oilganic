import React from 'react';
import { Leaf, Eye, Heart, Store } from 'lucide-react';
import { SEO } from '../components/common/SEO/SEO';
import styles from './AboutPage.module.css';

export const AboutPage: React.FC = () => {
  return (
    <>
      <SEO
        title="Haqqımızda - Oilganic"
        description="Oilganic - Təbii yağlar, ədviyyatlar və əzmələr mağazası haqqında məlumat."
        canonicalPath="/about"
      />
      <div className={styles.page}>
        <div className="container">
          {/* Hero Header */}
          <div className={styles.hero}>
            <span className={styles.badge}>Brend fəlsəfəmiz</span>
            <h1 className={styles.title}>Oilganic - Təbii yağlar, ədviyyatlar və əzmələr mağazası</h1>
            <p className={styles.subtitle}>
              Biz canlı istehsalat yanaşması ilə gigiyenanı, təbiiliyi və şəffaflığı bir araya gətirən Azərbaycan brendiyik.
            </p>
          </div>

          {/* Story Section */}
          <div className={styles.storyGrid}>
            <div className={styles.storyCard}>
              <div className={styles.iconBox}>
                <Eye size={28} />
              </div>
              <h3 className={styles.cardTitle}>Göz qarşında hazırlanma</h3>
              <p className={styles.cardText}>
                Oilganic-də ən vacib prinsipimiz şəffaflıqdır. İstehsalatımızı müştərilərimizdən gizlətmirik - yağlarımız və əzmələrimiz mağazamızda gözünüzün qarşısında təzə-təzə hazırlanır.
              </p>
            </div>

            <div className={styles.storyCard}>
              <div className={styles.iconBox}>
                <Leaf size={28} />
              </div>
              <h3 className={styles.cardTitle}>100% təbii və qatqısız</h3>
              <p className={styles.cardText}>
                Məhsullarımıza heç bir süni dadlandırıcı, kimyəvi aromatizator və ya konservant əlavə olunmur. Təbiətin bizə bəxş etdiyi kimi tam və zəngin saxlanılır.
              </p>
            </div>

            <div className={styles.storyCard}>
              <div className={styles.iconBox}>
                <Store size={28} />
              </div>
              <h3 className={styles.cardTitle}>Fiziki mağaza təcrübəsi</h3>
              <p className={styles.cardText}>
                Bakı şəhərində Nizami rayonu, Cəmşid Naxçıvanski küçəsi 49C (8-ci km bazarı) ünvanındakı mağazamızda müştərilərimizə hər gün xidmət göstəririk.
              </p>
            </div>

            <div className={styles.storyCard}>
              <div className={styles.iconBox}>
                <Heart size={28} />
              </div>
              <h3 className={styles.cardTitle}>Seçilmiş məhsullar</h3>
              <p className={styles.cardText}>
                Öz istehsal etdiyimiz soyuq sıxım yağlar və əzmələrlə yanaşı, etibarlı yerli arıçı və istehsalçılardan təbii bal, bəhməz və bitki məhsullarını seçib təqdim edirik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
