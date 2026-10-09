import React from 'react';
import { DEMO_MANAGEMENT_METRICS } from '../../data/mockData';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Globe2, 
  CreditCard, 
  Target, 
  ArrowUpRight, 
  AlertCircle,
  BarChart,
  PieChart,
  Compass
} from 'lucide-react';

export const ManagementWorkspace: React.FC = () => {
  const metrics = DEMO_MANAGEMENT_METRICS;

  return (
    <div className="space-y-6">
      
      {/* Prominent Demo Data Disclaimer */}
      <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-sm">Simüle Edilmiş İşletme ve Büyüme Metrikleri (Demo Projeksiyonu)</span>
          <p className="mt-0.5 text-amber-900 leading-relaxed">
            Bu panel, Kübik Dershanesi'nin tek bir fiziksel şubeden hibrit ve Türkiye geneli dijital akademi modeline geçişindeki operasyonel ve finansal potansiyelini modellemektedir. 
            Tüm rakamlar fizibilite prototipi amaçlı simüle edilmiştir.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Kübik Yönetim & Ölçeklenme Masası</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">Hibrit Büyüme Modeli</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Kurumsal Performans & Dijital Genişleme Paneli
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Fiziksel sınıf kontenjanı sınırlamasını kaldıran, Türkiye geneli hibrit öğrenci edinimi ve gelir projeksiyonu.
            </p>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Physical + Digital Count */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Toplam Aktif Öğrenci</span>
            <Users className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics.totalStudentsPhysical + metrics.totalStudentsDigital}
          </div>
          <div className="flex items-center gap-2 text-[11px] mt-2 text-slate-600">
            <span>Fiziksel: <strong>{metrics.totalStudentsPhysical}</strong></span>
            <span aria-hidden="true">·</span>
            <span className="text-indigo-900 font-bold">Dijital/Hibrit: {metrics.totalStudentsDigital}</span>
          </div>
        </div>

        {/* MRR Revenue */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Aylık Tekrarlayan Gelir (MRR)</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            ₺{(metrics.monthlyRecurringRevenueTL).toLocaleString('tr-TR')}
          </div>
          <div className="flex items-center gap-1 text-[11px] mt-2 text-emerald-800 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Bu Ay +%{metrics.newEnrollmentsThisMonth} Yeni Kayıt</span>
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Fiziksel Şube Doluluğu</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            %{metrics.hybridCapacityUtilization}
          </div>
          <p className="text-[11px] text-slate-600 mt-2">
            Fiziksel tavan: 500 öğrenci (Genişleme dijitalde devam ediyor)
          </p>
        </div>

        {/* Retention */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Aktif Dijital Bağlılık</span>
            <Globe2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            %{metrics.activeOnlineRetention}
          </div>
          <p className="text-[11px] text-slate-600 mt-2">
            Haftalık ort. {Math.round(metrics.averageWeeklyStudyMinutesPerStudent / 60)} saat platform kullanımı
          </p>
        </div>

      </div>

      {/* Conversion Funnel & Strategic Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Dijital Öğrenci Dönüşüm Hunisi
            </h2>
            <span className="text-xs text-slate-500">Son 30 Gün</span>
          </div>
          <p className="text-xs text-slate-600">
            Açılış sayfasındaki Ücretsiz Seviye Tespiti'nin veli ve öğrenci kayıtlarına dönüşüm performansı
          </p>

          <div className="space-y-3 pt-2">
            {metrics.diagnosticAssessmentFunnel.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{step.stage}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{step.count.toLocaleString('tr-TR')}</span>
                    <span className="text-indigo-700 font-semibold text-[11px]">({step.conversionRate})</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-900 h-full rounded-full"
                    style={{ width: `${Math.max(10, 100 - idx * 18)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-950 mt-4">
            <span className="font-bold">Önemli Çıkarım: </span>
            Ücretsiz Seviye Tespit Sınavını tamamlayan her 3 öğrenciden 1'i velisiyle rehberlik randevusu talep ediyor.
          </div>
        </div>

        {/* Academic Program Performance Across Tracks */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              LGS ve YKS Branş Net Ortalamaları
            </h2>
            <span className="text-xs text-slate-500">Akademi Genel Ortalaması</span>
          </div>
          <p className="text-xs text-slate-600">
            Dershane geneli öğrencilerin güncel netleri ve hedeflenen net seviyeleri
          </p>

          <div className="space-y-3 pt-2">
            {metrics.subjectAverages.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{item.subject}</span>
                  <span className="text-indigo-900 font-bold">
                    {item.averageNet} / {item.targetNet} Net
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div 
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${(item.averageNet / item.targetNet) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Parkur: {item.track}</span>
                  <span>Kazanım Yeterliliği: %{item.masteryRate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Strategic Growth Vision: Physical vs. Hybrid Expansion */}
      <div className="bg-slate-900 text-white rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          <span>Kübik Büyüme Stratejisi: Tek Şubeden Ulusal Hibrit Ağa</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-amber-400 font-bold block mb-1">1. Aşama: Fiziksel + Dijital Eşzamanlı</span>
            <p className="leading-relaxed">
              Mevcut dershane öğrencilerine Kübik Öğrenme Döngüsü ve zayıf konu telafisi dijitalden sunulur. Veli memnuniyeti ve net artışı kanıtlanır.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-amber-400 font-bold block mb-1">2. Aşama: Şehir Çapında Hibrit Paket</span>
            <p className="leading-relaxed">
              Haftada 1 gün yüz yüze deneme sınavı + haftanın 6 günü dijital yapay zeka akademisi paketiyle sınıf kapasitesi 3 katına çıkarılır.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-amber-400 font-bold block mb-1">3. Aşama: Türkiye Geneli Saf Dijital</span>
            <p className="leading-relaxed">
              Kübik yayınları ve dijital yapay zeka rehberliği tüm Türkiye'deki LGS ve YKS öğrencilerine ölçeklenir, marjinal maliyet sıfıra yaklaşır.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
