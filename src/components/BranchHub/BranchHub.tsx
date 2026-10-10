import React from 'react';
import styles from './BranchHub.module.css';

// Official SVG Icons
const StoreIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
  </svg>
);

const ArrowRightIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const AlertCircleIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077" />
  </svg>
);

const TikTokIcon: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const WoltIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg
    width={size}
    height={Math.round(size * (262 / 720))}
    viewBox="0 0 720 262"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M411.996 159.402c-12.655-9.343-18.116-26.236-13.633-52.765.14-.84.502-2.324.98-4.138-2.635-1.049-5.617-1.498-8.976-1.498-29.86 0-46.485 50.303-46.485 97.062 0 24.374 9.528 36.655 23.763 36.655 19.738 0 37.879-34.26 44.351-75.316m246.149-47.158s-14.268 68.612-14.268 93.99c0 17.638 8.218 23.682 18.37 23.682 12.837 0 24.623-8.102 35.6-28.21 2.52-4.615 11.736-1.727 16.57 3.835 2.106 2.426-.318 7.317-3.638 12.913C694.144 246.502 670.643 262 646.225 262c-26.6 0-42.953-12.398-47.05-43.758C583.917 242.244 559.498 262 531.516 262c-34.02 0-48.5-18.827-48.5-52.607 0-22.281 7.505-60.23 7.505-60.23-9.966 8.981-21.522 15.475-34.824 18.172C442.624 228.594 407.632 262 360.613 262c-39.819 0-67.176-20.926-67.176-71.113 0-61.952 39.45-117.15 101.346-117.15 35.243 0 60.825 18.91 63.078 62.92 14.492-2.446 27.884-12.369 39.545-26.498 5.248-33.237 12.748-71.145 17.325-92.536.953-4.45 2.579-12.797 10.504-15.267 8.87-2.768 21.537-3.256 34.857-.608 7.384 1.467 9.261 8.367 9.261 14.533 0 16.397-7.769 52.57-21.278 85.1-9.574 36.262-16.142 72.442-16.142 101.05 0 20.673 6.84 27.485 18.309 27.485 18.72 0 40.466-26.001 50.939-61.226 1.626-16.944 5.916-44.198 8.068-54.357-11.597.557-19.01.894-19.01.894-6.034.221-11.883-2.323-11.586-7.71.394-7.096 1.37-13.925 2.565-18.734 1.196-4.809 3.938-7.793 9.768-7.896 6.255-.11 15.25-.037 24.516.185 3.122-17.875 5.746-31.825 8.266-43.421 1.007-4.641 5.35-7.313 9.82-7.815 5.35-.6 21.291-.487 28.23 1.196 6.986 1.698 9.913 7.185 8.702 12.735-2.472 11.303-7.526 39.04-7.526 39.04a6147.07 6147.07 0 0 1 46.66 2.252c7.475.335 11.327 4.544 10.131 11.125-2.016 11.055-10.246 14.608-21.875 14.875-13.262.304-27.21.731-39.765 1.185M299.32 23.772c0 77.229-41.424 237.729-105.603 237.729-48.42 0-58.144-54.148-60.644-123.13-24.267 52.943-37.112 80.43-53.148 107.952C72.35 259.32 63.246 262 53.302 262c-8.757 0-31.342-2.926-36.603-6.19-5.261-3.262-8.153-6.21-10.73-18.68-11.925-57.698-4.212-132.317 7.642-191.802 2.071-10.393 4.737-15.415 11.917-20.121 7.659-5.019 24.632-5.373 35.686-5.566 5.868-.103 9.279 4.121 7.803 11.274-10.677 51.94-23.21 123.105-13.445 196.466 0 0 36.936-73.192 75.224-164.314 7.685-18.291 9.405-24.297 16.715-25.917 9.568-2.12 16.467-2.13 26.102-.959 6.357.774 9.553 2.432 9.309 11.24-.667 23.745-2.257 50.615-2.257 78.511 0 47.204 5.064 100.27 23.246 100.27 24.419 0 45.87-113.537 38.294-211.097-.524-6.738 1.912-13.583 9.113-14.33C254.925.412 262.227 0 270.457 0c18.748 0 28.864 3.343 28.864 23.772" />
  </svg>
);

// Authentic Oilganic Brand SVG Component
const OilganicBrandHeader: React.FC = () => (
  <div className={styles.logoWrapper}>
    <svg
      viewBox="15 15 450 150"
      width="240"
      height="80"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Oilganic - Təbii yağlar və əzmələr"
    >
      <g>
        <g transform="translate(24, 20) scale(0.192)">
          <path
            d="M431 394C329.5 526 153.43 476.774 98 421C16.0093 338.5 8.9998 218 65.4998 137C147.587 91.2026 187.701 93.6415 254.5 137C254.5 137 150 99.5 83.5 191C73.313 205.017 14.0003 303.5 107.5 403C218.077 495.259 363.5 409.5 369 292.5C398.5 373 431 394 431 394Z"
            fill="#2F7D32"
          />
          <path
            d="M294 74.9992C271 66.4992 471.224 151.043 435 374.501C392 381 324 -8 82.5 113C234 -89.4996 581 104 448 374.501C470 169.5 317 83.4993 294 74.9992Z"
            fill="#033A25"
          />
        </g>
        <text
          x="122"
          y="112"
          fill="#237A2B"
          fontSize="94"
          fontWeight="700"
          fontFamily="var(--font-logo)"
          letterSpacing="-2"
        >
          ilganic
        </text>
        <text
          x="124"
          y="152"
          fill="#237A2B"
          fontSize="24"
          fontWeight="500"
          fontFamily="var(--font-body)"
          letterSpacing="3.2"
        >
          təbii yağlar və əzmələr
        </text>
      </g>
    </svg>
  </div>
);

