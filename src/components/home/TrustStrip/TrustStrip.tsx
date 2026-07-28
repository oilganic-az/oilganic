import React from 'react';
import { Eye, Leaf, ShieldCheck, Store, Truck } from 'lucide-react';
import styles from './TrustStrip.module.css';

export const TrustStrip: React.FC = () => {
  const items = [
    {
      icon: <Eye size={22} />,
      title: 'Şəffaf Hazırlanma',
      desc: 'Proses gözünüzün qarşısında həyata keçirilir.'
    },
    {
      icon: <Leaf size={22} />,
      title: 'Təbii Xammal',
      desc: '100% seçilmiş və qatqısız bitki toxumları.'
    },
    {
      icon: <ShieldCheck size={22} />,
      title: 'Gigiyenik Qablaşdırma',
      desc: 'Steril tünd şüşə və bağlamalarda.'
    },
    {
      icon: <Store size={22} />,
      title: 'Fiziki Mağaza',
      desc: 'Bakıda canlı mağaza təcrübəsi.'
    },
    {
      icon: <Truck size={22} />,
      title: 'Sürətli Çatdırılma',
      desc: 'Wolt Bakı və WhatsApp vasitəsilə.'
    }
  ];

  return (
    <section className={styles.trustSection}>
      <div className={`container ${styles.container}`}>
        {items.map((item, idx) => (
          <div key={idx} className={styles.trustCard}>
            <div className={styles.iconBox}>{item.icon}</div>
            <div className={styles.textBox}>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.desc}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
