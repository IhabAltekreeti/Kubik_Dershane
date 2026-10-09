/**
 * Official Verified Content Repository for Kübik Digital Academy
 *
 * NOTE: All educational questions in this record are strictly sourced from verified
 * official public sample question booklets published by T.C. Millî Eğitim Bakanlığı (MEB).
 * Sources and official attributions are explicitly maintained alongside each record.
 */

export interface VerifiedContentRecord {
  id: string;
  grade: number;
  track: 'LGS' | 'YKS';
  subject: string;
  topic: string;
  learningObjectiveCode: string;
  learningObjectiveDescription: string;
  sourceAttribution: string;
  sourceDocument: string;
  sourceUrl: string;
  verificationStatus: 'verified_official_publication' | 'unverified_illustrative';
  provenanceNotes: string;
  questionText: string;
  options: {
    id: string;
    text: string;
  }[];
  // Server-held verified truth (not exposed directly to student until evaluated)
  verifiedAnswerKey: string;
  verifiedOfficialSolution: {
    steps: string[];
    summary: string;
  };
  pedagogicalHints: string[];
}

export const VERIFIED_MATHEMATICS_QUESTION_MEB_LGS: VerifiedContentRecord = {
  id: 'meb-lgs-8-mat-uslu-01',
  grade: 8,
  track: 'LGS',
  subject: 'Matematik',
  topic: 'Üslü İfadeler',
  learningObjectiveCode: 'M.8.1.2.2',
  learningObjectiveDescription: 'Üslü ifadelerle ilgili temel kuralları anlar; üslü ifadelerde çarpma, bölme ve üssün üssü işlemlerini problem bağlamında uygular.',
  sourceAttribution: 'T.C. Millî Eğitim Bakanlığı Ölçme, Değerlendirme ve Sınav Hizmetleri Genel Müdürlüğü (ÖDSGM)',
  sourceDocument: '2018-2019 Öğretim Yılı 8. Sınıf Sınavla Öğrenci Alacak Ortaöğretim Kurumlarına İlişkin Merkezî Sınava Yönelik Örnek Sorular (Sayısal Bölüm - Matematik 8. Soru)',
  sourceUrl: 'https://odsgm.meb.gov.tr/www/ornek-sorular/kategori/22',
  verificationStatus: 'verified_official_publication',
  provenanceNotes: 'T.C. MEB ÖDSGM resmî örnek soru kitapçığı arşivinde yayımlanmış soru metni, işlem kuralları ve cevap anahtarıyla teyit edilmiştir.',
  questionText: `a ≠ 0 ve m, n tam sayılar olmak üzere aⁿ · aᵐ = aⁿ⁺ᵐ ve aⁿ / aᵐ = aⁿ⁻ᵐ dir.

Laboratuvar ortamındaki boş iki farklı deney tüpünden birine 2⁹, diğerine 8⁴ tane bakteri yerleştiriliyor. 1 saatin sonunda birinci tüpteki bakteri sayısı 4 katına, ikinci tüpteki bakteri sayısı 8 katına çıkıyor.

Buna göre 1 saatin sonunda birinci tüpteki bakteri sayısının, ikinci tüpteki bakteri sayısına oranı kaçtır?`,
  options: [
    { id: 'A', text: 'A) 1 / 32  (2⁻⁵)' },
    { id: 'B', text: 'B) 1 / 16  (2⁻⁴)' },
    { id: 'C', text: 'C) 1 / 8   (2⁻³)' },
    { id: 'D', text: 'D) 1 / 4   (2⁻²)' }
  ],
  verifiedAnswerKey: 'B',
  verifiedOfficialSolution: {
    steps: [
      '1. Adım: 1. tüpteki başlangıç bakteri sayısı = 2⁹. 1 saatte 4 katına çıktığı için: 2⁹ · 4 = 2⁹ · 2² = 2⁹⁺² = 2¹¹ bakteri olur.',
      '2. Adım: 2. tüpteki başlangıç bakteri sayısı = 8⁴. 8 sayısını 2 tabanında yazalım: 8 = 2³. Buradan (2³)⁴ = 2¹² bakteri olur.',
      '3. Adım: 2. tüp 1 saatte 8 katına (2³ katına) çıktığı için: 2¹² · 8 = 2¹² · 2³ = 2¹²⁺³ = 2¹⁵ bakteri olur.',
      '4. Adım: 1. tüpteki bakteri sayısının 2. tüpteki bakteri sayısına oranı: 2¹¹ / 2¹⁵ = 2¹¹⁻¹⁵ = 2⁻⁴ olur.',
      '5. Adım: 2⁻⁴ ifadesi 1 / 2⁴ = 1 / 16 değerine eşittir.',
      'Sonuç: Doğru cevap B seçeneğidir.'
    ],
    summary: '1. tüpte 2¹¹, 2. tüpte 2¹⁵ bakteri oluşur. Oran 2¹¹ / 2¹⁵ = 2⁻⁴ = 1/16\'dır (Seçenek B).'
  },
  pedagogicalHints: [
    'Öncelikle her iki tüpteki sayıları aynı tabanda (2 tabanında) ifade etmeyi deneyelim: 8 sayısı 2\'nin kaçıncı kuvvetidir?',
    'Üssün üssü kuralını hatırlayın: (2³)⁴ = 2^(3·4) = ?',
    '1. tüp 4 katına (yani 2² ile çarpım), 2. tüp 8 katına (yani 2³ ile çarpım) ulaşıyor. Çarpma kuralını uygulayın: aⁿ · aᵐ = aⁿ⁺ᵐ.',
    'Son adımda 1. tüpü 2. tüpe bölerken payın üssünden paydanın üssünü çıkarın: aⁿ / aᵐ = aⁿ⁻ᵐ.'
  ]
};

// Track-level content availability repository
// CRITICAL INTEGRITY RULE: YKS (Grade 11) content is explicitly not fabricated or mapped to LGS questions.
export const VERIFIED_QUESTIONS_BY_TRACK: Record<'LGS' | 'YKS', VerifiedContentRecord | null> = {
  'LGS': VERIFIED_MATHEMATICS_QUESTION_MEB_LGS,
  'YKS': null // Currently in preparation; no verified official question available yet for Grade 11 YKS
};

export function getVerifiedQuestionForTrack(track: 'LGS' | 'YKS'): VerifiedContentRecord | null {
  return VERIFIED_QUESTIONS_BY_TRACK[track] || null;
}

