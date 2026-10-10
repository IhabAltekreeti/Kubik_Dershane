import React from 'react';
import { StudentProfile } from '../../types';
import { 
  HeartHandshake, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  MessageSquare, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  PhoneCall,
  Calendar
} from 'lucide-react';

interface ParentWorkspaceProps {
  student: StudentProfile;
 }

export const ParentWorkspace: React.FC<ParentWorkspaceProps> = ({
  student,
 }) => {
  return (
    <div className="space-y-6">
      
      {/* Parent Portal Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Kübik Veli Bilgilendirme Portalı</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">Haftalık Düzenli Rapor</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Sayın {student.parentName}, {student.name}'in Haftalık Gelişim Özeti
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              {student.grade}. Sınıf {student.track} Hazırlık Süreci · Atanmış Rehberlik Danışmanı: {student.assignedAdvisor}
            </p>
          </div>

          <span className="rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600">Örnek veli hesabı · {student.name}</span>
        </div>
      </div>

      {/* Weekly High-Level Metrics (Jargon-free for parents) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Haftalık Ders Çalışma Süresi</span>
            <Clock className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{student.weeklyStudyHours} Saat</div>
          <p className="text-[11px] text-emerald-800 font-medium mt-1">
            {Math.round((student.subjects.reduce((sum, subject) => sum + subject.completedHours, 0) / Math.max(1, student.subjects.reduce((sum, subject) => sum + subject.weeklyGoalHours, 0))) * 100)}% haftalık çalışma hedefi tamamlandı (örnek veri)
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Çözülen Soru Sayısı</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{student.totalQuestionsSolved} Soru</div>
          <p className="text-[11px] text-slate-600 mt-1">
            Genel doğruluk oranı: %{student.overallAccuracyRate}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Çalışma Disiplini & Seri</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{student.studyStreakDays} Gün Kesintisiz</div>
          <p className="text-[11px] text-slate-600 mt-1">
            Her gün belirlenen çalışma saatlerine uyum sağladı
          </p>
        </div>

      </div>

      {/* Main Content: Strengths, Areas for Support, and Advisor Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Col: Anlaşılır Güçlü ve Desteklenen Alanlar */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900">
            Derslerdeki Güncel Durum (Sadeleştirilmiş Rapor)
          </h2>

          {/* Strong Areas */}
          <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Çocuğunuzun En Güçlü Olduğu Konular</span>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              {student.track === 'LGS' 
                ? 'Türkçe paragraf ve muhakeme sorularında (%89 başarı) ile Fen Bilimleri DNA ve Genetik Kod ünitesinde çok yüksek başarı gösteriyor.' 
                : '11. Sınıf Kimya gaz yasaları ve TYT Türkçe paragraf analizinde hedef üniversite seviyesinin üzerinde bir performans sergiliyor.'}
            </p>
          </div>

          {/* Focus Areas */}
          <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200 text-xs space-y-2">
            <div className="font-bold text-amber-950 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Bu Hafta Desteklediğimiz ve Telafi Edilen Konular</span>
            </div>
            <p className="text-amber-900 leading-relaxed">
              {student.track === 'LGS' 
                ? 'Matematik üslü sayılar yeni nesil modelleme sorularında işlem adımlarını hızlandırmak için Kübik Öğrenme Döngüsü seansı tamamlatıldı. Öğretmeni birebir takip ediyor.' 
                : 'Fizik bağıl hareket ve fonksiyon simetrilerinde konu açıklarını kapatmak üzere özel pekiştirme ödevleri tanımlandı.'}
            </p>
          </div>

          {/* Target Score Insight */}
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="font-bold text-slate-900 block mb-1">Hedef Uyumluluğu:</span>
            {student.name}'in {student.targetGoal} hedefi doğrultusunda deneme sınavı netleri planlanan başarı grafiği ile uyumlu ilerlemektedir.
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div><h2 className="text-base font-bold text-slate-900">Derslere Göre Genel Durum</h2><p className="text-xs text-slate-500 mt-1">Örnek rapordaki ders bazlı göstergeler</p></div>
          <div className="overflow-x-auto"><table className="w-full text-xs text-left"><thead className="text-slate-500 border-b border-slate-200"><tr><th className="py-2 pr-3">Ders</th><th className="py-2 pr-3">Kazanım</th><th className="py-2 pr-3">Doğruluk</th><th className="py-2">Haftalık saat</th></tr></thead><tbody>{student.subjects.map(subject => <tr key={subject.id} className="border-b border-slate-100 last:border-0"><td className="py-3 pr-3 font-semibold text-slate-800">{subject.name}</td><td className="py-3 pr-3">%{subject.averageMastery}</td><td className="py-3 pr-3">{subject.topics.length ? Math.round(subject.topics.reduce((sum, topic) => sum + topic.accuracyRate, 0) / subject.topics.length) : 0}%</td><td className="py-3">{subject.completedHours} / {subject.weeklyGoalHours} sa</td></tr>)}</tbody></table></div>
        </div>

        {/* Right Col: Teacher & Advisor Feedback + Home Guidance */}
        <div className="space-y-6">
          
          {/* Rehberlik & Öğretmen Notu */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-700" />
              <h2 className="text-base font-bold text-slate-900">
                Rehberlik Danışmanı ve Zümre Notu
              </h2>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span className="font-semibold text-indigo-900">{student.assignedAdvisor}</span>
                <span>Bu Hafta</span>
              </div>
              <p className="leading-relaxed">
                {student.track === 'LGS' ? "Kerem'in örnek raporunda Matematikte üslü ifadeler, Fen Bilimlerinde ise mevsimler ve iklim konuları öncelikli görünüyor. Bu hafta kısa ve düzenli tekrarlarla ilerlemesini desteklemenizi öneriyoruz." : "Selin'in örnek raporunda fonksiyon dönüşümleri ve bağıl hareket konuları öncelikli görünüyor. Çalışma planını sürdürülebilir tutması ve zorlandığı sorularda çözüm adımlarını açıklaması üzerinde duruluyor."}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => alert('Danışman öğretmen aranma talebiniz sisteme iletildi. En kısa sürede sizinle iletişime geçilecektir.')}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-semibold rounded text-xs border border-indigo-200 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Rehberlik Öğretmeniyle Birebir Görüşme Randevusu Talep Et</span>
              </button>
            </div>
          </div>

          {/* Evde Destek Rehberi */}
          <div className="bg-indigo-900 text-white rounded-xl p-6 space-y-3">
            <h2 className="text-sm font-bold flex items-center gap-2 text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>Evde Nasıl Destek Olabilirsiniz?</span>
            </h2>
            <ul className="space-y-2 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{student.track === 'LGS' ? 'Bu hafta Matematikte üslü ifadeler ve Fen Bilimlerinde mevsimler konusundaki ilerlemeyi sorun.' : 'Bu hafta Fonksiyon dönüşümleri ve Bağıl Hareket konularındaki ilerlemeyi sorun.'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Çalışma planında tamamlanan görevleri ve haftalık hedefe kalan süreyi birlikte gözden geçirin.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>Sınav haftalarında uyku ve dinlenme düzenine hassasiyet gösterin.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
