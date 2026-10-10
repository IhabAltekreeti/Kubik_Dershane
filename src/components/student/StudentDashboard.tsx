import React, { useState, useEffect } from 'react';
import { StudentProfile, DailyTask, TopicProgress } from '../../types';
import { LEARNING_LOOP_SESSIONS } from '../../data/learningLoopEngine';
import { LearningLoopModal } from './LearningLoopModal';
import { GeminiMathTutor } from './GeminiMathTutor';
import { 
  Target, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Play, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  BookOpen, 
  BarChart3, 
  Calendar,
  Layers,
  ChevronRight,
  BrainCircuit
} from 'lucide-react';

interface StudentDashboardProps {
  student: StudentProfile;
  onOpenAssessmentModal: () => void;
  onSwitchStudent: (track: 'LGS' | 'YKS') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  onOpenAssessmentModal,
  onSwitchStudent
}) => {
  const [tasks, setTasks] = useState<DailyTask[]>(student.dailyTasks);
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'exams' | 'tutor'>('overview');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(student.subjects[0]?.id || '');
  const [activeLearningLoopId, setActiveLearningLoopId] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [subjectList, setSubjectList] = useState(student.subjects);

  // Synchronize student-specific state when student changes
  useEffect(() => {
    let savedTasks: DailyTask[] | null = null;
    try { savedTasks = JSON.parse(window.localStorage.getItem(`kubik:tasks:${student.id}`) || 'null'); } catch { savedTasks = null; }
    setTasks(Array.isArray(savedTasks) ? savedTasks : student.dailyTasks);
    let savedMastery: Record<string, number> = {};
    try { savedMastery = JSON.parse(window.localStorage.getItem(`kubik:mastery:${student.id}`) || '{}'); } catch { savedMastery = {}; }
    setSubjectList(student.subjects.map(subject => ({ ...subject, topics: subject.topics.map(topic => savedMastery[topic.id] === undefined ? topic : { ...topic, masteryLevel: savedMastery[topic.id], status: savedMastery[topic.id] >= 85 ? ('mastered' as const) : ('in_progress' as const) }) })));
    setSelectedSubjectId(student.subjects[0]?.id || '');
    setActiveLearningLoopId(null);
    setActiveTaskId(null);
  }, [student.id, student.track]);

  // Open a learning loop only when its content matches the selected topic.
  // Topics without a dedicated loop fall back to their own task preview instead
  // of accidentally opening the LGS/YKS loop for a different topic.
  const handleLaunchLoop = (topicId: string) => {
    const matchingSession = Object.entries(LEARNING_LOOP_SESSIONS).find(([sessionId, session]) =>
      session.track === student.track && (topicId === 'default' ? true : session.topicId === topicId)
    );

    if (matchingSession) {
      setActiveTaskId(null);
      setActiveLearningLoopId(matchingSession[0]);
      return;
    }

    const matchingTask = tasks.find(task => task.track === student.track && task.topicId === topicId);
    setActiveLearningLoopId(null);
    setActiveTaskId(matchingTask?.id ?? null);
  };

  // Callback after completing loop
  const handleMasteryUpdated = (topicId: string, newScore: number) => {
    setSubjectList(prev => prev.map(sub => ({ ...sub, topics: sub.topics.map(top => top.id === topicId ? { ...top, masteryLevel: newScore, status: newScore >= 85 ? 'mastered' : 'in_progress' } : top) })));
    try { const saved = JSON.parse(window.localStorage.getItem(`kubik:mastery:${student.id}`) || '{}'); window.localStorage.setItem(`kubik:mastery:${student.id}`, JSON.stringify({ ...saved, [topicId]: newScore })); } catch (error) { console.warn('Demo mastery progress could not be saved locally.', error); }
  };

  const activeLoopBase = activeLearningLoopId ? LEARNING_LOOP_SESSIONS[activeLearningLoopId] : null;
  const activeLoopCurrentMastery = activeLoopBase ? subjectList.flatMap(subject => subject.topics).find(topic => topic.id === activeLoopBase.topicId)?.masteryLevel ?? activeLoopBase.masteryUpdate.previousMastery : 0;
  const activeLoopNextMastery = Math.min(100, activeLoopCurrentMastery + 8);
  const activeLoopSession = activeLoopBase ? { ...activeLoopBase, masteryUpdate: { previousMastery: activeLoopCurrentMastery, newMastery: activeLoopNextMastery, delta: activeLoopNextMastery - activeLoopCurrentMastery, auditLog: `Demo seansı tamamlandı. Başlangıç seviyesi %${activeLoopCurrentMastery}; doğrulama sorusu doğru yanıtlandığı için seviye %${activeLoopNextMastery} olarak güncellendi. Bu örnek ilerleme bu tarayıcıda öğrenciye özel saklanır.` } } : null;
  const currentSubject = subjectList.find(s => s.id === selectedSubjectId) || subjectList[0];
  const completedTaskCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Student Profile & Goal Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Profile information */}
          <div className="flex items-start sm:items-center gap-4">
            <img 
              src={student.avatarUrl} 
              alt={student.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-100 shadow-xs shrink-0" 
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {student.name}
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-800 border border-indigo-100">
                  {student.grade}. Sınıf {student.track} Hazırlık
                </span>
                <span className="text-xs text-slate-600">
                  Danışman: {student.assignedAdvisor}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1.5">
                <div className="flex items-center gap-1 text-indigo-900 font-semibold">
                  <Target className="w-3.5 h-3.5 text-indigo-700" />
                  <span>{student.targetGoal}</span>
                </div>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="text-slate-600">{student.currentScoreEstimate}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
            <div className="px-2">
              <span className="text-slate-600 block text-[11px]">Genel Kazanım</span>
              <span className="text-base font-bold text-slate-900">%{student.overallMastery}</span>
            </div>
            <div className="px-2">
              <span className="text-slate-600 block text-[11px]">Çalışma Serisi</span>
              <span className="text-base font-bold text-amber-700 flex items-center gap-1">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                {student.studyStreakDays} Gün
              </span>
            </div>
            <div className="px-2">
              <span className="text-slate-600 block text-[11px]">Haftalık Süre</span>
              <span className="text-base font-bold text-slate-900">{student.weeklyStudyHours} Saat</span>
            </div>
            <div className="px-2">
              <span className="text-slate-600 block text-[11px]">Çözülen Soru</span>
              <span className="text-base font-bold text-slate-900">{student.totalQuestionsSolved}</span>
            </div>
          </div>

        </div>

        {/* Track switch prompt */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Diğer demo profilini incelemek için:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSwitchStudent('LGS')}
              className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                student.track === 'LGS' 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              8. Sınıf Kerem (LGS)
            </button>
            <button
              onClick={() => onSwitchStudent('YKS')}
              className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                student.track === 'YKS' 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              11. Sınıf Selin (YKS)
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'overview' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Günlük Plan & Öncelikler
        </button>
        <button
          onClick={() => setActiveTab('tutor')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'tutor' ? 'bg-indigo-900 text-white shadow-xs' : 'text-indigo-900 hover:text-indigo-950 bg-indigo-50/70'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5 text-amber-300" />
          <span>Gemini Matematik Öğretmeni (Canlı Köprü)</span>
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'subjects' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ders & Konu Kazanımları
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
            activeTab === 'exams' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Deneme Sınavları & Net Analizi
        </button>
      </div>

      {/* TAB 1: OVERVIEW & DAILY STUDY PLAN */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Daily Study Plan & Signature Loop Trigger */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Signature Feature Highlight: Kübik Öğrenme Döngüsü Callout */}
            <div className="bg-linear-to-r from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-indigo-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span>ÖNERİLEN KÜBİK ÖĞRENME DÖNGÜSÜ</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {student.track === 'LGS' 
                      ? 'Üslü İfadeler: Negatif Üsler ve Parantez Kuralları'
                      : 'Fonksiyon Simetrileri: y = f(-x) ve Grafik Ötelemeleri'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Son deneme sınavınızdaki hata analizinden tespit edildi. 6 adımlı rehberli döngüyü tamamlayarak kazanım puanınızı yükseltin.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <button
                    onClick={() => setActiveTab('tutor')}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-indigo-700 hover:bg-indigo-600 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-amber-300" />
                    <span>Gemini Öğretmene Danış</span>
                  </button>
                  <button
                    onClick={() => handleLaunchLoop('default')}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-slate-950" />
                    <span>6 Adımlı Döngü</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Study Plan List */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Bugünkü Kişiselleştirilmiş Çalışma Planı
                  </h2>
                  <p className="text-xs text-slate-600">
                    {completedTaskCount} / {tasks.length} Görev Tamamlandı
                  </p>
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {Math.round((completedTaskCount / tasks.length) * 100)}% İlerleme
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                <div 
                  className="bg-indigo-700 h-full transition-all duration-300"
                  style={{ width: `${(completedTaskCount / tasks.length) * 100}%` }}
                />
              </div>

              {/* Tasks list */}
              <div className="space-y-2.5">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-lg border text-xs transition-all flex items-start justify-between gap-3 ${
                      task.completed 
                        ? 'bg-slate-50 border-slate-200 opacity-70' 
                        : task.priority === 'high'
                        ? 'bg-white border-indigo-200 shadow-2xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-slate-400" title={task.completed ? 'Görev tamamlandı' : 'Görev bekliyor'}>{task.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Circle className="w-4 h-4" />}</span>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-900">{task.subjectName}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-600">{task.durationMinutes} Dk</span>
                          {task.questionCount && (
                            <>
                              <span aria-hidden="true" className="text-slate-300">·</span>
                              <span className="text-slate-600">{task.questionCount} Soru</span>
                            </>
                          )}
                          {task.priority === 'high' && !task.completed && (
                            <span className="text-[10px] text-amber-700 font-semibold">Öncelikli</span>
                          )}
                        </div>
                        <p className={`font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                          {task.title}
                        </p>
                        <p className="text-slate-600 text-[11px] mt-0.5">
                          {task.description}
                        </p>
                      </div>
                    </div>

                    {!task.completed && <button onClick={() => task.type === 'guided_concept' ? handleLaunchLoop(task.topicId) : setActiveTaskId(task.id)} className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold rounded text-xs transition-colors shrink-0"><span>Başla</span><ChevronRight className="w-3.5 h-3.5" /></button>}
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Right Col: Active Topic Weaknesses & Performance Snapshot */}
          <div className="space-y-6">
            
            {/* Active Weaknesses Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Teşhis Edilen Kritik Kazanım Açıkları
                </h2>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                Son denemelerde soru kaybına neden olan ve telafi bekleyen konular:
              </p>

              <div className="space-y-3">
                {student.activeWeaknessTopics.map(topic => (
                  <div key={topic.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{topic.name}</span>
                      <span className="font-bold text-amber-700">%{topic.masteryLevel}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mb-2 leading-relaxed">
                      {topic.diagnosedWeakness || topic.evidenceNotes}
                    </p>
                    <button
                      onClick={() => handleLaunchLoop(topic.id)}
                      className="w-full py-1.5 px-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-indigo-900 font-semibold rounded text-center transition-colors block text-[11px]"
                    >
                      Kübik Öğrenme Döngüsü ile Telafi Et →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Projection */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 text-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-2">
                Hedef Okul Uyumluluk Projeksiyonu
              </h2>
              <p className="text-slate-600 mb-3">
                {student.track === 'LGS' 
                  ? 'Kabataş Erkek Lisesi taban puanı için Matematik netinizin 17.5+ seviyesine çıkması hedefleniyor.' 
                  : 'ODTÜ Bilgisayar Mühendisliği için AYT Matematik netinizin 32+ ve Fizik netinizin 11+ olması hedefleniyor.'}
              </p>
              
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span>Mevcut Tahmini Net:</span>
                  <span className="font-bold text-slate-900">
                    {student.track === 'LGS' ? '76.5 / 90 Net' : 'AYT 28 / 40 Net'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Hedeflenen Net:</span>
                  <span className="font-bold text-indigo-700">
                    {student.track === 'LGS' ? '84.0 / 90 Net' : 'AYT 34 / 40 Net'}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-800 font-semibold pt-1 border-t border-slate-100">
                  <span>Gereken Net Artışı:</span>
                  <span>{student.track === 'LGS' ? '+7.5 Net' : '+6.0 Net'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: SUBJECT & TOPIC PROGRESS */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Ders ve Konu Kazanım Haritası</h2>
              <p className="text-xs text-slate-600">
                Her bir konudaki soru çözme doğruluğunuz ve MEB / ÖSYM kazanım yeterliliğiniz
              </p>
            </div>
            
            {/* Subject Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {subjectList.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                    currentSubject.id === sub.id
                      ? 'bg-indigo-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Subject Summary Header */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-6 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm">{currentSubject.name} Genel Durumu</span>
              <p className="text-slate-600 mt-0.5">
                {currentSubject.masteredTopics} / {currentSubject.totalTopics} Konu Tamamlandı · Haftalık Çalışma: {currentSubject.completedHours} / {currentSubject.weeklyGoalHours} Saat
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-slate-600 block text-[11px]">Son Deneme Neti</span>
                <span className="font-bold text-slate-900 text-sm">{currentSubject.netScore} Net</span>
              </div>
              <div className="text-right">
                <span className="text-slate-600 block text-[11px]">Kazanım Yeterliliği</span>
                <span className="font-bold text-indigo-700 text-sm">%{currentSubject.averageMastery}</span>
              </div>
            </div>
          </div>

          {/* Topic List */}
          <div className="space-y-3">
            {currentSubject.topics.map(topic => (
              <div
                key={topic.id}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{topic.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${
                      topic.status === 'mastered'
                        ? 'bg-emerald-50 text-emerald-800'
                        : topic.status === 'needs_practice'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-blue-50 text-blue-800'
                    }`}>
                      {topic.status === 'mastered' ? 'Kazanıldı' : topic.status === 'needs_practice' ? 'Telafi Bekliyor' : 'Çalışılıyor'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {topic.diagnosedWeakness || topic.evidenceNotes}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 pt-1">
                    <span>{topic.questionCount} Soru Çözüldü</span>
                    <span aria-hidden="true">·</span>
                    <span>%{(topic.accuracyRate).toFixed(1)} Doğruluk</span>
                    <span aria-hidden="true">·</span>
                    <span>Son: {topic.lastPracticedDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-600 block">Kazanım Puanı</span>
                    <span className="font-bold text-base text-slate-900">%{topic.masteryLevel}</span>
                  </div>
                  <button
                    onClick={() => handleLaunchLoop(topic.id)}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold rounded-md text-xs transition-colors"
                  >
                    Kazanım Seansı Başlat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PRACTICE EXAMS & NET ANALYSIS */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-900 mb-1">Kurumsal Deneme ve Tarama Sınavları</h2>
            <p className="text-xs text-slate-600 mb-6">
              Kübik Dershanesi Türkiye geneli ve şube deneme sınavı sonuçları, soru dağılımı ve net karnesi
            </p>

            <div className="space-y-4">
              {student.recentExams.map(exam => (
                <div key={exam.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-xs text-slate-600 block">{exam.date} · {exam.track}</span>
                      <h3 className="font-bold text-slate-900 text-sm">{exam.title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-600 block">Toplam Net</span>
                        <span className="font-extrabold text-base text-indigo-900">{exam.net} Net</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-600 block">Şube Başarısı</span>
                        <span className="font-bold text-xs text-slate-800">{exam.rankInClass}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Breakdown */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1.5 uppercase">
                      Ders Bazında Net Dağılımı:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(exam.subjectNets).map(([subj, netVal]) => (
                        <div key={subj} className="bg-white px-2.5 py-1.5 rounded border border-slate-200 text-xs">
                          <span className="text-slate-600 mr-1">{subj}:</span>
                          <span className="font-bold text-slate-900">{netVal}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pedagogical Summary */}
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700">
                    <span className="font-semibold text-indigo-900">Zümre & Danışman Notu: </span>
                    {exam.analysisSummary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: GEMINI MATHEMATICS TUTOR BRIDGE */}
      {activeTab === 'tutor' && (
        <GeminiMathTutor
          key={student.id}
          studentId={student.id}
          studentName={student.name}
          grade={student.grade}
          track={student.track}
          onMasteryUpdated={(newScore) => {
            const targetTopicId = student.track === 'LGS' ? 'top_lgs_uslu' : 'top_yks_fonk';
            handleMasteryUpdated(targetTopicId, newScore);
          }}
          onSwitchStudent={onSwitchStudent}
        />
      )}

      {activeTaskId && (() => { const task = tasks.find(item => item.id === activeTaskId); if (!task) return null; return <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 p-4"><div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"><p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Görev Başlatıldı · Demo Etkinliği</p><h2 className="mt-2 text-lg font-bold text-slate-900">{task.title}</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">{task.description}</p><div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">{task.type === 'practice_quiz' ? 'Bu prototipte bu görev için ayrı bir soru seti henüz bağlanmadı. Görev akışını ve tamamlanma davranışını deneyebilirsiniz.' : 'Bu prototipte bu görev bir çalışma yönergesi olarak gösterilir. Gerçek içerik, ilgili öğretmen materyalleri bağlandığında sunulmalıdır.'}</div><div className="mt-5 flex justify-end gap-2"><button onClick={() => setActiveTaskId(null)} className="rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700">Vazgeç</button><button onClick={() => { const nextTasks = tasks.map(item => item.id === task.id ? { ...item, completed: true } : item); setTasks(nextTasks); try { window.localStorage.setItem(`kubik:tasks:${student.id}`, JSON.stringify(nextTasks)); } catch (error) { console.warn('Demo task progress could not be saved locally.', error); } setActiveTaskId(null); }} className="rounded-md bg-indigo-900 px-4 py-2 text-xs font-bold text-white">Görevi Bitir</button></div></div></div>; })()}

      {/* Kübik Learning Loop Modal Instance */}
      {activeLoopSession && (
        <LearningLoopModal
          session={activeLoopSession}
          isOpen={!!activeLearningLoopId}
          onClose={() => setActiveLearningLoopId(null)}
          onMasteryUpdated={handleMasteryUpdated}
          onCompleted={() => { if (activeLoopSession) { const nextTasks = tasks.map(task => task.type === 'guided_concept' && task.topicId === activeLoopSession.topicId ? { ...task, completed: true } : task); setTasks(nextTasks); try { window.localStorage.setItem(`kubik:tasks:${student.id}`, JSON.stringify(nextTasks)); } catch (error) { console.warn('Demo task progress could not be saved locally.', error); } } }}
        />
      )}

    </div>
  );
};
