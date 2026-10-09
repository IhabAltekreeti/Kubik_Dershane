import React, { useState } from 'react';
import { EducationalTrack, TeacherIntervention, StudentProfile } from '../../types';
import { DEMO_TEACHER_INTERVENTIONS, DEMO_STUDENT_A_LGS, DEMO_STUDENT_B_YKS } from '../../data/mockData';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  BookOpen, 
  MessageSquare, 
  Search,
  Filter,
  Check,
  X,
  FileText,
  UserCheck
} from 'lucide-react';

interface TeacherWorkspaceProps {
  onSelectStudentProfile: (student: StudentProfile) => void;
}

export const TeacherWorkspace: React.FC<TeacherWorkspaceProps> = ({
  onSelectStudentProfile
}) => {
  const [selectedClass, setSelectedClass] = useState<'8-A' | '11-SAY'>('8-A');
  const [interventions, setInterventions] = useState<TeacherIntervention[]>(DEMO_TEACHER_INTERVENTIONS);
  const [activeTab, setActiveTab] = useState<'interventions' | 'class_overview' | 'weakness_matrix'>('interventions');
  const [selectedIntervention, setSelectedIntervention] = useState<TeacherIntervention | null>(null);
  const [teacherNoteInput, setTeacherNoteInput] = useState('');

  // Handle teacher intervention actions
  const handleApprove = (id: string) => {
    setInterventions(prev => prev.map(item => 
      item.id === id 
        ? { ...item, teacherStatus: 'approved', teacherNote: item.teacherNote || 'Öğretmen tarafından incelendi ve onaylandı.' } 
        : item
    ));
    if (selectedIntervention?.id === id) {
      setSelectedIntervention(prev => prev ? { ...prev, teacherStatus: 'approved' } : null);
    }
  };

  const handleDismiss = (id: string) => {
    setInterventions(prev => prev.map(item => 
      item.id === id ? { ...item, teacherStatus: 'dismissed' } : item
    ));
    if (selectedIntervention?.id === id) {
      setSelectedIntervention(prev => prev ? { ...prev, teacherStatus: 'dismissed' } : null);
    }
  };

  const handleSaveCustomNote = (id: string) => {
    if (!teacherNoteInput.trim()) return;
    setInterventions(prev => prev.map(item => 
      item.id === id ? { ...item, teacherNote: teacherNoteInput, teacherStatus: 'modified' } : item
    ));
    setTeacherNoteInput('');
  };

  const pendingCount = interventions.filter(i => i.teacherStatus === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Workspace Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Kübik Zümre ve Rehberlik Paneli</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">2026-2027 Eğitim Öğretim Yılı</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Öğretmen Müdahale ve Kazanım İzleme Masası
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Yapay zeka analitiği tarafından taranan öğrenci açıkları öğretmen incelemesine sunulur. Onaylanmayan öneriler öğrenciye atanmaz.
            </p>
          </div>

          {/* Class Filter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Aktif Şube:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setSelectedClass('8-A')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedClass === '8-A' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                8-A Şubesi (LGS)
              </button>
              <button
                onClick={() => setSelectedClass('11-SAY')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedClass === '11-SAY' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                11-Sayısal Şubesi (YKS)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('interventions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'interventions' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Öğretmen İncelemesi Bekleyen Müdahaleler</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('class_overview')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'class_overview' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Şube Öğrenci Listesi & Karneler
        </button>
        <button
          onClick={() => setActiveTab('weakness_matrix')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === 'weakness_matrix' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Kazanım Açık Matrisi (Zümre Raporu)
        </button>
      </div>

      {/* TAB 1: INTERVENTIONS FOR TEACHER REVIEW */}
      {activeTab === 'interventions' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-950 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Pedagojik Güvenlik İlkesi: </span>
              Kübik Yapay Zeka Pedagogu yalnızca sistemdeki deneme sınavı hatalarını ve soru çözme verilerini analiz ederek öneri üretir. 
              Öğretmen veya zümre başkanı onaylamadan hiçbir telafi seansı öğrencinin zorunlu planına eklenmez.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {interventions.map(item => {
              const isPending = item.teacherStatus === 'pending';
              const isApproved = item.teacherStatus === 'approved';
              const isModified = item.teacherStatus === 'modified';
              const isDismissed = item.teacherStatus === 'dismissed';

              return (
                <div 
                  key={item.id}
                  className={`bg-white rounded-xl border p-5 transition-all ${
                    isPending ? 'border-amber-300 shadow-xs' : 'border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-sm">{item.studentName}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="font-semibold text-indigo-700 text-xs">{item.subject}</span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-slate-500 text-xs">{item.topicName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Tetikleyici: {item.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-sm ${
                        isPending 
                          ? 'bg-amber-100 text-amber-900' 
                          : isApproved 
                          ? 'bg-emerald-100 text-emerald-900' 
                          : isModified
                          ? 'bg-blue-100 text-blue-900'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isPending ? 'Öğretmen Onayı Bekliyor' : isApproved ? 'Onaylandı & Atandı' : isModified ? 'Öğretmen Tarafından Düzenlendi' : 'Reddedildi'}
                      </span>
                    </div>
                  </div>

                  {/* Two distinct columns: Observed Evidence vs AI Suggested Action */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 text-xs">
                    
                    {/* Column 1: Observed Data (Real Evidence) */}
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1 uppercase text-[10px] tracking-wider">
                        1. Gözlemlenen Sınav Delili (Objektif Veri)
                      </span>
                      <p className="text-slate-800 leading-relaxed">
                        {item.observedEvidence}
                      </p>
                    </div>

                    {/* Column 2: AI Generated Suggestion */}
                    <div className="p-3.5 rounded-lg bg-indigo-50/70 border border-indigo-200">
                      <span className="font-bold text-indigo-900 block mb-1 uppercase text-[10px] tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                        <span>2. Yapay Zeka Pedagojik Önerisi</span>
                      </span>
                      <p className="text-indigo-950 leading-relaxed">
                        {item.aiSuggestedAction}
                      </p>
                      {item.assignedPracticeTitle && (
                        <div className="mt-2 text-[11px] font-semibold text-indigo-800 bg-white/80 p-1.5 rounded border border-indigo-100">
                          Önerilen Görev: {item.assignedPracticeTitle}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Teacher's Note if exists */}
                  {item.teacherNote && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 mb-3">
                      <span className="font-bold">Öğretmen Zümre Notu: </span>
                      {item.teacherNote}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div className="text-slate-500">
                      {isPending ? 'Bu öneriyi onaylayarak öğrencinin günlük planına atayabilirsiniz.' : 'İşlem tamamlandı.'}
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDismiss(item.id)}
                          className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-colors"
                        >
                          Reddet
                        </button>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Onayla & Öğrenciye Gönder</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-500">
                        Durum: Kaydedildi
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CLASS OVERVIEW & STUDENT CARDS */}
      {activeTab === 'class_overview' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {selectedClass === '8-A' ? '8-A LGS Hazırlık Sınıf Listesi' : '11-Sayısal-1 YKS Hazırlık Sınıf Listesi'}
              </h2>
              <p className="text-xs text-slate-500">
                Şube genelinde net durumları, kazanım açıkları ve son deneme sıralamaları
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Student 1 Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={DEMO_STUDENT_A_LGS.avatarUrl} 
                    alt={DEMO_STUDENT_A_LGS.name} 
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{DEMO_STUDENT_A_LGS.name}</h3>
                    <p className="text-xs text-slate-500">8. Sınıf LGS · Veli: {DEMO_STUDENT_A_LGS.parentName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-900 block">{DEMO_STUDENT_A_LGS.recentExams[0]?.net} Net</span>
                  <span className="text-[11px] text-slate-500">Son Deneme</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Hedef:</span>
                  <span className="font-semibold text-slate-900">{DEMO_STUDENT_A_LGS.targetGoal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Müdahale Bekleyen Konu:</span>
                  <span className="font-bold text-amber-700">Matematik: Üslü İfadeler</span>
                </div>
              </div>

              <button
                onClick={() => onSelectStudentProfile(DEMO_STUDENT_A_LGS)}
                className="w-full py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded text-xs transition-colors"
              >
                Kerem'in Detaylı Öğrenci Karnesini İncele →
              </button>
            </div>

            {/* Student 2 Card */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={DEMO_STUDENT_B_YKS.avatarUrl} 
                    alt={DEMO_STUDENT_B_YKS.name} 
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{DEMO_STUDENT_B_YKS.name}</h3>
                    <p className="text-xs text-slate-500">11. Sınıf YKS · Veli: {DEMO_STUDENT_B_YKS.parentName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-900 block">{DEMO_STUDENT_B_YKS.recentExams[0]?.net} Net</span>
                  <span className="text-[11px] text-slate-500">Son AYT Deneme</span>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Hedef:</span>
                  <span className="font-semibold text-slate-900">{DEMO_STUDENT_B_YKS.targetGoal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Müdahale Bekleyen Konu:</span>
                  <span className="font-bold text-amber-700">Fizik: Bağıl Hareket</span>
                </div>
              </div>

              <button
                onClick={() => onSelectStudentProfile(DEMO_STUDENT_B_YKS)}
                className="w-full py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded text-xs transition-colors"
              >
                Selin'in Detaylı Öğrenci Karnesini İncele →
              </button>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: WEAKNESS MATRIX */}
      {activeTab === 'weakness_matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Şube Genelinde Kazanım Açık Dağılımı</h2>
          <p className="text-xs text-slate-500">
            Son 3 kurumsal deneme verisi ışığında şubenin en çok soru kaçırdığı ilk 5 konu
          </p>

          <div className="space-y-3">
            {[
              { topic: '8. Sınıf Matematik: Üslü İfadeler ve Bilimsel Gösterim', errorRate: 42, affectedStudents: 14, action: 'Zümre ortak soru çözüm saati planlandı' },
              { topic: '8. Sınıf Fen: Katı ve Sıvı Basıncı Hesaplamaları', errorRate: 36, affectedStudents: 11, action: 'Laboratuvar simülasyon testi atandı' },
              { topic: '11. Sınıf Matematik: Fonksiyon Grafiğinde Öteleme & Simetri', errorRate: 45, affectedStudents: 16, action: 'Kübik Öğrenme Döngüsü modülü zorunlu kılındı' },
              { topic: '11. Sınıf Fizik: İki Boyutta Sabit İvmeli Hareket (Atışlar)', errorRate: 38, affectedStudents: 12, action: 'Hafta sonu etüt programına alındı' }
            ].map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{item.topic}</span>
                  <span className="text-slate-500 text-[11px]">Şubede {item.affectedStudents} öğrencide eksik tespit edildi</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-rose-600 font-bold block">%{item.errorRate} Hata Oranı</span>
                    <span className="text-[10px] text-slate-500">Deneme Ortalaması</span>
                  </div>
                  <span className="text-[11px] font-medium text-indigo-900 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                    {item.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
