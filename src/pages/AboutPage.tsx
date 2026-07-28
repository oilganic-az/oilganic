import { Leaf, Eye, Heart, Store } from 'lucide-react';
import styles from './AboutPage.module.css';

export const AboutPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className="container">
        {/* Hero Header */}
        <div className={styles.hero}>
          <span className={styles.badge}>Brend Fəlsəfəmiz</span>
          <h1 className={styles.title}>Oilganic - Təbii Yağlar və Əzmələr Mağazası</h1>
          <p className={styles.subtitle}>
            Biz yerli istehsalat yanaşması ilə təbiiliyi, şəffaflığı və canlı mağaza təcrübəsini bir araya gətirən Azərbaycan brendiyik.
          </p>
        </div>

        {/* Story Section */}
        <div className={styles.storyGrid}>
          <div className={styles.storyCard}>
            <div className={styles.iconBox}>
              <Eye size={28} />
            </div>
            <h3 className={styles.cardTitle}>Göz Qarşısında Hazırlanma</h3>
            <p className={styles.cardText}>
              Oilganic-də ən vacib prinsipimiz şəffaflıqdır. İstehsalatımızı müştərilərimizdən gizlətmirik - yağlarımız və əzmələrimiz fiziki mağazamızda gözünüzün qarşısında təzə sıxılır.
            </p>
          </div>

          <div className={styles.storyCard}>
            <div className={styles.iconBox}>
              <Leaf size={28} />
            </div>
            <h3 className={styles.cardTitle}>100% Təbii və Qatqısız</h3>
            <p className={styles.cardText}>
              Məhsullarımıza heç bir süni dadlandırıcı, kimyəvi aromatizator və ya konservant əlavə olunmur. Təbiətin bizə bəxş etdiyi kimi tam və zəngin saxlanılır.
            </p>
          </div>

          <div className={styles.storyCard}>
            <div className={styles.iconBox}>
              <Store size={28} />
            </div>
            <h3 className={styles.cardTitle}>Fiziki Mağaza Təcrübəsi</h3>
            <p className={styles.cardText}>
              Bakı şəhərində Nizami rayonu, Cəmşid Naxçıvanski küçəsi 49C (8-ci km bazarı) ünvanındakı mağazamızda müştərilərimizi hər gün canlı qarşılayırıq.
            </p>
          </div>

          <div className={styles.storyCard}>
            <div className={styles.iconBox}>
              <Heart size={28} />
            </div>
            <h3 className={styles.cardTitle}>Yerli və Seçilmiş Məhsullar</h3>
            <p className={styles.cardText}>
              Öz istehsal etdiyimiz soyuq sıxım yağlar və əzmələrlə yanaşı, etibarlı yerli arıçı və istehsalçılardan təbii bal, bəhməz və bitki məhsullarını seçib təqdim edirik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
