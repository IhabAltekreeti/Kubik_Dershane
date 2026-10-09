import { EducationalTrack } from '../types';

export interface DiagnosticQuestion {
  id: string;
  track: EducationalTrack;
  subject: string;
  topic: string;
  difficulty: 'Temel' | 'Orta' | 'İleri';
  question: string;
  codeSnippetOrContext?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    misconceptionFeedback?: string;
  }[];
}

export const DIAGNOSTIC_QUESTIONS: Record<EducationalTrack, DiagnosticQuestion[]> = {
  LGS: [
    {
      id: 'lgs_diag_1',
      track: 'LGS',
      subject: 'Matematik',
      topic: 'Üslü İfadeler',
      difficulty: 'Orta',
      question: 'a = (-2)³ ve b = -3² olduğuna göre, (a - b)⁻¹ ifadesinin değeri kaçtır?',
      options: [
        { id: 'a', text: '1', isCorrect: true },
        { id: 'b', text: '-1', isCorrect: false, misconceptionFeedback: '(-2)³ = -8 ve -3² = -9 olduğunu gözden kaçırdınız.' },
        { id: 'c', text: '1/17', isCorrect: false, misconceptionFeedback: 'İşaret toplamında çıkarma ve negatiflik kuralları karıştı.' },
        { id: 'd', text: '-1/17', isCorrect: false, misconceptionFeedback: 'Eksi parantez açılımına dikkat ediniz: -8 - (-9) = +1.' }
      ]
    },
    {
      id: 'lgs_diag_2',
      track: 'LGS',
      subject: 'Fen Bilimleri',
      topic: 'Mevsimler ve İklim',
      difficulty: 'Orta',
      question: '21 Haziran tarihinde Kuzey Yarımküre\'de bulunan bir gözlemci öğle vaktinde dik bir çubuğun gölgesini ölçüyor. Bu tarihten sonra güneye doğru seyahat ederse:',
      options: [
        { id: 'a', text: 'Öğle vakti gölge boyu uzar.', isCorrect: false, misconceptionFeedback: '21 Haziran\'da Yengeç Dönencesi\'ne (güneye) yaklaştıkça ışınlar daha dik gelir, gölge kısalır.' },
        { id: 'b', text: 'Güneş ışınlarının gelme açısı dikleşir ve gölge boyu kısalır.', isCorrect: true },
        { id: 'c', text: 'Gece süresi gündüz süresinden daha uzun olur.', isCorrect: false, misconceptionFeedback: '21 Haziran\'da Kuzey Yarımküre\'de her yerde gündüzler gecelerden uzundur.' },
        { id: 'd', text: 'Birim alana düşen ısı enerjisi miktarı azalır.', isCorrect: false, misconceptionFeedback: 'Güneş dikleştikçe birim alana düşen enerji artar.' }
      ]
    },
    {
      id: 'lgs_diag_3',
      track: 'LGS',
      subject: 'Türkçe',
      topic: 'Sözel Mantık & Muhakeme',
      difficulty: 'İleri',
      question: 'Bir kütüphanede Ali, Burak, Ceren ve Deniz adlı dört öğrenci yan yana masalarda oturmaktadır. Burak ve Ceren yan yana oturmamaktadır. Ali en sağdaki masadadır. Deniz, Burak\'ın hemen solundadır. Buna göre soldan ikinci masada kim oturmaktadır?',
      options: [
        { id: 'a', text: 'Ceren', isCorrect: false, misconceptionFeedback: 'Ceren en solda yer almak zorundadır: [Ceren] [Deniz] [Burak] [Ali].' },
        { id: 'b', text: 'Deniz', isCorrect: true },
        { id: 'c', text: 'Burak', isCorrect: false, misconceptionFeedback: 'Burak soldan üçüncü masada oturur.' },
        { id: 'd', text: 'Ali', isCorrect: false, misconceptionFeedback: 'Ali en sağdaki 4. masadadır.' }
      ]
    }
  ],
  YKS: [
    {
      id: 'yks_diag_1',
      track: 'YKS',
      subject: '11. Sınıf Matematik',
      topic: 'Fonksiyon Simetrileri & Öteleme',
      difficulty: 'Orta',
      question: 'Gerçel sayılarda tanımlı f(x) = x² - 4x + 7 parabolü veriliyor. g(x) = f(x + 2) - 3 fonksiyonunun tepe noktasının koordinatları toplamı kaçtır?',
      options: [
        { id: 'a', text: '0', isCorrect: true },
        { id: 'b', text: '2', isCorrect: false, misconceptionFeedback: 'f(x) tepe noktası (2, 3)\'tür. 2 birim sola kayınca x=0, 3 birim aşağı inince y=0 olur.' },
        { id: 'c', text: '4', isCorrect: false, misconceptionFeedback: 'Öteleme yönünü ters aldınız: f(x+2) sola kaydırır, sağa değil.' },
        { id: 'd', text: '-2', isCorrect: false, misconceptionFeedback: 'İşaret toplamlarını kontrol ediniz.' }
      ]
    },
    {
      id: 'yks_diag_2',
      track: 'YKS',
      subject: '11. Sınıf Fizik',
      topic: 'Vektörler ve Bağıl Hareket',
      difficulty: 'Orta',
      question: 'Genişliği d olan ve akıntı hızı v_a olan bir nehirde, suya göre hızı v_y olan bir yüzücü akıntıya dik doğrultuda karşı kıyıya doğru yüzmektedir. Akıntı hızı 2 katına çıkarılırsa karşı kıyıya varış süresi (t) ve karşı kıyıdaki sürüklenme mesafesi (x) nasıl değişir?',
      options: [
        { id: 'a', text: 't değişmez, x 2 katına çıkar.', isCorrect: true },
        { id: 'b', text: 't yarıya iner, x değişmez.', isCorrect: false, misconceptionFeedback: 'Karşı kıyıya varış süresi sadece nehre dik düşey hız bileşeni ile ilgilidir, akıntı süreyi etkilemez.' },
        { id: 'c', text: 't 2 katına çıkar, x 2 katına çıkar.', isCorrect: false, misconceptionFeedback: 'Akıntı hızı düşey yolu ve düşey hızı değiştirmez.' },
        { id: 'd', text: 'Her ikisi de değişmez.', isCorrect: false, misconceptionFeedback: 'Sürüklenme mesafesi x = v_a * t formülüyle hesaplandığından akıntı artarsa x artar.' }
      ]
    },
    {
      id: 'yks_diag_3',
      track: 'YKS',
      subject: 'TYT Türkçe',
      topic: 'Paragrafta Anlam',
      difficulty: 'Orta',
      question: '"Bilim insanı, bulgularını sunarken estetik bir kaygı gütmez; onun tek pusulası hakikatin çıplak mantığıdır. Ancak sanatçı, hakikati kendi süzgecinden geçirerek ona bir biçim ve ruh giydirir." Bu parçadan çıkarılabilecek en kapsamlı yargı aşağıdakilerden hangisidir?',
      options: [
        { id: 'a', text: 'Bilim nesnel gerçekliği aktarırken sanat ona öznel bir yorum ve biçim katar.', isCorrect: true },
        { id: 'b', text: 'Sanatçılar bilimsel gerçeklere kayıtsız kalmaktadır.', isCorrect: false, misconceptionFeedback: 'Metinde kayıtsız kalındığı ifade edilmemektedir.' },
        { id: 'c', text: 'Bilimsel metinlerin anlaşılması sanatsal metinlerden daha güçtür.', isCorrect: false, misconceptionFeedback: 'Metinde metinlerin anlaşılma güçlüğü kıyaslanmamıştır.' },
        { id: 'd', text: 'Estetik kaygı bilimin ilerlemesini engelleyen bir unsurdur.', isCorrect: false, misconceptionFeedback: 'Böyle bir engel belirtilmemiştir.' }
      ]
    }
  ]
};
