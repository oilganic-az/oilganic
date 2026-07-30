import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Modal } from '../../common/Modal/Modal';
import { useProducts } from '../../../context/ProductsContext';
import { matchesQuery } from '../../../utils/search';
import { formatCurrency } from '../../../utils/formatters';
import styles from './SearchModal.module.css';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { products } = useProducts();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = query.trim()
    ? products.filter(p => matchesQuery(p.name, query) || matchesQuery(p.shortDescription, query))
    : [];

  const handleSelect = (slug: string) => {
    onClose();
    setQuery('');
    navigate(`/products/${slug}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Məhsul axtarışı">
      <div className={styles.searchContainer}>
        <div className={styles.inputBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.input}
            placeholder="Məhsul adı və ya tərkib yazın (məs: Badam yağı)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Məhsul axtarış sahəsi"
          />
        </div>

        {query.trim() && (
          <div className={styles.resultsList}>
            {results.length === 0 ? (
              <p className={styles.noResults}>
                &quot;{query}&quot; sorğusuna uyğun heç bir məhsul tapılmadı.
              </p>
            ) : (
              results.map(prod => (
                <button
                  key={prod.id}
                  type="button"
                  className={styles.resultItem}
                  onClick={() => handleSelect(prod.slug)}
                >
                  <div className={styles.resultDetails}>
                    <h4 className={styles.resultName}>{prod.name}</h4>
                    <p className={styles.resultDesc}>{prod.shortDescription}</p>
                  </div>
                  <span className={styles.resultPrice}>{formatCurrency(prod.price)}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
