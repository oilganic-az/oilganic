import React, { useState } from 'react';
import { Phone, MapPin, Clock, Send } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';
import { Button } from '../components/common/Button/Button';
import { SEO } from '../components/common/SEO/SEO';
import styles from './ContactPage.module.css';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Salam, mənim adım ${name || 'Müştəri'}.\n\nQeydim/Sualım:\n${note}`;
    const url = `${BUSINESS_CONFIG.whatsappLink}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <SEO
        title="Bizimlə Əlaqə"
        description="Oilganic mağazasının ünvanı, iş saatları, telefon nömrəsi və WhatsApp əlaqə kanalı."
        canonicalPath="/contact"
      />
      <div className={styles.page}>
        <div className="container">
          <div className={styles.hero}>
            <span className={styles.badge}>Bizimlə Əlaqə</span>
            <h1 className={styles.title}>Suallarınız Var? Bizimlə Əlaqə Saxlayın</h1>
            <p className={styles.subtitle}>
              Mağazamızın ünvanı, iş saatları və birbaşa WhatsApp dəstəyi xidmətinizdədir.
            </p>
          </div>

          <div className={styles.grid}>
            {/* Contact Details */}
            <div className={styles.detailsCol}>
              <div className={styles.infoCard}>
                <Phone className={styles.icon} size={24} />
                <div>
                  <h3 className={styles.cardTitle}>Telefon və WhatsApp</h3>
                  <p className={styles.cardText}>{BUSINESS_CONFIG.phoneDisplay}</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <Clock className={styles.icon} size={24} />
                <div>
                  <h3 className={styles.cardTitle}>İş Saatları</h3>
                  <p className={styles.cardText}>{BUSINESS_CONFIG.workingHours}</p>
                </div>
              </div>

              <div className={styles.infoCard}>
                <MapPin className={styles.icon} size={24} />
                <div>
                  <h3 className={styles.cardTitle}>Mağaza Ünvanı</h3>
                  <p className={styles.cardText}>{BUSINESS_CONFIG.address}</p>
                </div>
              </div>
            </div>

            {/* Quick Message Form */}
            <div className={styles.formCol}>
              <h3 className={styles.formTitle}>WhatsApp-a Birbaşa Mesaj Göndərin</h3>
              <form onSubmit={handleSendMessage} className={styles.form}>
                <div className={styles.field}>
                  <label htmlFor="contact-name" className={styles.label}>Adınız və Soyadınız:</label>
                  <input
                    id="contact-name"
                    type="text"
                    className={styles.input}
                    placeholder="Məs: Əli Məmmədov"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact-note" className={styles.label}>Mesajınız və ya Sualınız:</label>
                  <textarea
                    id="contact-note"
                    className={styles.textarea}
                    rows={4}
                    placeholder="Sualınızı və ya istədiyiniz təbii məhsulu qeyd edin..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    required
                  />
                </div>

                <Button variant="whatsapp" size="lg" fullWidth icon={<Send size={18} />}>
                  WhatsApp ilə göndər
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