export const BranchHub: React.FC = () => {
  return (
    <main className={styles.pageWrapper}>
      {/* Dynamic ambient organic light glows */}
      <div className={styles.backgroundGlow} aria-hidden="true">
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
        <div className={styles.glowOrb3} />
      </div>

      <div className={styles.container}>
        {/* Header / Brand identity */}
        <header className={styles.header}>
          <OilganicBrandHeader />

          <h1 className={styles.title}>Oilganic mağazasına xoş gəlmisiniz!</h1>

          <p className={styles.subtitle}>
            Zəhmət olmasa, alış-veriş edəcəyiniz filialı seçin.
          </p>

          <div className={styles.noticePill} role="status">
            <span className={styles.noticeIcon}>
              <AlertCircleIcon size={16} />
            </span>
            <span className={styles.noticeText}>
              Filiallar arası qiymətlər fərqli ola bilər
            </span>
          </div>
        </header>

        {/* Branch Selection List */}
        <section className={styles.sectionBlock} aria-label="Filial seçimi">
          <div className={styles.branchList}>
            {/* 8km bazarı filialı */}
            <a
              href="https://clps.cc/m/eyJ2biI6MSwiYiI6MTIwOTV9"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.branchCard}
              id="branch-8km"
            >
              <div className={styles.branchCardLeft}>
                <div className={styles.branchIconBadge}>
                  <StoreIcon size={22} />
                </div>
                <div className={styles.branchInfo}>
                  <h2 className={styles.branchTitle}>8km bazarı filialı</h2>
                </div>
              </div>
              <div className={styles.branchArrowBadge}>
                <ArrowRightIcon size={18} />
              </div>
            </a>

            {/* Bravo (Oazis) filialı */}
            <a
              href="https://clps.cc/m/eyJ2biI6MSwiYiI6MTgxOTJ9"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.branchCard}
              id="branch-bravo"
            >
              <div className={styles.branchCardLeft}>
                <div className={styles.branchIconBadge}>
                  <StoreIcon size={22} />
                </div>
                <div className={styles.branchInfo}>
                  <h2 className={styles.branchTitle}>Bravo (Oazis) filialı</h2>
                </div>
              </div>
              <div className={styles.branchArrowBadge}>
                <ArrowRightIcon size={18} />
              </div>
            </a>
          </div>
        </section>

        {/* Social & Delivery Channels */}
        <section
          className={styles.channelsSection}
          aria-label="Əlaqə və sosial şəbəkələr"
        >
          <div className={styles.channelsDivider}>
            <span className={styles.channelsDividerLine} />
            <span className={styles.channelsDividerText}>
              Əlaqə & Sosial Şəbəkələr
            </span>
            <span className={styles.channelsDividerLine} />
          </div>

          <div className={styles.channelsGrid}>
            {/* WhatsApp */}
            <a
              href="https://wa.me/message/A5GKBNAR4DJDO1"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.channelCard} ${styles.whatsappCard}`}
              id="channel-whatsapp"
            >
              <div
                className={`${styles.channelIconBox} ${styles.whatsappIconBox}`}
              >
                <WhatsAppIcon size={22} />
              </div>
              <div className={styles.channelDetails}>
                <span className={styles.channelName}>WhatsApp</span>
                <span className={styles.channelHandle}>Birbaşa əlaqə</span>
              </div>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/oilganic_shop"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.channelCard} ${styles.instagramCard}`}
              id="channel-instagram"
            >
              <div
                className={`${styles.channelIconBox} ${styles.instagramIconBox}`}
              >
                <InstagramIcon size={22} />
              </div>
              <div className={styles.channelDetails}>
                <span className={styles.channelName}>Instagram</span>
                <span className={styles.channelHandle}>@oilganic_shop</span>
              </div>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@oilganic_shop"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.channelCard} ${styles.tiktokCard}`}
              id="channel-tiktok"
            >
              <div
                className={`${styles.channelIconBox} ${styles.tiktokIconBox}`}
              >
                <TikTokIcon size={22} />
              </div>
              <div className={styles.channelDetails}>
                <span className={styles.channelName}>TikTok</span>
                <span className={styles.channelHandle}>@oilganic_shop</span>
              </div>
            </a>

            {/* Wolt */}
            <a
              href="https://wolt.com/az/aze/baku/venue/oilganic-shop?no_universal_links=true"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.channelCard} ${styles.woltCard}`}
              id="channel-wolt"
            >
              <div className={`${styles.channelIconBox} ${styles.woltIconBox}`}>
                <WoltIcon size={24} />
              </div>
              <div className={styles.channelDetails}>
                <span className={styles.channelName}>Wolt</span>
                <span className={styles.channelHandle}>Ünvana çatdırılma</span>
              </div>
            </a>
          </div>
        </section>
      </div>

      {/* Subtle brand footer */}
      <footer className={styles.footer}>
        <p className={styles.footerCopyright}>
          © {new Date().getFullYear()} Oilganic. Bütün hüquqlar qorunur.
        </p>
        <p className={styles.footerTagline}>
          Soyuq sıxım yağlar, təbii çərəz əzmələri və sağlam qidalar
        </p>
      </footer>
    </main>
  );
};
