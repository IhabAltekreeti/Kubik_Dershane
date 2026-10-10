import React, { useState, useEffect, useRef } from 'react';
import { 
  fetchVerifiedQuestion, 
  fetchStudentProgress, 
  submitAnswer, 
  sendTutorChatMessage,
  fetchHealth,
  VerifiedQuestionData, 
  TopicProgressResponse,
  AnswerSubmissionResult
} from '../../services/tutorApi';
import { 
  Sparkles, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb, 
  BookOpen, 
  HelpCircle, 
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  Clock,
  ArrowRight
} from 'lucide-react';

interface GeminiMathTutorProps {
  studentId: string;
  studentName: string;
  grade: number;
  track: 'LGS' | 'YKS';
  onMasteryUpdated?: (newScore: number) => void;
 }

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const GeminiMathTutor: React.FC<GeminiMathTutorProps> = ({
  studentId,
  studentName,
  grade,
  track,
  onMasteryUpdated,
 }) => {
  const [question, setQuestion] = useState<VerifiedQuestionData | null>(null);
  const [unavailableInfo, setUnavailableInfo] = useState<{ message: string; track: string } | null>(null);
  const [progress, setProgress] = useState<TopicProgressResponse | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true);
  const [serverHealth, setServerHealth] = useState<{ status: string; hasGeminiKey: boolean } | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Question solving state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [submissionResult, setSubmissionResult] = useState<AnswerSubmissionResult | null>(null);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInitialData();
  }, [studentId, track]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiResponding]);

  const loadInitialData = async () => {
    setIsLoadingQuestion(true);
    setAiError(null);
    setSelectedOption(null);
    setRevealedHints([]);
    setSubmissionResult(null);

    try {
      const [qResp, healthData] = await Promise.all([
        fetchVerifiedQuestion(studentId, track),
        fetchHealth()
      ]);

      setServerHealth(healthData);

      if (!qResp.available || !qResp.question) {
        setQuestion(null);
        setUnavailableInfo({
          message: qResp.message || `${grade}. Sınıf ${track} parkuru için henüz doğrulanmış soru kaydı bulunmamaktadır.`,
          track: qResp.track || track
        });
        setProgress(null);
        setMessages([]);
      } else {
        setQuestion(qResp.question);
        setUnavailableInfo(null);

        // Load server-persisted topic progress for this student's topic
        const topicId = qResp.question.topic === 'Üslü İfadeler' ? 'top_lgs_uslu' : 'top_yks_fonk';
        const pData = await fetchStudentProgress(studentId, topicId);
        setProgress(pData);

        // Initial tutor welcome message tailored to this student's grade & track
        const sourceLabel = qResp.question.verificationStatus === 'verified_official_publication'
          ? `resmî ${qResp.question.sourceAttribution}`
          : 'müfredat uyumlu içerik';
        setMessages([
          {
            id: 'welcome_1',
            role: 'assistant',
            content: `Merhaba ${studentName}! Ben Kübik Matematik Öğretmenin. Bugün ${grade}. Sınıf (${track}) seviyesinde "${qResp.question.topic}" konusunu (${sourceLabel}) birlikte ele alıyoruz. Soruyu dikkatle oku; aklına takılan herhangi bir adımda bana dilediğin gibi danışabilirsin!`,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      console.error('Failed to load tutor data:', err);
      setAiError(err.message || 'Veri yüklenirken bir hata oluştu.');
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isAiResponding) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsAiResponding(true);
    setAiError(null);

    try {
      // Build history for API
      const historyForApi = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await sendTutorChatMessage({
        studentId,
        userMessage: textToSend.trim(),
        chatHistory: historyForApi
      });

      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Tutor chat error:', err);
      setAiError(err.message || 'Öğretmen yanıtı alınamadı.');
    } finally {
      setIsAiResponding(false);
    }
  };

  const handleRevealNextHint = () => {
    if (!question) return;
    if (revealedHints.length < question.pedagogicalHints.length) {
      const nextIndex = revealedHints.length;
      setRevealedHints(prev => [...prev, nextIndex]);

      // Inform AI chat
      const hintText = question.pedagogicalHints[nextIndex];
      setMessages(prev => [
        ...prev,
        {
          id: `hint_${Date.now()}`,
          role: 'assistant',
          content: `💡 Pedagojik İpucu #${nextIndex + 1}: ${hintText}`,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !question || isSubmittingAnswer) return;

    setIsSubmittingAnswer(true);
    setAiError(null);

    try {
      const topicId = question.topic === 'Üslü İfadeler' ? 'top_lgs_uslu' : 'top_yks_fonk';
      const result = await submitAnswer({
        studentId,
        topicId,
        questionId: question.id,
        chosenOptionId: selectedOption,
        hintsUsedCount: revealedHints.length,
        aiTutorInteractionsCount: messages.filter(m => m.role === 'user').length
      });

      setSubmissionResult(result);
      setProgress(result.updatedMastery);

      if (onMasteryUpdated) {
        onMasteryUpdated(result.updatedMastery.currentMastery);
      }

      // Add tutor evaluation to chat
      let evalMsg = '';
      if (result.isCorrect) {
        if (result.isRepeatedAttempt) {
          evalMsg = `Tebrikler ${studentName}! Cevabın (${result.verifiedAnswerKey}) doğru. Not: Bu soruyu daha önce de başarıyla çözmüştün; tekrar denemen kaydedildi ancak mükerrer kazanım artışı uygulanmadı.`;
        } else {
          evalMsg = `Tebrik ederim ${studentName}! Doğru seçenek ${result.verifiedAnswerKey}. ${result.explanation}`;
        }
      } else {
        evalMsg = `Verdiğin cevap doğru değil. ${result.explanation} Doğru seçenek: ${result.verifiedAnswerKey}.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `eval_${Date.now()}`,
          role: 'assistant',
          content: evalMsg,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error('Submission error:', err);
      setAiError(err.message || 'Cevap gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleResetForNewTry = () => {
    setSelectedOption(null);
    setSubmissionResult(null);
  };

  if (isLoadingQuestion) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-600 font-medium">
          {grade}. Sınıf {track} doğrulanmış soru kaydı ve Gemini Öğretmen Köprüsü yükleniyor...
        </p>
      </div>
    );
  }

  // Unavailable content notice (Strict integrity rule: YKS students do not receive mismatched LGS content)
  if (unavailableInfo) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs mb-1">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-indigo-700" />
                  <span>Kübik Akıllı Matematik Öğretmeni</span>
                </span>
                <span className="text-slate-300">·</span>
                <span className="font-semibold text-slate-700">{grade}. Sınıf {track} Parkuru</span>
                <span className="text-slate-300">·</span>
                <span className="text-amber-800 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>İçerik Durumu: Doğrulanmış Kayıt Hazırlık Aşamasında</span>
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {grade}. Sınıf {track} İçin Doğrulanmış Soru Kaydı Bulunmuyor
              </h2>
            </div>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-lg text-xs text-amber-950 space-y-2">
            <span className="font-bold text-sm block">Kübik Kaynak Doğruluk İlkesi</span>
            <p className="leading-relaxed text-amber-900">
              {unavailableInfo.message}
            </p>
            <p className="leading-relaxed text-amber-900">
              Kübik platformunda soru ve cevap anahtarlarının resmî kaynağı şeffaf biçimde teyit edilmeden "doğrulanmış soru" etiketi kullanılamaz. 11. Sınıf YKS öğrencisine 8. Sınıf LGS içeriği YKS içeriğiymiş gibi sunulmaz; sahte veya yapay kaynak bağlantısı üretilmez.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-2">
            <span className="font-bold text-slate-900 block">Mevcut Durum ve Yol Haritası:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li><strong>8. Sınıf LGS Matematik</strong>: MEB ÖDSGM resmî 2018-2019 örnek soru kitapçığı ile doğrulanmış soru kaydı ve adım adım Gemini öğretmeni aktiftir.</li>
              <li><strong>11. Sınıf YKS Sayısal</strong>: Kazanım izleme, deneme sınavı analizleri ve pedagojik döngü aktiftir. Doğrulanmış ÖSYM/MEB soru köprüsü sonraki aşamada yayımlanacaktır.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-xs text-rose-950">
        <p className="font-bold">Soru kaydı yüklenemedi.</p>
        <button
          onClick={loadInitialData}
          className="mt-3 px-3 py-1.5 bg-rose-900 text-white font-semibold rounded text-xs"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Verification & System Architecture Notice */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
              <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-indigo-700" />
                <span>Kübik Akıllı Matematik Öğretmeni</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-semibold text-slate-700">{grade}. Sınıf {track} Parkuru</span>
              <span className="text-slate-300">·</span>
              <span className={`text-xs font-semibold flex items-center gap-1 ${
                question.verificationStatus === 'verified_official_publication'
                  ? 'text-emerald-700'
                  : 'text-amber-800'
              }`}>
                {question.verificationStatus === 'verified_official_publication' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Resmî MEB Yayınıyla Doğrulanmış</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Müfredat Referanslı Taslak (Resmî Teyit Bekliyor)</span>
                  </>
                )}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {question.topic} · Canlı Gemini Destekli Adım Adım Rehberlik
            </h2>
            <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Kazanım: {question.learningObjectiveCode} - {question.learningObjectiveDescription}</span>
              <span className="text-slate-300">·</span>
              <a 
                href={question.sourceUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-indigo-700 hover:underline inline-flex items-center gap-1 font-medium"
              >
                <span>Kaynak: {question.sourceAttribution}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            {question.provenanceNotes && (
              <p className="text-[10px] text-slate-400 mt-1 italic">
                Doğrulama Notu: {question.provenanceNotes}
              </p>
            )}
          </div>

          {/* Server Config & API Key Status indicator */}
          <div className="shrink-0 text-right bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 justify-end">
              <span className={`w-2 h-2 rounded-full ${serverHealth?.hasGeminiKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span className="font-semibold text-slate-800">
                {serverHealth?.hasGeminiKey ? 'Gemini 3.8 Flash Aktif' : 'Gemini API Anahtarı Bekleniyor'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              API Anahtarı sunucu tarafında korunur; istemciye asla sızmaz.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Col Question & Answer Submission | Right Col Live Gemini Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COL: VERIFIED QUESTION & EVALUATION (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Question Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                {question.verificationStatus === 'verified_official_publication' ? 'Resmî MEB Örnek Sorusu' : 'Örnek Soru'}
              </span>
              <span className="text-[11px] text-slate-500">
                Belge: {question.sourceDocument}
              </span>
            </div>

            {/* Question Text */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-900 text-sm leading-relaxed whitespace-pre-line font-medium">
              {question.questionText}
            </div>

            {/* Options Selector */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Cevabınızı Seçiniz:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {question.options.map(opt => {
                  const isSelected = selectedOption === opt.id;
                  let btnClass = 'bg-white border-slate-200 hover:border-slate-300 text-slate-800';

                  if (submissionResult) {
                    if (opt.id === submissionResult.verifiedAnswerKey) {
                      btnClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                    } else if (isSelected && !submissionResult.isCorrect) {
                      btnClass = 'bg-rose-50 border-rose-300 text-rose-950';
                    } else {
                      btnClass = 'opacity-50 bg-slate-50 border-slate-200';
                    }
                  } else if (isSelected) {
                    btnClass = 'bg-indigo-50 border-indigo-700 text-indigo-950 font-bold shadow-2xs';
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={!!submissionResult || isSubmittingAnswer}
                      onClick={() => setSelectedOption(opt.id)}
                      className={`p-3 rounded-lg border text-xs text-left transition-all flex items-center justify-between ${btnClass}`}
                    >
                      <span>{opt.text}</span>
                      {submissionResult && opt.id === submissionResult.verifiedAnswerKey && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: Hints & Submit */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              
              {/* Socratic Hint Button */}
              <button
                onClick={handleRevealNextHint}
                disabled={revealedHints.length >= question.pedagogicalHints.length}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 font-semibold rounded-md text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {revealedHints.length < question.pedagogicalHints.length
                    ? `Pedagojik İpucu İste (${revealedHints.length + 1}/${question.pedagogicalHints.length})`
                    : 'Tüm İpuçları Açıldı'}
                </span>
              </button>

              {/* Submit Answer */}
              {!submissionResult ? (
                <button
                  disabled={!selectedOption || isSubmittingAnswer}
                  onClick={handleSubmitAnswer}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-md text-xs transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {isSubmittingAnswer ? (
                    <span>Değerlendiriliyor...</span>
                  ) : (
                    <>
                      <span>Cevabımı Sunucuda Doğrula</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleResetForNewTry}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md text-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tekrar Çöz</span>
                </button>
              )}

            </div>

          </div>

          {/* Verified Official Solution (Revealed on submission) */}
          {submissionResult && (
            <div className={`rounded-xl border p-5 text-xs space-y-3 ${
              submissionResult.isCorrect ? 'bg-emerald-50/70 border-emerald-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                {submissionResult.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {submissionResult.isCorrect 
                      ? (submissionResult.isRepeatedAttempt ? 'Doğru Cevap (Tekrar Çözüm)' : 'Tebrikler! Doğru Cevap.') 
                      : 'Cevabınız Hatalı.'}
                  </h3>
                  <p className="text-slate-600 text-[11px]">
                    {submissionResult.explanation}
                  </p>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-indigo-900 block uppercase text-[10px] tracking-wider">
                  Resmi MEB Çözüm Adımları (Sunucu Tarafından Doğrulanmış):
                </span>
                <div className="space-y-1.5 text-slate-800 leading-relaxed font-mono text-[11px]">
                  {submissionResult.officialSolution.steps.map((st, i) => (
                    <p key={i}>{st}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Real Learning Evidence & Progress Card (Persisted on Server) */}
          {progress && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Kayıtlı Öğrenme Delili & Kazanım Puanı</span>
                </span>
                <span className="font-bold text-indigo-900 text-sm">
                  %{progress.currentMastery} Kazanım
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Başlangıç Skoru</span>
                  <span className="font-bold text-slate-800">%{progress.baselineMastery}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Benzersiz Soru / Toplam</span>
                  <span className="font-bold text-slate-800">{progress.uniqueQuestionsSolved || 0} / {progress.totalSubmissions}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Durum</span>
                  <span className="font-bold text-indigo-800">
                    {progress.status === 'mastered' ? 'Kazanıldı' : progress.status === 'in_progress' ? 'İlerliyor' : 'Açık Var'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 leading-relaxed">
                <span className="font-semibold text-slate-900">Şeffaf Kural: </span>
                {progress.ruleExplanation} (Sayfa yenilense dahi bu delil sunucu hafızasında korunur).
              </p>
            </div>
          )}

        </div>

        {/* RIGHT COL: CONVERSATIONAL GEMINI MATHEMATICS TUTOR (5 cols) */}
        <div className="lg:col-span-5 flex flex-col h-[650px] bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Tutor Chat Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-700 flex items-center justify-center font-bold text-xs text-white">
                K³
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Gemini Matematik Öğretmeni</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[10px] text-slate-400">
                  {grade}. Sınıf {track} Düzeyinde Pedagojik Rehber
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setMessages([
                  {
                    id: `reset_${Date.now()}`,
                    role: 'assistant',
                    content: `Sohbeti tazeledik ${studentName}! Hangi adımda takıldıysan bana sormaktan çekinme.`,
                    timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors text-[11px]"
              title="Sohbeti Sıfırla"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Chat Message Scroll Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-lg leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-900 text-white rounded-br-xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isAiResponding && (
              <div className="flex items-center gap-2 text-xs text-indigo-900 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 max-w-[85%]">
                <div className="w-3.5 h-3.5 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin shrink-0" />
                <span className="italic">Kübik Öğretmen çözüm adımlarını düşünüyor...</span>
              </div>
            )}

            {/* Recoverable Error Banner */}
            {aiError && (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Gemini API İletişim Hatası</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  {aiError}
                </p>
                <button
                  onClick={() => handleSendMessage()}
                  className="px-2.5 py-1 bg-amber-800 hover:bg-amber-900 text-white font-semibold rounded text-[10px] transition-colors"
                >
                  Yeniden Dene
                </button>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Prompt Suggestion Chips */}
          <div className="p-2 bg-white border-t border-slate-200 flex flex-wrap gap-1.5 shrink-0">
            <button
              onClick={() => handleSendMessage(`"${question.topic}" konusundaki temel kuralları özetler misiniz?`)}
              className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-left"
            >
              Temel kuralları özetler misiniz?
            </button>
            <button
              onClick={() => handleSendMessage("Sorunun ilk adımına nereden başlamalıyım?")}
              className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-left"
            >
              İlk adıma nereden başlamalıyım?
            </button>
            <button
              onClick={() => handleSendMessage(question.pedagogicalHints[0] ? `İpucu hakkında düşünelim: ${question.pedagogicalHints[0]}` : "Çözüm yaklaşımını adım adım tartışalım.")}
              className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-left"
            >
              Adım adım ipucu üzerinden tartışalım
            </button>
          </div>

          {/* Message Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Öğretmene bir soru sor veya fikrini yaz..."
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                disabled={isAiResponding}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-indigo-700 text-slate-900"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isAiResponding}
                className="p-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-md transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shrink-0"
                title="Gönder"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
};
