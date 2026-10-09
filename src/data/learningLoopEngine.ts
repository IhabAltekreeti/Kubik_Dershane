import { LearningLoopSession, EducationalTrack } from '../types';

export const LEARNING_LOOP_SESSIONS: Record<string, LearningLoopSession> = {
  // LGS Session: Üslü İfadeler (Kerem Demir)
  'lgs_uslu_ifadeler': {
    id: 'lgs_uslu_ifadeler',
    track: 'LGS',
    studentId: 'std_lgs_801',
    topicId: 'top_lgs_uslu',
    topicName: 'Üslü İfadeler: Negatif Üsler ve Parantez Kuralları',
    subjectName: 'Matematik (8. Sınıf LGS)',
    diagnosis: {
      evidenceSummary: 'Kerem son 2 mini denemede negatif üs içeren 4 soruda tabanın işaretini negatif yapma hatası yaptı.',
      identifiedMisconception: 'Kuvvetin negatifliği (a⁻ⁿ) tabanın işaretini eksiye çevirmez; tabanı çarpmaya göre tersine çevirir (1 / aⁿ).',
      priorAccuracy: 56,
      sampleErrorDescription: 'Örneğin; 2⁻³ ifadesi -8 değil, 1 / 2³ = 1/8\'dir. Benzer şekilde (-3)⁻² = +1/9 iken -3⁻² = -1/9\'dur.'
    },
    conceptExplanation: {
      corePrinciple: 'Negatif üs, bir sayıyı eksi yapmaz; sadece pay ile paydanın yerini değiştirir!',
      keyFormulaOrRule: 'a ≠ 0 olmak üzere: a⁻ⁿ = 1 / aⁿ  ve  (a/b)⁻ⁿ = (b/a)ⁿ',
      teachingNotes: [
        'Kuvvetin önündeki eksi işareti sadece ters çevirme emridir: "Beni ters çevir ve kuvveti pozitif yap."',
        'Tabanın işareti ile üssün işareti tamamen bağımsızdır.',
        'Parantez kontrolü kuralı: (-2)⁴ = +16 iken -2⁴ = -16\'dır. Parantez yoksa üs sadece sayıya aittir, öndeki eksiye dokunmaz.'
      ],
      visualModelTitle: 'Adım Adım Dönüşüm Modeli',
      visualModelSteps: [
        '1. Adım: Tabanı ve üssü tespit et: Örneğin 5⁻²',
        '2. Adım: Üsteki eksiyi kaldır ve paydaya gönder: 1 / 5²',
        '3. Adım: Pozitif üssü hesapla: 1 / 25'
      ]
    },
    guidedPractice: {
      questionContext: 'LGS Yeni Nesil Modelleme Sorusu Hazırlığı',
      questionText: 'Aşağıdaki eşitliklerden hangisi KESİNLİKLE DOĞRUDUR?',
      hints: [
        'İpucu 1: Negatif üs sayının işaretini eksi yapmaz, ters çevirir (1/x).',
        'İpucu 2: Parantez içindeki negatif tabanın çift kuvveti pozitiftir.',
        'İpucu 3: (-4)⁻² ifadesinde üs çifttir ve parantez vardır.'
      ],
      workedSolution: [
        'A seçeneği: (-2)⁻³ = 1 / (-2)³ = 1 / -8 = -1/8 olur. (Eğer +1/8 denildiyse yanlıştır)',
        'B seçeneği: 4⁻² = 1 / 4² = 1/16\'dır. (Asla -16 veya -1/16 değildir)',
        'C seçeneği: (-3)⁻² = 1 / (-3)² = 1 / 9\'dur. Parantez karesi pozitiftir!',
        'Doğru cevap C seçeneğidir.'
      ],
      options: [
        { id: 'opt_a', text: 'A) 2⁻⁴ = -16', isCorrect: false },
        { id: 'opt_b', text: 'B) (-5)⁻¹ = 5', isCorrect: false },
        { id: 'opt_c', text: 'C) (-3)⁻² = 1 / 9', isCorrect: true },
        { id: 'opt_d', text: 'D) -4⁻² = 1 / 16', isCorrect: false }
      ]
    },
    verificationAssessment: {
      questionText: 'x = -2 olduğuna göre, (x)⁻³ - (-x)⁻² işleminin sonucu kaçtır?',
      options: [
        { id: 'v_a', text: 'A) -3/8', isCorrect: true },
        { id: 'v_b', text: 'B) +1/4', isCorrect: false },
        { id: 'v_c', text: 'C) -1/8', isCorrect: false },
        { id: 'v_d', text: 'D) +3/8', isCorrect: false }
      ],
      explanation: 'x = -2 için: (-2)⁻³ = 1/(-8) = -1/8. (-x) = 2 olduğundan 2⁻² = 1/4. Dolayısıyla: (-1/8) - (1/4) = (-1/8) - (2/8) = -3/8.'
    },
    masteryUpdate: {
      previousMastery: 52,
      newMastery: 74,
      delta: 22,
      auditLog: 'Öğrenci negatif üs ve parantez ayrımı kuralını pekiştirme sorusunda başarıyla uyguladı. Kazanım seviyesi 52 -> 74 olarak güncellendi.'
    },
    recommendation: {
      actionType: 'advance',
      title: 'Kazanım Güçlendirildi — Sıradaki Aşama: Yeni Nesil Problem Çözümü',
      description: 'Temel kavram yanılgısı giderildi. MEB tarzı 6 adet grafik ve modelleme sorusuyla pekiştirmeye devam edebilirsiniz.',
      suggestedTaskTitle: 'LGS MEB Örnek Sorular: Üslü İfadeler ve Bilimsel Gösterim Testi'
    }
  },

  // YKS Session: Fonksiyon Simetrileri (Selin Yılmaz)
  'yks_fonksiyon_simetri': {
    id: 'yks_fonksiyon_simetri',
    track: 'YKS',
    studentId: 'std_yks_1101',
    topicId: 'top_yks_fonk',
    topicName: 'Fonksiyonlarda Simetri & Grafik Öteleme: y = f(-x) ve -f(x)',
    subjectName: '11. Sınıf AYT Matematik',
    diagnosis: {
      evidenceSummary: 'Selin son AYT denemesinde ve tarama testinde f(-x) ile -f(x) dönüşümlerini birbirine karıştırdı.',
      identifiedMisconception: 'x yerine -x yazıldığında grafik y-eksenine göre yansır; fonksiyonun tamamı eksiyle çarpıldığında (-f(x)) x-eksenine göre yansır.',
      priorAccuracy: 55,
      sampleErrorDescription: 'f(-x) işleminde girdinin işareti değiştiği için yatay eksende ayna görüntüsü oluşur. Selin bunu düşey eksenle karıştırmaktadır.'
    },
    conceptExplanation: {
      corePrinciple: 'Parantez İçi Değişimler x-eksenini (ters yönlü), Parantez Dışı Değişimler y-eksenini etkiler!',
      keyFormulaOrRule: 'y = f(-x) → y eksenine göre simetri | y = -f(x) → x eksenine göre simetri | y = -f(-x) → Orijine göre simetri',
      teachingNotes: [
        'Kural 1: f(x - a) grafiği a birim SAĞA kaydırır; f(x + a) ise a birim SOLA kaydırır.',
        'Kural 2: f(x) + b grafiği b birim YUKARI, f(x) - b ise b birim AŞAĞI öteler.',
        'Kural 3: f(-x) = f(x) ise Çift Fonksiyon (y-eksenine göre simetrik); f(-x) = -f(x) ise Tek Fonksiyon (Orijine göre simetrik).'
      ],
      visualModelTitle: 'Dönüşüm Koordinat Tablosu',
      visualModelSteps: [
        'Nokta: (a, b)',
        'f(-x) uygulanınca: (-a, b) [y-eksenine göre yansıma]',
        '-f(x) uygulanınca: (a, -b) [x-eksenine göre yansıma]',
        '-f(-x) uygulanınca: (-a, -b) [Orijine göre simetri]'
      ]
    },
    guidedPractice: {
      questionContext: 'ÖSYM AYT Matematik Benzeri Soru Analizi',
      questionText: 'f(x) fonksiyonunun tepe noktası T(3, -5) olduğuna göre, g(x) = -f(x + 2) + 1 fonksiyonunun tepe noktası koordinatları aşağıdakilerden hangisidir?',
      hints: [
        'İpucu 1: Parantez içindeki (x + 2), grafiği x-ekseninde 2 birim SOLA kaydırır: x koordinatı 3 - 2 = 1 olur.',
        'İpucu 2: Fonksiyonun başındaki eksi işareti (-f), y değerini ters çevirir: -(-5) = +5.',
        'İpucu 3: Sondaki +1 ise grafiği 1 birim YUKARI öteler: 5 + 1 = 6.'
      ],
      workedSolution: [
        '1. Adım: Başlangıç tepe noktası: (3, -5)',
        '2. Adım: x + 2 dönüşümü -> x ekseninde 2 birim sola ötelenir: x_yeni = 3 - 2 = 1.',
        '3. Adım: -f(...) dönüşümü -> x eksenine göre yansır: y = -(-5) = 5.',
        '4. Adım: +1 eklenmesi -> 1 birim yukarı çıkar: y_yeni = 5 + 1 = 6.',
        'Yeni tepe noktası: T\'(1, 6) olur.'
      ],
      options: [
        { id: 'opt_1', text: 'A) (5, -4)', isCorrect: false },
        { id: 'opt_2', text: 'B) (1, 6)', isCorrect: true },
        { id: 'opt_3', text: 'C) (1, 4)', isCorrect: false },
        { id: 'opt_4', text: 'D) (-1, 6)', isCorrect: false }
      ]
    },
    verificationAssessment: {
      questionText: 'Gerçel sayılarda tanımlı f(x) fonksiyonunun grafiği orijine göre simetriktir. f(4) = -8 olduğuna göre, f(-4) + f(0) toplamı kaçtır?',
      options: [
        { id: 'v_1', text: 'A) -8', isCorrect: false },
        { id: 'v_2', text: 'B) 0', isCorrect: false },
        { id: 'v_3', text: 'C) 8', isCorrect: true },
        { id: 'v_4', text: 'D) 16', isCorrect: false }
      ],
      explanation: 'Orijine göre simetrik fonksiyonlar TEK fonksiyondur: f(-x) = -f(x). Tek fonksiyonlarda f(0) = 0\'dır. f(-4) = -f(4) = -(-8) = 8. Buradan 8 + 0 = 8 bulunur.'
    },
    masteryUpdate: {
      previousMastery: 55,
      newMastery: 78,
      delta: 23,
      auditLog: 'Öğrenci fonksiyon öteleme ve tek/çift fonksiyon simetri kurallarını başarıyla çözdü. Kazanım 55 -> 78 olarak güncellendi.'
    },
    recommendation: {
      actionType: 'advance',
      title: 'Tebrikler! AYT Fonksiyon Dönüşümleri Seviyesi Yükseltildi',
      description: 'Zorluk seviyesi 4/5 olan karma parabol ve fonksiyon grafiği sorularına geçebilirsiniz. Danışman öğretmeniniz Metin Hoca\'ya başarı bildirimi iletildi.',
      suggestedTaskTitle: 'ÖSYM Çıkmış Sorular: Fonksiyonlarda Simetri ve Öteleme Karma Testi'
    }
  }
};
