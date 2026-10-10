import React, { useState } from 'react';
import { EducationalTrack } from '../../types';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck, 
  TrendingUp, 
  Target, 
  Users, 
  BookOpen, 
  Layers, 
  ChevronRight,
  Brain,
  Lightbulb,
  Building,
  GraduationCap
} from 'lucide-react';

interface LandingPageProps {
  onOpenAssessment: () => void;
  onExploreRole: (role: 'student' | 'teacher' | 'parent' | 'management') => void;
  onSelectTrack: (track: EducationalTrack) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAssessment,
  onExploreRole,
  onSelectTrack
}) => {
  const [selectedTrackTab, setSelectedTrackTab] = useState<EducationalTrack>('LGS');

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Col: Hero Copy */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-indigo-700"></span>
                <span>Kübik Dershanesi Eğitim Teknolojileri</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Kübik Dershanesi için <span className="text-indigo-900">Akıllı Dijital Öğrenme Platformu</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Kübik Dershanesi'nin eğitim çalışmalarını dijital ortamda desteklemek için tasarlanan bir platform prototipi. Öğrenciye özel çalışma planı, konu takibi ve rehberli soru çözümünü bir araya getirir. İlk örnekler LGS ve 11. sınıf düzeyindedir; platformun kapsamı bu iki sınıfla sınırlı değildir.
              </p>

              {/* Conversion Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onOpenAssessment}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-lg text-sm transition-all shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Ücretsiz Seviye Tespit Sınavı (3 Dk)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onExploreRole('student')}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-lg text-sm transition-colors border border-slate-200"
                >
                  <span>Öğrenci Panelini Deneyimle</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Kişiselleştirilmiş Günlük Plan</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>MEB & ÖSYM Müfredat Uyumu</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Öğretmen Onaylı Pedagojik Döngü</span>
                </div>
              </div>

            </div>

            {/* Right Col: High-Fidelity Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                    <span className="font-semibold text-slate-200">Kübik Canlı Teşhis Ekranı</span>
                  </div>
                  <span className="text-amber-400 font-mono text-[11px]">DÖNGÜ: AKTİF</span>
                </div>

                <div className="py-4 space-y-3">
                  <div className="text-xs text-slate-400 uppercase tracking-wider">Tespit Edilen Sınav Hatası:</div>
                  <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700 text-xs">
                    <p className="font-medium text-slate-200">
                      "(-3)⁻² ifadesinde üs çift olduğu için sonuç negatife değil pozitife dönüşür (+1/9)."
                    </p>
                    <span className="text-[10px] text-amber-400 mt-1 block">
                      Kazanım Açığı: 8. Sınıf Matematik · Negatif Üsler
                    </span>
                  </div>

                  <div className="p-3 bg-indigo-950/60 rounded-lg border border-indigo-800/80 text-xs">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">
                      Pedagojik Çözüm Adımı:
                    </span>
                    <p className="text-slate-300">
                      3 adımlı iskeletli ipucu (scaffolding) ve benzer yeni nesil MEB sorusuyla anında doğrulama.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Öğrenci Kazanım Artışı:</span>
                    <span className="font-bold text-emerald-400 font-mono">+22 Puan Net Telafisi</span>
                  </div>
                </div>

                <button
                  onClick={onOpenAssessment}
                  className="w-full mt-2 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors text-center"
                >
                  Kendi Seviyenizi Şimdi Test Edin →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TRACK SHOWCASE: LGS & YKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block mb-1">
            Hedefe Özel Hazırlık Parkurları
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Farklı Sınıf Düzeylerine Uyum Sağlayan Öğrenme Deneyimi
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Platform, ortaokul ve lise düzeylerinde farklı ders ve kazanımlara uyarlanabilecek şekilde tasarlanıyor. Aşağıdaki iki kart, kapsamın tamamını değil, prototipte gösterilen örnek öğrenci deneyimlerini anlatır.
          </p>

          {/* Track Switcher Tabs */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 mt-6 text-xs font-bold">
            <button
              onClick={() => setSelectedTrackTab('LGS')}
              className={`px-6 py-2.5 rounded-lg transition-all ${
                selectedTrackTab === 'LGS'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              8. Sınıf · LGS Hazırlık Parkuru
            </button>
            <button
              onClick={() => setSelectedTrackTab('YKS')}
              className={`px-6 py-2.5 rounded-lg transition-all ${
                selectedTrackTab === 'YKS'
                  ? 'bg-white text-indigo-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              11. Sınıf · YKS (TYT / AYT) Parkuru
            </button>
          </div>
        </div>

        {/* Selected Track Deep-Dive Card */}
        {selectedTrackTab === 'LGS' ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Ortaokul · LGS Örneği</span>
                <h3 className="text-xl font-bold text-slate-900">
                  Fen Liseleri ve Nitelikli Anadolu Liseleri Hedefi
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  LGS'de belirleyici olan "Yeni Nesil Mantık & Muhakeme" sorularıdır. Kübik, öğrencinin sadece formül ezberlemesini değil, uzun metinleri hızlı anlama ve grafik modelleme becerisini geliştirir.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onSelectTrack('LGS');
                      onExploreRole('student');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-900 hover:text-indigo-700"
                  >
                    <span>LGS Demo Öğrenci Paneli (Kerem) →</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Kapsanan Branşlar</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Matematik (20 Soru)</span>
                    <span className="text-slate-500">Üslü, Köklü, Doğrusal Denklemler</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Fen Bilimleri (20 Soru)</span>
                    <span className="text-slate-500">Mevsimler, Basınç, Genetik Kod</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Türkçe & Sözel Mantık (20 Soru)</span>
                    <span className="text-slate-500">Paragraf Ritim, Fiilimsiler</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Sosyal & Yabancı Dil</span>
                    <span className="text-slate-500">İnkılap Tarihi, İngilizce, Din K.</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-3 text-xs">
                <h4 className="font-bold text-indigo-950">LGS Başarı Metrikleri</h4>
                <p className="text-indigo-900">
                  Bu bölüm örnek bir öğrenci ekranını gösterir. Gerçek öğrenci başarı ortalamaları ve net artışları, yeterli kurum verisi toplandıktan sonra ayrıca raporlanmalıdır.
                </p>
                <div className="pt-2 border-t border-indigo-200/60">
                  <span className="font-semibold text-indigo-900 block mb-1">Örnek Öğrenci:</span>
                  <span className="text-slate-700">Kerem Demir (Kabataş Erkek Lisesi Hedefli)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Lise · YKS Örneği</span>
                <h3 className="text-xl font-bold text-slate-900">
                  11. Sınıfta Temel Atarak İlk 5.000 Sıralaması
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  12. sınıfta panik yaşamamak için 11. sınıf AYT konularının (Mekanik, Fonksiyonlar, Trigonometri) tam olarak halledilmesi gerekir. Kübik, TYT temposunu korurken 11. sınıf AYT temelini zirveye taşır.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onSelectTrack('YKS');
                      onExploreRole('student');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-900 hover:text-indigo-700"
                  >
                    <span>YKS Demo Öğrenci Paneli (Selin) →</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Kapsanan Branşlar</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">11. Sınıf AYT Matematik</span>
                    <span className="text-slate-500">Fonksiyon Simetrileri, Parabol</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">11. Sınıf AYT Fizik</span>
                    <span className="text-slate-500">Vektörler, Bağıl Hareket, İvme</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">11. Sınıf Kimya & Biyoloji</span>
                    <span className="text-slate-500">Gazlar, Sıvı Çözeltiler, Sistemler</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span className="font-semibold text-slate-900">TYT Türkçe & Temel Mat</span>
                    <span className="text-slate-500">Paragraf Hız Rutini, Temel Kavramlar</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-3 text-xs">
                <h4 className="font-bold text-indigo-950">YKS Başarı Metrikleri</h4>
                <p className="text-indigo-900">
                  Bu kart, 11. sınıf öğrencisi için örnek bir çalışma alanını gösterir; burada yer alan hedefler ve sonuçlar gerçek kurum ortalaması değildir.
                </p>
                <div className="pt-2 border-t border-indigo-200/60">
                  <span className="font-semibold text-indigo-900 block mb-1">Örnek Öğrenci:</span>
                  <span className="text-slate-700">Selin Yılmaz (ODTÜ Bilgisayar Mühendisliği Hedefli)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SIGNATURE FEATURE: KÜBİK LEARNING LOOP EXPLAINER */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
              İmza Öğrenme Metodolojisi
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Kübik Öğrenme Döngüsü Nedir?
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Öğrenciyi saatlerce rastgele soru çözmeye terk etmek yerine; hatasını kanıtla tespit edip 6 adımda kalıcı öğrenmeye ulaştıran bilimsel pedagojik çember.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
              <div className="text-amber-400 font-bold text-sm">01. Sınav Deliliyle Teşhis</div>
              <h3 className="text-base font-semibold text-white">Objektif Hata Tespiti</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deneme sınavında veya tarama testinde yanlış yapılan sorular taranır; ezber değil gerçek kavram yanılgısı tespit edilir.
              </p>
            </div>

            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
              <div className="text-amber-400 font-bold text-sm">02. Kavramsal Anlatım</div>
              <h3 className="text-base font-semibold text-white">Kritik Kural & Görsel Model</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Konunun özü, formülün mantığı ve MEB/ÖSYM'nin kurguladığı kritik ayrıntı pedagojik dille öğrenciye aktarılır.
              </p>
            </div>

            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
              <div className="text-amber-400 font-bold text-sm">03. Rehberli Çözüm</div>
              <h3 className="text-base font-semibold text-white">İpuçlu İskeletli Öğrenme</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Öğrenci zorlandığında adım adım düşünme ipuçlarını açabilir; çözüm adımları parça parça inşa edilir.
              </p>
            </div>

            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
              <div className="text-amber-400 font-bold text-sm">04. Yeni Pekiştirme Sorusu</div>
              <h3 className="text-base font-semibold text-white">Bağımsız Doğrulama</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                İpucu olmadan aynı kazanımı ölçen yeni bir soru sorulur; öğrencinin gerçekten kavrayıp kavramadığı test edilir.
              </p>
            </div>

            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
              <div className="text-amber-400 font-bold text-sm">05. Kazanım Skoru Güncellemesi</div>
              <h3 className="text-base font-semibold text-white">Algoritmik Yetkinlik Artışı</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Öğrencinin konu yeterlilik skoru somut veriyle güncellenir; delilsiz "başardın" beyanı yapılmaz.
              </p>
            </div>

            <div className="p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-2">
              <div className="text-amber-400 font-bold text-sm">06. Öğretmen & Sonraki Adım</div>
              <h3 className="text-base font-semibold text-white">Zümre Onayı & İleri Seviye</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Danışman öğretmene gelişim raporu iletilir; öğrencinin çalışma planına sıradaki mantık sorusu atanır.
              </p>
            </div>

          </div>

          <div className="text-center mt-10">
            <button
              onClick={onOpenAssessment}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
            >
              <span>Bu Döngüyü Kendi Sınav Sorularınızla Test Edin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION: FOR STUDENTS, PARENTS, TEACHERS, MANAGEMENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 block mb-1">
            Platformda Neler Var?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Öğrenme, Takip ve Rehberlik Aynı Yerde
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div 
            onClick={() => onExploreRole('student')}
            className="p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-900">Öğrenciler İçin</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Zaman kaybetmeden doğrudan net kaybettiği konuya odaklanma, kişiselleştirilmiş günlük tempo ve akıllı soru çözümü.
            </p>
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1 pt-1">
              <span>Öğrenci Paneli</span> →
            </span>
          </div>

          <div 
            onClick={() => onExploreRole('parent')}
            className="p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-900">Veliler İçin</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Karmaşık sınav terimlerinden arındırılmış haftalık şeffaf karne; çocuğunun nerede zorlandığını ve rehberlik notlarını net görme.
            </p>
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1 pt-1">
              <span>Veli Portalı</span> →
            </span>
          </div>

          <div 
            onClick={() => onExploreRole('teacher')}
            className="p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-900">Öğretmenler İçin</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hangi öğrencinin hangi konuda tıkandığını saniyeler içinde görme; yapay zeka önerilerini tek tıkla onaylayıp ödev atama.
            </p>
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1 pt-1">
              <span>Öğretmen Paneli</span> →
            </span>
          </div>

          <div 
            onClick={() => onExploreRole('management')}
            className="p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-900">Yönetim İçin</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              İlerleyen aşamalarda dijital öğrenme deneyimini nasıl geliştirebileceğimizi ve kurumun ihtiyaçlarına göre hangi özelliklerin öncelik taşıdığını değerlendirme.
            </p>
            <span className="text-xs font-bold text-indigo-900 flex items-center gap-1 pt-1">
              <span>Gelişim Yol Haritası</span> →
            </span>
          </div>

        </div>
      </section>

      {/* FINAL CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-indigo-950 text-white rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Kübik ile Sınav Hazırlığını Şansa Bırakmayın
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Hangi konuda eksiğiniz olduğunu 3 dakikalık yapay zeka seviye tespit sınavımızla anında öğrenin. Ücretsiz karne ve çalışma planınız oluşturulsun.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenAssessment}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
            >
              Hemen Ücretsiz Seviye Tespit Sınavını Başlat
            </button>
            <button
              onClick={() => onExploreRole('student')}
              className="px-6 py-3.5 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-lg text-xs transition-colors border border-indigo-700"
            >
              Örnek Öğrenci Panelini İncele
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
