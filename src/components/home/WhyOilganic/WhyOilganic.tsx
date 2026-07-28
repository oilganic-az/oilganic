import React from 'react';
import { ShieldCheck, HeartHandshake, Sparkles, RefreshCw } from 'lucide-react';
import { Reveal } from '../../motion/Reveal/Reveal';
import styles from './WhyOilganic.module.css';

export const WhyOilganic: React.FC = () => {
  const points = [
    {
      icon: <Sparkles size={24} />,
      title: 'Canlı mağaza təcrübəsi',
      desc: 'Mağazamıza yaxınlaşaraq məhsulların sıxılma və üyüdülmə prosesini canlı izləyə bilərsiniz.'
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Sıfır kimyəvi qatqı',
      desc: 'Heç bir sintetik qoruyucu, aromatizator və ya rafinasiya kimyəvisi istifadə edilmir.'
    },
    {
      icon: <RefreshCw size={24} />,
      title: 'Hər gün təzə istehsalat',
      desc: 'Məhsullarımız stokda aylarla qalmır, gündəlik olaraq təzə sıxılır və təhvil verilir.'
    },
    {
      icon: <HeartHandshake size={24} />,
      title: 'Şəffaf və dürüst yanaşma',
      desc: 'Məhsul tərkiblərimiz, xammal mənşəyimiz və hazırlanma qaydamız tamamilə açıqdır.'
    }
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal variant="scale">
          <div className={styles.innerBox}>
            <div className={styles.header}>
              <span className={styles.badge}>Niyə Oilganic?</span>
              <h2 className={styles.title}>Yerli və şəffaf təbii məhsul brendi</h2>
              <p className={styles.subtitle}>
                Biz təbii sağlamlıq anlayışını gizli formulalardan çıxarıb, tamamilə göz qabağında hazırlanan keyfiyyətli məhsullara çeviririk.
              </p>
            </div>

            <div className={styles.grid}>
              {points.map((pt, idx) => (
                <Reveal key={idx} variant="slideUp" delay={idx * 0.1}>
                  <div className={styles.pointCard}>
                    <div className={styles.iconBox}>{pt.icon}</div>
                    <h3 className={styles.pointTitle}>{pt.title}</h3>
                    <p className={styles.pointDesc}>{pt.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
