import { StudentProfile, ManagementMetrics, TeacherIntervention } from '../types';

export const DEMO_STUDENT_A_LGS: StudentProfile = {
  id: 'std_lgs_801',
  name: 'Kerem Demir',
  grade: 8,
  track: 'LGS',
  avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  targetGoal: 'Kabataş Erkek Lisesi (Hedef: 488+ Puan)',
  currentScoreEstimate: '448 Puan (Projeksiyon Net: 76.5 / 90)',
  overallMastery: 72,
  studyStreakDays: 14,
  weeklyStudyHours: 18.5,
  totalQuestionsSolved: 1420,
  overallAccuracyRate: 78.4,
  parentName: 'Murat Demir',
  parentPhoneMasked: '0532 *** ** 41',
  assignedAdvisor: 'Selda Hoca (Rehberlik & Kariyer)',
  subjects: [
    {
      id: 'sub_lgs_mat',
      name: 'Matematik',
      code: 'MAT-8',
      track: 'LGS',
      color: 'blue',
      totalTopics: 12,
      masteredTopics: 6,
      averageMastery: 64,
      weeklyGoalHours: 6.0,
      completedHours: 5.2,
      netScore: 12.33,
      targetNetScore: 18.0,
      topics: [
        {
          id: 'top_lgs_uslu',
          name: 'Üslü İfadeler & Bilimsel Gösterim',
          subjectId: 'sub_lgs_mat',
          subjectName: 'Matematik',
          masteryLevel: 52,
          status: 'needs_practice',
          questionCount: 85,
          correctCount: 48,
          accuracyRate: 56.4,
          lastPracticedDate: 'Dün',
          diagnosedWeakness: 'Negatif üslerde işaret belirleme ve yeni nesil modelleme sorularında işlem adımı karıştırma.',
          evidenceNotes: 'Son mini denemede 3 soru kaçırıldı (2 boş, 1 işlem hatası).'
        },
        {
          id: 'top_lgs_denklem',
          name: 'Birinci Dereceden Doğrusal Denklemler',
          subjectId: 'sub_lgs_mat',
          subjectName: 'Matematik',
          masteryLevel: 58,
          status: 'in_progress',
          questionCount: 92,
          correctCount: 57,
          accuracyRate: 62.0,
          lastPracticedDate: '3 gün önce',
          diagnosedWeakness: 'Koordinat sistemi üzerinde eğim hesaplama ve grafik yorumlama.',
          evidenceNotes: 'Eğim formülünde dikey/yatay oran sıralaması ters alındı.'
        },
        {
          id: 'top_lgs_carpanlar',
          name: 'Çarpanlar ve Katlar (EBOB-EKOK)',
          subjectId: 'sub_lgs_mat',
          subjectName: 'Matematik',
          masteryLevel: 84,
          status: 'mastered',
          questionCount: 110,
          correctCount: 96,
          accuracyRate: 87.2,
          lastPracticedDate: '5 gün önce',
          evidenceNotes: 'EBOB-EKOK problem ayırt etme kazanımı tam oturdu.'
        },
        {
          id: 'top_lgs_koklu',
          name: 'Kareköklü İfadeler',
          subjectId: 'sub_lgs_mat',
          subjectName: 'Matematik',
          masteryLevel: 76,
          status: 'in_progress',
          questionCount: 104,
          correctCount: 81,
          accuracyRate: 77.8,
          lastPracticedDate: '4 gün önce',
          evidenceNotes: 'Katsayıyı kök içine alma başarılı, yaklaşık değer tahmini pekiştirilmeli.'
        }
      ]
    },
    {
      id: 'sub_lgs_fen',
      name: 'Fen Bilimleri',
      code: 'FEN-8',
      track: 'LGS',
      color: 'teal',
      totalTopics: 10,
      masteredTopics: 6,
      averageMastery: 71,
      weeklyGoalHours: 4.5,
      completedHours: 4.0,
      netScore: 15.66,
      targetNetScore: 19.0,
      topics: [
        {
          id: 'top_lgs_mevsim',
          name: 'Mevsimler ve İklim',
          subjectId: 'sub_lgs_fen',
          subjectName: 'Fen Bilimleri',
          masteryLevel: 60,
          status: 'needs_practice',
          questionCount: 64,
          correctCount: 40,
          accuracyRate: 62.5,
          lastPracticedDate: 'Bugün',
          diagnosedWeakness: 'Dünya eksen eğikliği ve güneş ışınlarının düşme açısının birim alana düşen ısı enerjisine etkisi.',
          evidenceNotes: 'Gölge boyu ve öğle vakti açı grafiklerinde kavram yanılgısı tespit edildi.'
        },
        {
          id: 'top_lgs_basinc',
          name: 'Basınç (Katı ve Sıvı Basıncı)',
          subjectId: 'sub_lgs_fen',
          subjectName: 'Fen Bilimleri',
          masteryLevel: 65,
          status: 'in_progress',
          questionCount: 78,
          correctCount: 52,
          accuracyRate: 66.6,
          lastPracticedDate: '2 gün önce',
          diagnosedWeakness: 'U boruları ve bileşik kaplarda sıvı basıncı dengesi hesaplamaları.',
          evidenceNotes: 'Yoğunluk ve derinlik çarpım mantığında dikkat eksikliği.'
        },
        {
          id: 'top_lgs_dna',
          name: 'DNA ve Genetik Kod',
          subjectId: 'sub_lgs_fen',
          subjectName: 'Fen Bilimleri',
          masteryLevel: 88,
          status: 'mastered',
          questionCount: 85,
          correctCount: 77,
          accuracyRate: 90.5,
          lastPracticedDate: '1 hafta önce',
          evidenceNotes: 'Çaprazlama ve modifikasyon sorularında %90+ başarı.'
        }
      ]
    },
    {
      id: 'sub_lgs_turkce',
      name: 'Türkçe',
      code: 'TR-8',
      track: 'LGS',
      color: 'amber',
      totalTopics: 8,
      masteredTopics: 7,
      averageMastery: 86,
      weeklyGoalHours: 4.0,
      completedHours: 3.8,
      netScore: 17.33,
      targetNetScore: 19.33,
      topics: [
        {
          id: 'top_lgs_paragraf',
          name: 'Paragrafta Anlam & Muhakeme',
          subjectId: 'sub_lgs_turkce',
          subjectName: 'Türkçe',
          masteryLevel: 88,
          status: 'mastered',
          questionCount: 140,
          correctCount: 125,
          accuracyRate: 89.2,
          lastPracticedDate: 'Dün',
          evidenceNotes: 'Metin analizi ve ana düşünce kavrama çok kuvvetli.'
        },
        {
          id: 'top_lgs_fiilimsi',
          name: 'Fiilimsiler & Cümle Türleri',
          subjectId: 'sub_lgs_turkce',
          subjectName: 'Türkçe',
          masteryLevel: 82,
          status: 'mastered',
          questionCount: 65,
          correctCount: 55,
          accuracyRate: 84.6,
          lastPracticedDate: '4 gün önce',
          evidenceNotes: 'Zarf-fiil ekleri ve bağlaç ayrımı başarıyla tamamlandı.'
        }
      ]
    },
    {
      id: 'sub_lgs_inkilap',
      name: 'T.C. İnkılap Tarihi',
      code: 'INK-8',
      track: 'LGS',
      color: 'rose',
      totalTopics: 6,
      masteredTopics: 5,
      averageMastery: 84,
      weeklyGoalHours: 2.0,
      completedHours: 2.1,
      netScore: 9.0,
      targetNetScore: 10.0,
      topics: [
        {
          id: 'top_lgs_milli_mucadele',
          name: 'Milli Mücadele Hazırlık Dönemi',
          subjectId: 'sub_lgs_inkilap',
          subjectName: 'T.C. İnkılap Tarihi',
          masteryLevel: 85,
          status: 'mastered',
          questionCount: 60,
          correctCount: 52,
          accuracyRate: 86.6,
          lastPracticedDate: '5 gün önce',
          evidenceNotes: 'Genelgeler ve kongre kronolojisi eksiksiz kavrandı.'
        }
      ]
    }
  ],
  dailyTasks: [
    {
      id: 'task_lgs_1',
      title: 'Üslü İfadeler: Negatif Üsler ve Yeni Nesil Modelleme',
      subjectName: 'Matematik',
      track: 'LGS',
      type: 'guided_concept',
      durationMinutes: 25,
      questionCount: 8,
      completed: false,
      priority: 'high',
      topicId: 'top_lgs_uslu',
      description: 'Kübik Öğrenme Döngüsü: Adım adım kavram analizi ve ipuçlu pekiştirme.'
    },
    {
      id: 'task_lgs_2',
      title: 'Mevsimler ve İklim: Eksen Eğikliği Çıkmış Soru Analizi',
      subjectName: 'Fen Bilimleri',
      track: 'LGS',
      type: 'practice_quiz',
      durationMinutes: 20,
      questionCount: 10,
      completed: true,
      priority: 'high',
      topicId: 'top_lgs_mevsim',
      description: 'Son 4 yılın LGS MEB örnek soruları üzerinden 10 soruluk odak deneme.'
    },
    {
      id: 'task_lgs_3',
      title: 'Sözel Mantık ve Görsel Yorumlama Hız Testi',
      subjectName: 'Türkçe',
      track: 'LGS',
      type: 'practice_quiz',
      durationMinutes: 15,
      questionCount: 6,
      completed: false,
      priority: 'normal',
      topicId: 'top_lgs_paragraf',
      description: 'Zaman yönetimi için soru başına 110 saniye süre kısıtlı mini test.'
    },
    {
      id: 'task_lgs_4',
      title: 'Günün Tekrarı ve Yanlış Yapılan Soruların İncelenmesi',
      subjectName: 'Rehberlik & Analiz',
      track: 'LGS',
      type: 'review',
      durationMinutes: 15,
      completed: false,
      priority: 'normal',
      topicId: 'top_lgs_uslu',
      description: 'Hata havuzuna düşen 4 sorunun çözüm videosunu inceleme.'
    }
  ],
  recentExams: [
    {
      id: 'exam_lgs_04',
      date: '04 Ekim 2026',
      title: 'Kübik Türkiye Geneli LGS Kurumsal Deneme #4',
      track: 'LGS',
      totalQuestions: 90,
      correct: 78,
      incorrect: 8,
      empty: 4,
      net: 75.33,
      score: 452.4,
      timeSpentMinutes: 155,
      subjectNets: {
        'Matematik (20)': 13.0,
        'Fen Bilimleri (20)': 16.33,
        'Türkçe (20)': 18.0,
        'İnkılap (10)': 9.33,
        'Din K. (10)': 9.67,
        'İngilizce (10)': 9.0
      },
      rankInClass: '4 / 36 Şube Sıralaması',
      analysisSummary: 'Matematik yeni nesil kurgularda zaman kaybı yaşandı; Fen ve Türkçe netleri zirveye yakın seyrediyor.'
    },
    {
      id: 'exam_lgs_03',
      date: '27 Eylül 2026',
      title: 'Kübik LGS Kazanım İzleme Sınavı #3',
      track: 'LGS',
      totalQuestions: 90,
      correct: 75,
      incorrect: 11,
      empty: 4,
      net: 71.33,
      score: 438.1,
      timeSpentMinutes: 155,
      subjectNets: {
        'Matematik (20)': 11.67,
        'Fen Bilimleri (20)': 15.0,
        'Türkçe (20)': 17.67,
        'İnkılap (10)': 9.0,
        'Din K. (10)': 9.33,
        'İngilizce (10)': 8.66
      },
      rankInClass: '6 / 36 Şube Sıralaması',
      analysisSummary: 'Üslü ifadeler ve Basınç ünitelerinde kavram yanılgıları belirgin.'
    }
  ],
  activeWeaknessTopics: []
};

