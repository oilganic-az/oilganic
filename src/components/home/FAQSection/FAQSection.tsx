import React from 'react';
import { FAQ_ITEMS } from '../../../data/faq';
import { Accordion } from '../../common/Accordion/Accordion';
import styles from './FAQSection.module.css';

export const FAQSection: React.FC = () => {
  const accordionItems = FAQ_ITEMS.map(item => ({
    id: item.id,
    title: item.question,
    content: item.answer
  }));

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <span className={styles.badge}>Tez-tez verilən suallar</span>
          <h2 className={styles.title}>Suallarınız var? Biz cavablandırırıq</h2>
          <p className={styles.subtitle}>
            Təbii yağların hazırlanması, çatdırılma və saxlanma qaydaları ilə bağlı ən çox soruşulan suallar.
          </p>
        </div>

        <div className={styles.accordionBox}>
          <Accordion items={accordionItems} />
        </div>
      </div>
    </section>
  );
};
