import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './Accordion.module.css';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
}

export const Accordion: React.FC<AccordionProps> = ({ items }) => {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggleItem = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <div className={styles.accordion}>
      {items.map(item => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className={`${styles.item} ${isOpen ? styles.open : ''}`}>
            <button
              className={styles.trigger}
              onClick={() => toggleItem(item.id)}
              aria-expanded={isOpen}
            >
              <span className={styles.title}>{item.title}</span>
              <ChevronDown
                size={20}
                className={`${styles.icon} ${isOpen ? styles.iconRotate : ''}`}
              />
            </button>
            {isOpen && <div className={styles.panel}>{item.content}</div>}
          </div>
        );
      })}
    </div>
  );
};
