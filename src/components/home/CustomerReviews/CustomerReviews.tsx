import React, { useState } from 'react';
import { Star, MessageSquareQuote } from 'lucide-react';
import { Reveal } from '../../motion/Reveal/Reveal';
import styles from './CustomerReviews.module.css';

export interface CustomerReview {
  id: string;
  imageSrc: string;
  alt: string;
  caption: string;
}

const REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    imageSrc: '/images/reviews/review-1.png',
    alt: 'Müştəri rəyi - Tahinlər və Bəhməz hədiyyəsi',
    caption: '"Tahinlərə görə çox sağ olun, bəhməz də hədiyyəsi yanında çox qəşəng və keyfiyyətli 👍"'
  },
  {
    id: 'rev-2',
    imageSrc: '/images/reviews/review-2.png',
    alt: 'Müştəri rəyi - Operativ kuryer çatdırılması və fıstıq küncüt əzməsi',
    caption: '"Mən müxtəlif səhifələrdən bu qədər online sifarişlər edirəm hələ belə tez, operativ çatdırılma olmamışdı. Fıstıq və küncüt əzməsi qarışımı dadlıdır..."'
  }
];

export const CustomerReviews: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal variant="fade">
          <div className={styles.header}>
            <span className={styles.badge}>Müştəri məmnuniyyəti</span>
            <h2 className={styles.title}>Müştərilərimizin Oilganic haqqında rəyləri</h2>
            <p className={styles.subtitle}>
              Mağazamızdan və çatdırılmamızdan razı qalan müştərilərimizin canlı mesajları və rəyləri.
            </p>
          </div>
        </Reveal>

        <div className={styles.grid}>
          {REVIEWS.map((review, idx) => (
            <Reveal key={review.id} variant="slideUp" delay={idx * 0.1}>
              <div
                className={styles.card}
                onClick={() => setSelectedImage(review.imageSrc)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedImage(review.imageSrc);
                  }
                }}
                aria-label={`Rəyi böyüdüb bax: ${review.alt}`}
              >
                <div className={styles.imageWrapper}>
                  <img
                    src={review.imageSrc}
                    alt={review.alt}
                    className={styles.reviewImg}
                    loading="lazy"
                  />
                </div>

                <div className={styles.ratingRow}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>

                <p className={styles.reviewCaption}>
                  <MessageSquareQuote size={16} style={{ display: 'inline', marginRight: '6px', opacity: 0.7 }} />
                  {review.caption}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-label="Rəy şəklini böyüt"
        >
          <img src={selectedImage} alt="Müştəri rəyi böyüdülmüş" className={styles.modalImg} />
        </div>
      )}
    </section>
  );
};