// Bind active weaknesses
DEMO_STUDENT_A_LGS.activeWeaknessTopics = [
  DEMO_STUDENT_A_LGS.subjects[0].topics[0], // Üslü ifadeler
  DEMO_STUDENT_A_LGS.subjects[1].topics[0]  // Mevsimler ve iklim
];

export const DEMO_STUDENT_B_YKS: StudentProfile = {
  id: 'std_yks_1101',
  name: 'Selin Yılmaz',
  grade: 11,
  track: 'YKS',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  targetGoal: 'ODTÜ Bilgisayar Mühendisliği (Hedef Sıralama: İlk 4.500)',
  currentScoreEstimate: 'TYT 88.5 Net · 11. Sınıf AYT 28 / 40 Net',
  overallMastery: 76,
  studyStreakDays: 21,
  weeklyStudyHours: 24.0,
  totalQuestionsSolved: 2680,
  overallAccuracyRate: 81.2,
  parentName: 'Gülşen Yılmaz',
  parentPhoneMasked: '0544 *** ** 88',
  assignedAdvisor: 'Metin Hoca (Matematik Zümre Başkanı)',
  subjects: [
    {
      id: 'sub_yks_mat',
      name: '11. Sınıf Matematik & TYT',
      code: 'MAT-11',
      track: 'YKS',
      color: 'blue',
      totalTopics: 14,
      masteredTopics: 8,
      averageMastery: 69,
      weeklyGoalHours: 8.5,
      completedHours: 7.8,
      netScore: 26.5,
      targetNetScore: 35.0,
      topics: [
        {
          id: 'top_yks_fonk',
          name: 'Fonksiyonlarda Simetri & Öteleme (f(x) Dönüşümleri)',
          subjectId: 'sub_yks_mat',
          subjectName: '11. Sınıf Matematik & TYT',
          masteryLevel: 55,
          status: 'needs_practice',
          questionCount: 115,
          correctCount: 68,
          accuracyRate: 59.1,
          lastPracticedDate: 'Bugün',
          diagnosedWeakness: 'f(-x) ve -f(x) yansımaları ile parantez içi yatay ötelemelerde işaret yönü karıştırılıyor.',
          evidenceNotes: 'ÖSYM tarzı 4 soruluk taramada 2 kritik işaret hatası saptandı.'
        },
        {
          id: 'top_yks_parabol',
          name: 'İkinci Dereceden Fonksiyonlar (Parabol)',
          subjectId: 'sub_yks_mat',
          subjectName: '11. Sınıf Matematik & TYT',
          masteryLevel: 62,
          status: 'in_progress',
          questionCount: 130,
          correctCount: 84,
          accuracyRate: 64.6,
          lastPracticedDate: '2 gün önce',
          diagnosedWeakness: 'Tepe noktası r = -b/2a ve simetri ekseni yardımıyla aralıkta en büyük/küçük değer bulma.',
          evidenceNotes: 'Kısıtlı tanım kümesinde uç nokta değerlendirmesi eksik yapılıyor.'
        },
        {
          id: 'top_yks_trigonometri',
          name: 'Trigonometri (Birim Çember & İndirgeme)',
          subjectId: 'sub_yks_mat',
          subjectName: '11. Sınıf Matematik & TYT',
          masteryLevel: 82,
          status: 'mastered',
          questionCount: 190,
          correctCount: 162,
          accuracyRate: 85.2,
          lastPracticedDate: '3 gün önce',
          evidenceNotes: 'Birim çember koordinatları ve açı indirgeme formülleri çok sağlam.'
        }
      ]
    },
    {
      id: 'sub_yks_fizik',
      name: '11. Sınıf Fizik (Mekanik)',
      code: 'FIZ-11',
      track: 'YKS',
      color: 'indigo',
      totalTopics: 10,
      masteredTopics: 5,
      averageMastery: 67,
      weeklyGoalHours: 6.0,
      completedHours: 5.5,
      netScore: 8.5,
      targetNetScore: 12.0,
      topics: [
        {
          id: 'top_yks_bagil',
          name: 'Vektörler ve Bağıl Hareket',
          subjectId: 'sub_yks_fizik',
          subjectName: '11. Sınıf Fizik (Mekanik)',
          masteryLevel: 58,
          status: 'needs_practice',
          questionCount: 95,
          correctCount: 56,
          accuracyRate: 58.9,
          lastPracticedDate: 'Dün',
          diagnosedWeakness: 'Nehir problemlerinde akıntı hızının karşı kıyıya varış süresine etkisiz olduğu kuralı unutuluyor.',
          evidenceNotes: 'Süre hesabı yapılırken düşey hız bileşeni yerine bileşke hız vektörü kullanıldı.'
        },
        {
          id: 'top_yks_newton',
          name: 'Newton\'ın Hareket Yasaları & Sürtünme',
          subjectId: 'sub_yks_fizik',
          subjectName: '11. Sınıf Fizik (Mekanik)',
          masteryLevel: 78,
          status: 'mastered',
          questionCount: 120,
          correctCount: 98,
          accuracyRate: 81.6,
          lastPracticedDate: '5 gün önce',
          evidenceNotes: 'Eğik düzlem ve etki-tepki kuvvet diyagramları başarıyla çiziliyor.'
        }
      ]
    },
    {
      id: 'sub_yks_kimya',
      name: '11. Sınıf Kimya',
      code: 'KIM-11',
      track: 'YKS',
      color: 'teal',
      totalTopics: 8,
      masteredTopics: 6,
      averageMastery: 84,
      weeklyGoalHours: 4.5,
      completedHours: 4.2,
      netScore: 9.67,
      targetNetScore: 12.0,
      topics: [
        {
          id: 'top_yks_gazlar',
          name: 'Gaz Yasaları & Kinetik Teori',
          subjectId: 'sub_yks_kimya',
          subjectName: '11. Sınıf Kimya',
          masteryLevel: 80,
          status: 'mastered',
          questionCount: 110,
          correctCount: 91,
          accuracyRate: 82.7,
          lastPracticedDate: '3 gün önce',
          evidenceNotes: 'İdeal gaz denklemi ve kısmi basınç hesaplamaları yüksek başarı.'
        }
      ]
    },
    {
      id: 'sub_yks_biyo',
      name: '11. Sınıf Biyoloji (Sistemler)',
      code: 'BIO-11',
      track: 'YKS',
      color: 'emerald',
      totalTopics: 8,
      masteredTopics: 6,
      averageMastery: 82,
      weeklyGoalHours: 4.0,
      completedHours: 3.5,
      netScore: 10.0,
      targetNetScore: 12.0,
      topics: [
        {
          id: 'top_yks_sinir',
          name: 'Sinir Sistemi & İmpuls İletimi',
          subjectId: 'sub_yks_biyo',
          subjectName: '11. Sınıf Biyoloji (Sistemler)',
          masteryLevel: 85,
          status: 'mastered',
          questionCount: 105,
          correctCount: 92,
          accuracyRate: 87.6,
          lastPracticedDate: '4 gün önce',
          evidenceNotes: 'Ranvier boğumu ve sinaps iletim mekanizmaları kavranmış.'
        }
      ]
    }
  ],
  dailyTasks: [
    {
      id: 'task_yks_1',
      title: 'Fonksiyon Grafikleri: y = f(-x) ve Simetri Kazanım Seansı',
      subjectName: '11. Sınıf Matematik & TYT',
      track: 'YKS',
      type: 'guided_concept',
      durationMinutes: 30,
      questionCount: 8,
      completed: false,
      priority: 'high',
      topicId: 'top_yks_fonk',
      description: 'Kübik Öğrenme Döngüsü: Öteleme kuralları, ipuçlu analitik adımlar ve pekiştirme.'
    },
    {
      id: 'task_yks_2',
      title: 'Nehirde Bağıl Hareket: Karşı Kıyıya Geçiş Zamanı Odak Testi',
      subjectName: '11. Sınıf Fizik (Mekanik)',
      track: 'YKS',
      type: 'practice_quiz',
      durationMinutes: 25,
      questionCount: 10,
      completed: true,
      priority: 'high',
      topicId: 'top_yks_bagil',
      description: 'Düşey bileşen bağımsızlığı ve sürüklenme mesafesi üzerine 10 yeni nesil AYT sorusu.'
    },
    {
      id: 'task_yks_3',
      title: 'TYT Türkçe Paragraf Ritim Testi (Hız ve Odaklanma)',
      subjectName: 'TYT Türkçe',
      track: 'YKS',
      type: 'practice_quiz',
      durationMinutes: 20,
      questionCount: 15,
      completed: false,
      priority: 'normal',
      topicId: 'top_yks_paragraf',
      description: 'Günlük TYT paragraf temposunu koruma seansı (hedef: max 17 dk).'
    },
    {
      id: 'task_yks_4',
      title: 'Haftalık Kazanım Hatalarının Gözden Geçirilmesi',
      subjectName: 'Danışmanlık & Analiz',
      track: 'YKS',
      type: 'review',
      durationMinutes: 20,
      completed: false,
      priority: 'normal',
      topicId: 'top_yks_fonk',
      description: 'Metin Hoca\'nın işaretlediği parabol ve simetri sorularını tekrar çözme.'
    }
  ],
  recentExams: [
    {
      id: 'exam_yks_03',
      date: '03 Ekim 2026',
      title: 'Kübik 11. Sınıf AYT Sayısal Deneme Sınavı #3',
      track: 'YKS',
      totalQuestions: 40,
      correct: 29,
      incorrect: 6,
      empty: 5,
      net: 27.5,
      score: 382.0,
      timeSpentMinutes: 90,
      subjectNets: {
        'Matematik (20)': 14.5,
        'Fizik (8)': 4.25,
        'Kimya (6)': 4.75,
        'Biyoloji (6)': 4.0
      },
      rankInClass: '2 / 28 Şube Sıralaması',
      analysisSummary: 'Fizik bağıl hareket ve parabol tepe noktası dönüşümlerinde soru kaybı yaşandı.'
    },
    {
      id: 'exam_yks_02',
      date: '20 Eylül 2026',
      title: 'Kübik TYT Seviye İzleme Denemesi #2',
      track: 'YKS',
      totalQuestions: 120,
      correct: 92,
      incorrect: 14,
      empty: 14,
      net: 88.5,
      score: 412.5,
      timeSpentMinutes: 165,
      subjectNets: {
        'Türkçe (40)': 33.75,
        'Temel Matematik (40)': 30.5,
        'Fen Bilimleri (20)': 14.25,
        'Sosyal Bilimler (20)': 10.0
      },
      rankInClass: '1 / 28 Şube Sıralaması',
      analysisSummary: 'TYT temeli çok kuvvetli, 11. sınıf AYT konularında kazanım pekiştirmesi gerekiyor.'
    }
  ],
  activeWeaknessTopics: []
};

