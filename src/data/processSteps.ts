export type ProcessStep = {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
};

export const PROCESS_STEPS: ProcessStep[] = [
  {
    stepNumber: 1,
    title: 'Seçilmiş Xammal',
    subtitle: 'Yerli və keyfiyyətli toxumlar, çərəzlər',
    description: 'Yalnız sağlam, kimyəvi işlənməmiş, təmizlənmiş xam badam, küncüt, fındıq və kətan toxumları seçilir.',
    details: [
      'Laboratoriya gigiyena standartlarına uyğun vizual yoxlanış',
      'Termiki aşınmaya məruz qalmamış çam toxumlar',
      'Təmizlənmiş və elənmiş tərkib'
    ]
  },
  {
    stepNumber: 2,
    title: 'Soyuq Sıxım və Üyütmə',
    subtitle: 'Gözünüzün qarşısında mağazada hazırlanır',
    description: 'Xammal xüsusi pres aparatına və ya əzmə üyüdücüsünə daxil edilir. Sıxım zamanı temperatur yüksəldilmir.',
    details: [
      'Mexaniki soyuq sıxım texnologiyası',
      'Sıfır kimyəvi həlledici və ya durulaşdırıcı',
      'Şəffaf fiziki mağaza şəraiti'
    ]
  },
  {
    stepNumber: 3,
    title: 'Gigiyenik Qablaşdırma',
    subtitle: 'Təbii qoruyucu tünd şüşələr və steril qablar',
    description: 'Hazırlanan təbii yağlar və əzmələr dərhal təmiz şüşə qablara süzülür, havalandırılmadan kipləşdirilir.',
    details: [
      'Tünd şüşə qablar (işıqdan proteksiya üçün)',
      'Tarix və həcm qeydiyyatı',
      'Germetik qapaq bağlama'
    ]
  },
  {
    stepNumber: 4,
    title: 'Təzə Təhvil və Çatdırılma',
    subtitle: 'Birbaşa müştəriyə və ya Wolt ilə',
    description: 'Təzə hazırlanan məhsul dərhal müştəriyə fiziki mağazada təhvil verilir və ya Wolt kuryeri ilə çatdırılır.',
    details: [
      'Gündəlik təzə istehsalat',
      'Wolt Baku sürətli kuryer çatdırılması',
      'WhatsApp üzərindən canlı dəstək'
    ]
  }
];
