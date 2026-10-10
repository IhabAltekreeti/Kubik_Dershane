import React, { useState } from 'react';
import { LearningLoopSession } from '../../types';
import { 
  X, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  HelpCircle, 
  TrendingUp, 
  BookOpen, 
  UserCheck, 
  Award,
  ArrowRight
} from 'lucide-react';

interface LearningLoopModalProps {
  session: LearningLoopSession;
  isOpen: boolean;
  onClose: () => void;
  onMasteryUpdated: (topicId: string, newScore: number) => void;
  onCompleted?: () => void;
}

export const LearningLoopModal: React.FC<LearningLoopModalProps> = ({
  session,
  isOpen,
  onClose,
  onMasteryUpdated,
  onCompleted
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [selectedGuidedOption, setSelectedGuidedOption] = useState<string | null>(null);
  const [selectedAssessmentOption, setSelectedAssessmentOption] = useState<string | null>(null);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [assessmentCorrect, setAssessmentCorrect] = useState(false);
  const [showWorkedSolution, setShowWorkedSolution] = useState(false);
  const [masteryApplied, setMasteryApplied] = useState(false);

  if (!isOpen) return null;

  const toggleHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints(prev => [...prev, index]);
    }
  };

  const handleAssessmentSubmit = (optionId: string) => {
    setSelectedAssessmentOption(optionId);
    setAssessmentCompleted(true);
    setAssessmentCorrect(Boolean(session.verificationAssessment.options.find(option => option.id === optionId)?.isCorrect));
  };

  const applyMasteryUpgrade = () => {
    if (!masteryApplied) {
      onMasteryUpdated(session.topicId, session.masteryUpdate.newMastery);
      setMasteryApplied(true);
    }
    setActiveStep(6);
  };

  const stepsList = [
    { num: 1, title: 'Teşhis & Delil' },
    { num: 2, title: 'Kavramsal Anlatım' },
    { num: 3, title: 'Rehberli Çözüm' },
    { num: 4, title: 'Pekiştirme Sorusu' },
    { num: 5, title: 'Kazanım Güncellemesi' },
    { num: 6, title: 'Sonraki Adım' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-0.5">
              <span>KÜBİK ÖĞRENME DÖNGÜSÜ</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">{session.subjectName}</span>
            </div>
            <h2 className="text-base font-bold text-white">{session.topicName}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-md transition-colors"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 6-Step Stepper Header */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[550px] gap-2">
            {stepsList.map(step => {
              const isCurrent = activeStep === step.num;
              const isPassed = activeStep > step.num;
              return (
                <div 
                  key={step.num}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={() => {
                      if (step.num <= activeStep) setActiveStep(step.num as any);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded transition-colors ${
                      isCurrent 
                        ? 'bg-indigo-900 text-white shadow-xs' 
                        : isPassed 
                        ? 'text-emerald-700 hover:text-emerald-800' 
                        : 'text-slate-600 cursor-default'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isCurrent ? 'bg-white text-indigo-900 font-bold' : isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isPassed ? '✓' : step.num}
                    </span>
                    <span>{step.title}</span>
                  </button>
                  {step.num < 6 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {/* STEP 1: Teşhis & Sınav Delili */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-50/70 border border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-950 mb-1">
                      Öğrenci Deneme Verisinden Tespit Edilen Açık
                    </h3>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      {session.diagnosis.evidenceSummary}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Pedagojik Kavram Yanılgısı Analizi
                </h4>
                <p className="text-sm text-slate-800 font-medium leading-relaxed mb-3">
                  {session.diagnosis.identifiedMisconception}
                </p>
                <div className="p-3 bg-slate-50 rounded-md border border-slate-100 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900">Somut Hata Örneği: </span>
                  {session.diagnosis.sampleErrorDescription}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <span>Mevcut Kazanım Seviyesi: %{session.diagnosis.priorAccuracy}</span>
                <button
                  onClick={() => setActiveStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-900 text-white font-semibold rounded-md hover:bg-indigo-800 transition-colors"
                >
                  <span>2. Adıma Geç: Kavramsal Anlatım</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Kavramsal Anlatım & Kritik Kural */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">Temel Pedagojik İlke</span>
                <p className="text-sm font-bold text-indigo-950 mt-1 leading-snug">
                  {session.conceptExplanation.corePrinciple}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-900 text-white font-mono text-xs border border-slate-800">
                <div className="text-amber-400 font-sans font-bold text-[11px] uppercase tracking-wider mb-1">
                  Kritik Formül ve Aksiyom
                </div>
                <div className="text-sm text-slate-100 py-1 font-semibold">
                  {session.conceptExplanation.keyFormulaOrRule}
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-white">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Öğretmen İpuçları & Zihinsel Kancalar</h4>
                <ul className="space-y-2 text-xs text-slate-700">
                  {session.conceptExplanation.teachingNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {session.conceptExplanation.visualModelSteps && (
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 text-xs">
                  <h4 className="font-bold text-slate-800 mb-2">
                    {session.conceptExplanation.visualModelTitle || 'Adım Adım Model'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {session.conceptExplanation.visualModelSteps.map((step, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded border border-slate-200">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveStep(1)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  ← Teşhise Dön
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-900 text-white font-semibold rounded-md hover:bg-indigo-800 transition-colors text-xs"
                >
                  <span>3. Adıma Geç: Rehberli Uygulama</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Rehberli Uygulama & İpuçlu Soru */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-indigo-700">{session.guidedPractice.questionContext}</span>
                <span>Adım Adım İskeletli Öğrenme (Scaffolding)</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-semibold text-slate-900 mb-3">
                  {session.guidedPractice.questionText}
                </p>

                {/* Options */}
                <div className="space-y-2">
                  {session.guidedPractice.options.map(opt => {
                    const isSelected = selectedGuidedOption === opt.id;
                    let style = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';
                    if (selectedGuidedOption) {
                      if (opt.isCorrect) style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold';
                      else if (isSelected && !opt.isCorrect) style = 'bg-rose-50 border-rose-300 text-rose-950';
                    }
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedGuidedOption(opt.id)}
                        className={`w-full text-left p-3 rounded-md border text-xs flex items-center justify-between transition-colors ${style}`}
                      >
                        <span>{opt.text}</span>
                        {selectedGuidedOption && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hints Box */}
              <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Düşünme İpuçları (İhtiyaç Duydukça Açın)</span>
                  </span>
                  <span className="text-[11px] text-slate-600">{revealedHints.length} / {session.guidedPractice.hints.length} İpucu Açık</span>
                </div>

                <div className="space-y-1.5">
                  {session.guidedPractice.hints.map((hint, idx) => {
                    const isRevealed = revealedHints.includes(idx);
                    return (
                      <div key={idx} className="text-xs">
                        {isRevealed ? (
                          <div className="p-2 rounded bg-amber-50/80 border border-amber-200 text-amber-950">
                            {hint}
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleHint(idx)}
                            className="w-full text-left p-2 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium transition-colors"
                          >
                            + İpucu {idx + 1}'i Görüntüle
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Worked Solution Toggle */}
              {selectedGuidedOption && (
                <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50 text-xs">
                  <button
                    onClick={() => setShowWorkedSolution(!showWorkedSolution)}
                    className="w-full text-left font-bold text-indigo-900 flex items-center justify-between"
                  >
                    <span>{showWorkedSolution ? 'Çözüm Adımlarını Gizle' : 'Adım Adım Ayrıntılı Çözümü Göster'}</span>
                    <span className="text-xs">{showWorkedSolution ? '▲' : '▼'}</span>
                  </button>
                  {showWorkedSolution && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5 text-slate-700">
                      {session.guidedPractice.workedSolution.map((line, idx) => (
                        <p key={idx} className="leading-relaxed">{line}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveStep(2)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  ← Anlatıma Dön
                </button>
                <button
                  disabled={!selectedGuidedOption}
                  onClick={() => setActiveStep(4)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 font-semibold rounded-md transition-colors text-xs ${
                    selectedGuidedOption 
                      ? 'bg-indigo-900 text-white hover:bg-indigo-800' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>4. Adıma Geç: Yeni Pekiştirme Sorusu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Yeni Pekiştirme Sorusu */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-950 flex items-center justify-between">
                <span className="font-semibold">Kazanım Ölçümü: Yardım Almadan Bağımsız Çözüm</span>
                <span className="text-[11px] text-indigo-700">Kazanım puanınızı doğrudan etkiler</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm font-semibold text-slate-900 mb-4">
                  {session.verificationAssessment.questionText}
                </p>

                <div className="space-y-2">
                  {session.verificationAssessment.options.map(opt => {
                    const isSelected = selectedAssessmentOption === opt.id;
                    let style = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';
                    if (assessmentCompleted) {
                      if (opt.isCorrect) style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                      else if (isSelected && !opt.isCorrect) style = 'bg-rose-50 border-rose-300 text-rose-950';
                      else style = 'opacity-60 bg-white border-slate-200';
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={assessmentCompleted}
                        onClick={() => handleAssessmentSubmit(opt.id)}
                        className={`w-full text-left p-3.5 rounded-md border text-xs flex items-center justify-between transition-colors ${style}`}
                      >
                        <span>{opt.text}</span>
                        {assessmentCompleted && opt.isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                        {assessmentCompleted && isSelected && !opt.isCorrect && (
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {assessmentCompleted && assessmentCorrect && <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1"><div className="font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>Doğru cevap. Kazanım güncellemesine geçebilirsin.</span></div><p className="text-emerald-900">{session.verificationAssessment.explanation}</p></div>}
              {assessmentCompleted && !assessmentCorrect && <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2"><p className="font-bold">Bu cevap doğru değil; kazanım puanı henüz güncellenmedi.</p><p>{session.verificationAssessment.explanation}</p><button onClick={() => { setSelectedAssessmentOption(null); setAssessmentCompleted(false); setAssessmentCorrect(false); }} className="rounded-md border border-rose-300 bg-white px-3 py-1.5 font-semibold text-rose-900">Yeniden dene</button></div>}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  {assessmentCorrect ? 'Doğru cevap; kazanım güncellemesine geçebilirsin.' : 'Kazanım güncellemesi için doğru cevap gereklidir.'}
                </span>
                <button
                  disabled={!assessmentCorrect}
                  onClick={() => setActiveStep(5)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 font-semibold rounded-md transition-colors text-xs ${
                    assessmentCorrect 
                      ? 'bg-indigo-900 text-white hover:bg-indigo-800' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>5. Adıma Geç: Kazanım Puanını Güncelle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Kazanım Güncellemesi (Mastery Update) */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <div className="text-center py-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Kazanım Yeterliliği Güncelleniyor
                </h3>
                <p className="text-xs text-slate-500">
                  Kübik Ölçme & Değerlendirme Algoritması gözlemlenen soru çözümüne göre skoru güncelledi.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">Önceki Seviye</span>
                  <span className="text-2xl font-bold text-slate-600">%{session.masteryUpdate.previousMastery}</span>
                  <span className="text-[10px] text-amber-700 block mt-1">Eksik Kazanım</span>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-center">
                  <span className="text-[11px] font-semibold text-emerald-700 block mb-1">Yeni Seviye</span>
                  <span className="text-2xl font-bold text-emerald-700">%{session.masteryUpdate.newMastery}</span>
                  <span className="text-[10px] text-emerald-800 font-bold block mt-1">
                    +{session.masteryUpdate.delta} Puan Artış
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Sistem Denetim Kaydı (Audit Log): </span>
                {session.masteryUpdate.auditLog}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={applyMasteryUpgrade}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-emerald-700 text-white font-bold rounded-md hover:bg-emerald-800 transition-colors text-xs shadow-xs"
                >
                  <Award className="w-4 h-4" />
                  <span>Sonucu Onayla & 6. Adıma Geç</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Sonraki Adım & Öğretmen Bildirimi */}
          {activeStep === 6 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-indigo-950 mb-1">
                      {session.recommendation.title}
                    </h3>
                    <p className="text-xs text-indigo-900 leading-relaxed mb-3">
                      {session.recommendation.description}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded border border-indigo-200 text-xs font-semibold text-indigo-900">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                      <span>Atanan Görev: {session.recommendation.suggestedTaskTitle}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-800 font-semibold mb-1">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Öğretmen ve Rehberlik Paneline Bilgi İletildi</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Zümre başkanına bu konudaki gelişiminiz otomatik karne notu olarak kaydedildi. Bir sonraki kurumsal denemede bu kazanım öncelikli olarak izlenecektir.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => { onCompleted?.(); onClose(); }}
                  className="px-5 py-2.5 bg-indigo-900 text-white font-bold rounded-md hover:bg-indigo-800 transition-colors text-xs"
                >
                  Döngüyü Tamamla ve Çalışma Planına Dön
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
