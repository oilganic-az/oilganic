export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Məhsullar necə hazırlanır?',
    answer: 'Oilganic mağazasında təbii yağlar və əzmələr müştərilərin gözü qarşısında soyuq sıxım (cold-pressed) və təbii üyütmə cihazları ilə təzə hazırlanır. Qızdırma, kənar kimyəvi qatqı və ya rafinasiya tətbiq olunmur.'
  },
  {
    id: 'faq-2',
    question: 'Sifarişi necə verə bilərəm?',
    answer: 'Sifarişlərinizi saytımız vasitəsilə səbətə əlavə edərək birbaşa WhatsApp üzərindən və ya Wolt Baku tətbiqi vasitəsilə dərhal rəsmiləşdirə bilərsiniz.'
  },
  {
    id: 'faq-3',
    question: 'Wolt vasitəsilə çatdırılma mövcuddurmu?',
    answer: 'Bəli! Wolt vasitəsilə Baku üzrə operativ çatdırılma xidmətimiz mövcuddur. "Wolt-dan sifariş" düyməsinə klikləyərək dərhal Wolt mağazamıza keçə bilərsiniz.'
  },
  {
    id: 'faq-4',
    question: 'Fiziki mağazaya gəlib hazırlanma prosesini görə bilərəmmi?',
    answer: 'Əlbəttə! Bakı şəhəri, Nizami rayonu, Cəmşid Naxçıvanski küçəsi 49C (8-ci km bazarı) ünvanındakı mağazamıza hər gün 09:00 - 19:00 aralığında yaxınlaşaraq məhsulların hazırlanmasını canlı izləyə bilərsiniz.'
  },
  {
    id: 'faq-5',
    question: 'Məhsulların saxlanma qaydaları necədir?',
    answer: 'Soyuq sıxım təbii yağlar və qatqısız əzmələr kimyəvi konservant ehtiva etmədiyi üçün onları birbaşa günəş işığından uzaq, sərin və quru yerdə tünd şüşə qablarda saxlanılması tövsiyə edilir.'
  }
];