DEMO_STUDENT_B_YKS.activeWeaknessTopics = [
  DEMO_STUDENT_B_YKS.subjects[0].topics[0], // Fonksiyon dönüşümleri
  DEMO_STUDENT_B_YKS.subjects[1].topics[0]  // Bağıl hareket
];

export const DEMO_TEACHER_INTERVENTIONS: TeacherIntervention[] = [
  {
    id: 'int_001',
    studentId: 'std_lgs_801',
    studentName: 'Kerem Demir (8-A · LGS)',
    date: 'Bugün, 09:15',
    subject: 'Matematik',
    topicName: 'Üslü İfadeler',
    triggerType: 'repeated_errors',
    observedEvidence: 'Son 2 mini denemede negatif üs içeren 5 sorunun 4\'ü yanlış çözüldü (Kuvvetin negatifliği tabanın işaretini değiştirmez kuralı ihlal ediliyor).',
    aiSuggestedAction: '6 soruluk hedef odaklı "Negatif Üs & Parantez Ayrımı" mini pekiştirme modülü atanması ve zümre öğretmeniyle 10 dk birebir soru inceleme randevusu oluşturulması önerilir.',
    teacherStatus: 'pending',
    assignedPracticeTitle: 'LGS Hedef Seans: Negatif Üsler ve Kesirli Dönüşümler'
  },
  {
    id: 'int_002',
    studentId: 'std_lgs_801',
    studentName: 'Kerem Demir (8-A · LGS)',
    date: 'Dün, 16:30',
    subject: 'Fen Bilimleri',
    topicName: 'Mevsimler ve İklim',
    triggerType: 'low_mastery',
    observedEvidence: 'Eksen eğikliği gölge boyu grafiklerinde ters orantı yanılgısı sürüyor. Doğruluk oranı %62 seviyesinde kaldı.',
    aiSuggestedAction: 'Görsel modelleme tabanlı interaktif ışık açısı simülasyonunu ödev listesine ekleme.',
    teacherStatus: 'approved',
    teacherNote: 'Ödev onaylandı. Perşembe etüdünde tahtada 2 MEB çıkmış soruyla pekiştirilecek.',
    assignedPracticeTitle: 'Güneş Işınlarının Geliş Açısı Görsel Analiz Testi'
  },
  {
    id: 'int_003',
    studentId: 'std_yks_1101',
    studentName: 'Selin Yılmaz (11-Say · YKS)',
    date: 'Bugün, 11:40',
    subject: 'Fizik',
    topicName: 'Bağıl Hareket',
    triggerType: 'repeated_errors',
    observedEvidence: 'Nehirde akıntı hızı ve karşı kıyıya ulaşma süresi ilişkisinde 3 kez süreye akıntı vektörünü dahil etti.',
    aiSuggestedAction: 'Vektör bileşenlerinin bağımsızlığı aksiyomu üzerine 4 adımlı Kübik Öğrenme Döngüsü modülünün aktifleştirilmesi.',
    teacherStatus: 'pending',
    assignedPracticeTitle: 'Nehir Problemleri: Karşı Kıyı Süresi & Sürüklenme Ayrımı'
  },
  {
    id: 'int_004',
    studentId: 'std_yks_1101',
    studentName: 'Selin Yılmaz (11-Say · YKS)',
    date: '3 gün önce',
    subject: 'Matematik',
    topicName: 'Fonksiyon Simetrileri',
    triggerType: 'routine_check',
    observedEvidence: 'f(-x) ile -f(x) grafik simetrisi kazanımı tarandı. İşlem hızı iyi fakat analitik orijin/eksen simetrisi sorusunda duraksadı.',
    aiSuggestedAction: 'Parabol tepe noktası dönüşümleriyle birleştirilmiş 8 soruluk zorluk seviyesi 4/5 AYT testi atanması.',
    teacherStatus: 'approved',
    teacherNote: 'Test atandı. 8 sorunun 7\'sini doğru tamamladı. Kazanım toparlanıyor.',
    assignedPracticeTitle: 'AYT Dönüşümler & Fonksiyon Grafikleri Zirve Paketi'
  }
];

