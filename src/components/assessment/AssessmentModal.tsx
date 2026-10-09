import React, { useState } from 'react';
import { EducationalTrack } from '../../types';
import { DIAGNOSTIC_QUESTIONS, DiagnosticQuestion } from '../../data/diagnosticAssessment';
import { X, CheckCircle, AlertCircle, Sparkles, ArrowRight, RotateCcw, Send } from 'lucide-react';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrack: EducationalTrack;
  onSelectTrackForStudentView: (track: EducationalTrack) => void;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
  isOpen,
  onClose,
  initialTrack,
  onSelectTrackForStudentView
}) => {
  const [track, setTrack] = useState<EducationalTrack>(initialTrack);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, { optionId: string; isCorrect: boolean }>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [leadFormSubmitted, setLeadFormSubmitted] = useState(false);
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const questions: DiagnosticQuestion[] = DIAGNOSTIC_QUESTIONS[track];
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];

  const handleSelectOption = (optionId: string, isCorrect: boolean) => {
    if (currentAnswer) return; // already answered
    setSelectedOptionId(optionId);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: { optionId, isCorrect }
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = (newTrack?: EducationalTrack) => {
    if (newTrack) setTrack(newTrack);
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setAnswers({});
    setIsCompleted(false);
    setLeadFormSubmitted(false);
  };

  const correctCount = Object.values(answers).filter(a => a.isCorrect).length;
  const totalCount = questions.length;
  const scorePercent = Math.round((correctCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <div>
              <h2 className="text-base font-bold tracking-tight">Kübik Hızlı Seviye Tespit Sınavı</h2>
              <p className="text-xs text-slate-400">
                MEB & ÖSYM standartlarında 3 soruluk yapay zeka destekli ön teşhis testi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track switch bar */}
        {!isCompleted && (
          <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium mr-1">Hazırlık Parkuru:</span>
              <button
                onClick={() => handleRestart('LGS')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  track === 'LGS' ? 'bg-indigo-900 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                8. Sınıf LGS
              </button>
              <button
                onClick={() => handleRestart('YKS')}
                className={`px-3 py-1 rounded font-semibold transition-colors ${
                  track === 'YKS' ? 'bg-indigo-900 text-white shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                11. Sınıf YKS
              </button>
            </div>
            <div className="text-slate-600 font-medium">
              Soru {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-6">
          {!isCompleted ? (
            <div>
              {/* Question metadata */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                <span className="font-semibold text-indigo-700">{currentQuestion.subject}</span>
                <span aria-hidden="true">·</span>
                <span>{currentQuestion.topic}</span>
                <span aria-hidden="true">·</span>
                <span>Zorluk: {currentQuestion.difficulty}</span>
              </div>

              {/* Question text */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-5">
                <p className="text-slate-900 font-medium leading-relaxed text-sm">
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {currentQuestion.options.map(option => {
                  const isSelected = currentAnswer?.optionId === option.id;
                  let optionClass = 'border-slate-200 bg-white hover:border-slate-300 text-slate-800';

                  if (currentAnswer) {
                    if (option.isCorrect) {
                      optionClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                    } else if (isSelected && !option.isCorrect) {
                      optionClass = 'border-rose-400 bg-rose-50 text-rose-900';
                    } else {
                      optionClass = 'opacity-50 border-slate-200 bg-white';
                    }
                  }

                  return (
                    <button
                      key={option.id}
                      disabled={!!currentAnswer}
                      onClick={() => handleSelectOption(option.id, option.isCorrect)}
                      className={`w-full text-left p-3.5 rounded-lg border text-sm transition-all flex items-start justify-between gap-3 ${optionClass}`}
                    >
                      <span className="leading-snug">{option.text}</span>
                      {currentAnswer && option.isCorrect && (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      )}
                      {currentAnswer && isSelected && !option.isCorrect && (
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Pedagogical Feedback */}
              {currentAnswer && (
                <div className={`p-4 rounded-lg text-xs mb-5 border ${
                  currentAnswer.isCorrect 
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                    : 'bg-amber-50/80 border-amber-200 text-amber-950'
                }`}>
                  <div className="font-semibold mb-1 flex items-center gap-1.5">
                    {currentAnswer.isCorrect ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Kazanım Doğrulandı! Mantık akışı başarılı.</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Kavram Yanılgısı Teşhis Edildi:</span>
                      </>
                    )}
                  </div>
                  <p className="leading-relaxed">
                    {currentAnswer.isCorrect 
                      ? 'Bu kazanımda temel aksiyomları doğru kullandınız. Kübik Öğrenme Döngüsü bu aşamayı onaylıyor.' 
                      : (currentQuestion.options.find(o => o.id === currentAnswer.optionId)?.misconceptionFeedback || 
                         'Bu kazanımda formül ve mantık sıralamasında dikkat edilmesi gereken kritik bir detay tespit edildi.')}
                  </p>
                </div>
              )}

              {/* Navigation button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  {currentAnswer ? 'Cevap kaydedildi. Sonraki adıma geçebilirsiniz.' : 'Lütfen bir seçenek işaretleyiniz.'}
                </span>
                <button
                  disabled={!currentAnswer}
                  onClick={handleNext}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-md transition-colors ${
                    currentAnswer 
                      ? 'bg-indigo-900 text-white hover:bg-indigo-800' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span>{currentQuestionIndex < questions.length - 1 ? 'Sonraki Soru' : 'Teşhis Raporunu Gör'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Results & Teşhis Raporu */
            <div>
              <div className="text-center py-4 border-b border-slate-200 mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-800 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  %{scorePercent}
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {track === 'LGS' ? '8. Sınıf LGS' : '11. Sınıf YKS'} Ön Seviye Teşhis Raporunuz Hazır
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  3 sorudan {correctCount} doğru tamamlandı. Kübik Yapay Zeka Pedagogu analiz sonuçlarını çıkardı.
                </p>
              </div>

              {/* Teşhis Bulguları */}
              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Teşhis Edilen Kazanım Haritası
                </h4>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">
                      {track === 'LGS' ? 'Matematik · Üslü İfadeler' : 'AYT Matematik · Fonksiyon Simetrileri'}
                    </span>
                    <span className={answers[questions[0].id]?.isCorrect ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {answers[questions[0].id]?.isCorrect ? 'Yeterli' : 'Kritik Destek Gerekli'}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    {answers[questions[0].id]?.isCorrect 
                      ? 'Temel kuvvet kuralları kavranmış. Yeni nesil uzun modelleme sorularına odaklanılmalı.'
                      : 'Negatif üs ve işaret kavramlarında açık tespit edildi. Kübik Öğrenme Döngüsü ile 25 dakikada telafi edilebilir.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800">
                      {track === 'LGS' ? 'Fen Bilimleri · Mevsimler ve İklim' : 'Fizik · Vektörler & Bağıl Hareket'}
                    </span>
                    <span className={answers[questions[1].id]?.isCorrect ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {answers[questions[1].id]?.isCorrect ? 'Yeterli' : 'Pekiştirme Gerekli'}
                    </span>
                  </div>
                  <p className="text-slate-600">
                    {answers[questions[1].id]?.isCorrect 
                      ? 'Eksen ve bileşen mantığı yerinde. Düzenli soru çözümüyle korunmalı.'
                      : 'Bağımsız hız bileşenleri ve açı etkisinde kavram yanılgısı mevcut.'}
                  </p>
                </div>
              </div>

              {/* Lead Capture or Direct Demo Action */}
              {!leadFormSubmitted ? (
                <div className="p-4 rounded-lg bg-indigo-50 border border-indigo-200 mb-6">
                  <h4 className="text-xs font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-700" />
                    <span>Detaylı Karnenizi ve Kişiselleştirilmiş Çalışma Planını Alın</span>
                  </h4>
                  <p className="text-xs text-indigo-800 mb-3">
                    Kübik Dershanesi rehberlik zümresi, bu rapora dayalı 7 günlük telafi programını velinize ücretsiz iletsin.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Veli / Öğrenci Adı Soyadı"
                      value={parentName}
                      onChange={e => setParentName(e.target.value)}
                      className="px-3 py-2 text-xs bg-white rounded border border-indigo-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-700"
                    />
                    <input
                      type="tel"
                      placeholder="Telefon Numarası (05xx...)"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="px-3 py-2 text-xs bg-white rounded border border-indigo-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-700"
                    />
                  </div>

                  <button
                    onClick={() => setLeadFormSubmitted(true)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kişisel Çalışma Raporunu WhatsApp / SMS ile Gönder</span>
                  </button>
                  <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                    * Simülasyon: Bilgileriniz kaydedilmez; anında öğrenci paneline geçebilirsiniz.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 mb-6 text-center text-xs text-emerald-950">
                  <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                  <p className="font-bold">Ön Teşhis Talebiniz Alındı!</p>
                  <p className="text-slate-600 mt-1">
                    Kübik rehberlik birimi analiz dosyasını hazırladı. Demo öğrenci paneline geçerek bu analizin nasıl işlendiğini canlı görebilirsiniz.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <button
                  onClick={() => handleRestart()}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Testi Tekrar Başlat</span>
                </button>

                <button
                  onClick={() => {
                    onSelectTrackForStudentView(track);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-800 rounded-md transition-colors"
                >
                  <span>{track === 'LGS' ? 'Kerem\'in LGS Paneline Git' : 'Selin\'in YKS Paneline Git'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