export const DEMO_MANAGEMENT_METRICS: ManagementMetrics = {
  totalStudentsPhysical: 480, // Dershane fiziksel şubesi
  totalStudentsDigital: 1240, // Online & hibrit genişleme
  hybridCapacityUtilization: 94,
  activeOnlineRetention: 91.4,
  monthlyRecurringRevenueTL: 1845000,
  newEnrollmentsThisMonth: 168,
  averageWeeklyStudyMinutesPerStudent: 540,
  diagnosticAssessmentFunnel: [
    { stage: 'Site Ziyareti & Açılış', count: 18400, conversionRate: '100%' },
    { stage: 'Ücretsiz Seviye Tespit Başlatma', count: 4620, conversionRate: '25.1%' },
    { stage: 'Tanı Testini Tamamlama & Teşhis Raporu', count: 2890, conversionRate: '62.5%' },
    { stage: 'Veli / Öğrenci Rehberlik Görüşmesi', count: 980, conversionRate: '33.9%' },
    { stage: 'Kayıt (Hibrit / Dijital Akademi)', count: 342, conversionRate: '34.8%' }
  ],
  subjectAverages: [
    { subject: 'LGS Matematik', track: 'LGS', averageNet: 13.8, targetNet: 18.0, masteryRate: 68 },
    { subject: 'LGS Fen Bilimleri', track: 'LGS', averageNet: 16.2, targetNet: 19.0, masteryRate: 79 },
    { subject: 'LGS Türkçe', track: 'LGS', averageNet: 17.5, targetNet: 19.5, masteryRate: 88 },
    { subject: '11. Sınıf AYT Matematik', track: 'YKS', averageNet: 24.2, targetNet: 34.0, masteryRate: 65 },
    { subject: '11. Sınıf Fizik', track: 'YKS', averageNet: 8.9, targetNet: 12.5, masteryRate: 64 },
    { subject: 'TYT Türkçe Genel', track: 'YKS', averageNet: 31.8, targetNet: 36.0, masteryRate: 84 }
  ]
};
