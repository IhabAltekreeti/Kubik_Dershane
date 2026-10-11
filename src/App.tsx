import { useEffect, useRef, useState } from 'react';
import {
  Activity, ArrowRight, ArrowUpRight, BookOpen, BrainCircuit,
  CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp,
  Clock3, GraduationCap, House, Lightbulb, MessageCircle, NotebookPen,
  Send, ShieldCheck, Sparkles, Target, Users, X
} from 'lucide-react';

function formatMath(source: string): string {
  const superscripts: Record<string, string> = {
    '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹',
    'n':'ⁿ','m':'ᵐ','i':'ⁱ','+':'⁺','-':'⁻','(':'⁽',')':'⁾'
  };
  return source
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\div/g, '÷')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\infty/g, '∞')
    .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1⁄$2')
    .replace(/\^(\{([^{}]+)\}|[A-Za-z0-9?+-])/g, (_match, whole, grouped) => {
      const exponent = grouped ?? whole.slice(1);
      if (exponent === '?') return '⁽?⁾';
      return [...exponent].map(char => superscripts[char] ?? char).join('');
    });
}

function renderPlainText(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\n)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part === '\n') return <br key={index} />;
    return part;
  });
}

// Render common LaTeX notation as readable mathematical typography without exposing markup.
function TutorMessage({ text }: { text: string }) {
  const slash = String.fromCharCode(92);
  const normalized = text.split(slash + '(').join('
  return <div className="tutor-rich-text">{chunks.map((chunk, index) => {
    if (chunk.startsWith('$') && chunk.endsWith('$') && chunk.length > 2) {
      return <span className="math-inline" key={index}>{formatMath(chunk.slice(1, -1))}</span>;
    }
    return <span key={index}>{renderPlainText(chunk)}</span>;
  })}</div>;
}

type Track = 'LGS' | 'YKS';
type Role = 'student' | 'teacher' | 'parent' | 'center';
type View = 'today' | 'practice' | 'coach' | 'progress';
type ChatItem = { role: 'user' | 'assistant'; text: string };
type AnswerResult = { correct: boolean; explanation: string; misconception?: string; repeated?: boolean; unverified?: boolean };
type Option = { id: string; text: string };
type Question = {
  id: string; track: Track; topic: string; prompt: string; options: Option[];
  source: string; sourceUrl?: string; verified: boolean; hints?: string[];
};
const students: Record<Track, { id: string; name: string; grade: string; goal: string; initials: string }> = {
  LGS: { id: 'std_lgs_801', name: 'Kerem Demir', grade: '8. sınıf', goal: 'LGS · Matematik', initials: 'KD' },
  YKS: { id: 'std_yks_1101', name: 'Selin Yılmaz', grade: '11. sınıf', goal: 'YKS · Matematik', initials: 'SY' }
};
const roles: { id: Role; label: string }[] = [
  { id: 'student', label: 'Öğrenci' }, { id: 'teacher', label: 'Öğretmen' },
  { id: 'parent', label: 'Veli' }, { id: 'center', label: 'Kurum' }
];
const demoRetry: Question = {
  id: 'demo-retry-uslu-01', track: 'LGS', topic: 'Üslü ifadeler · pekiştirme',
  prompt: 'Bir sayının 2⁵ katı 2⁹ ise bu sayı kaçtır?',
  options: [{id:'A',text:'2³'}, {id:'B',text:'2⁴'}, {id:'C',text:'2⁵'}, {id:'D',text:'2¹⁴'}],
  source: 'Kübik demo için hazırlanmış pekiştirme sorusu · resmî sınav sorusu değildir',
  verified: false
};
const demoYks: Question = {
  id: 'demo-yks-function-01', track: 'YKS', topic: 'Fonksiyonlar',
  prompt: 'f(x) = 3x − 2 olduğuna göre f(4) kaçtır?',
  options: [{id:'A',text:'8'}, {id:'B',text:'10'}, {id:'C',text:'12'}, {id:'D',text:'14'}],
  source: 'Kübik demo için hazırlanmış örnek · resmî YKS sorusu değildir',
  verified: false
};
const localAnswer: Record<string, { key: string; explanation: string; misconception: Record<string,string> }> = {
  'demo-retry-uslu-01': {
    key:'B', explanation:'2⁵ ile çarpıldığında 2⁹ elde ediliyorsa, aynı tabanlı üsleri bölme işleminde çıkarırız: 2⁹ ÷ 2⁵ = 2⁴.',
    misconception:{A:'Üsleri çıkarırken 9 − 5 işlemini yeniden kontrol et. Sonuç 4 olmalı.',C:'2⁵ sayının kendisi değil, onu çarptığımız katsayı. Bilinmeyeni bulmak için bölmeliyiz.',D:'Çarpma kuralını kullanmış olabilirsin; bilinmeyeni yalnız bırakmak için bölme yap.'}
  },
  'demo-yks-function-01': {
    key:'B', explanation:'f(4) demek, x yerine 4 yazmak demektir: 3 × 4 − 2 = 12 − 2 = 10.',
    misconception:{A:'3 × 4 = 12 adımından sonra 2 çıkarma adımını da yapmalısın.',C:'12 yalnızca 3 × 4 işleminin sonucu. Sonra 2 çıkarılır.',D:'İşlemde +2 yok; verilen ifade 3x − 2.'}
  }
};

function App() {
  const [track, setTrack] = useState<Track>('LGS');
  const [role, setRole] = useState<Role>('student');
  const [view, setView] = useState<View>('today');
  const [officialQuestion, setOfficialQuestion] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [retryMode, setRetryMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatItem[]>([{role:'assistant',text:'Merhaba! Nerede takıldığını birlikte bulalım. İstersen sorudaki bir adımı yazabilir ya da aşağıdaki kısa sorulardan biriyle başlayabilirsin.'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState<{hasGeminiKey:boolean} | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const student = students[track];

  useEffect(() => {
    fetch('/api/health').then(r=>r.json()).then(setHealth).catch(()=>setHealth(null));
  }, []);

  useEffect(() => {
    let alive = true;
    setQuestionLoading(true);
    setQuestion(null);
    setSelected(null); setSubmitted(false); setAnswerResult(null); setRetryMode(false);
    setChat([{role:'assistant',text:track === 'LGS'
      ? 'Bu soruyu hemen çözmek zorunda değilsin. Önce hangi kuralın gerektiğini bulalım; sonra birlikte adım adım ilerleriz.'
      : 'Fonksiyon sorularında ilk küçük adım, x yerine verilen sayıyı yazmaktır. İstersen bunu bir örnek üzerinde deneyelim.'}]);
    const load = async () => {
      try {
        const response = await fetch('/api/content/verified-question?studentId=' + student.id);
        const data = await response.json();
        if (!alive) return;
        if (track === 'LGS' && data.available && data.question) {
          const q = data.question;
          const mapped: Question = {
            id:q.id, track:'LGS', topic:q.topic, prompt:q.questionText,
            options:q.options.map((o:Option)=>({id:o.id,text:o.text})),
            source:q.sourceDocument, sourceUrl:q.sourceUrl,
            verified:q.verificationStatus === 'verified_official_publication',
            hints:q.pedagogicalHints
          };
          setOfficialQuestion(mapped); setQuestion(mapped);
        } else {
          setOfficialQuestion(null);
          setQuestion(track === 'LGS' ? demoRetry : demoYks);
        }
      } catch {
        if (!alive) return;
        setQuestion(track === 'LGS' ? demoRetry : demoYks);
        setNotice('Sunucuya ulaşılamadı. Şu an yalnızca yerel demo örneği gösteriliyor.');
      } finally {
        if (alive) { setQuestionLoading(false); loadProgress(); }
      }
    };
    const loadProgress = async () => {
      try {
        const r = await fetch('/api/student/progress?studentId=' + student.id);
        const d = await r.json();
        if (alive && r.ok && typeof d.progress?.currentMastery === 'number') setProgress(d.progress.currentMastery);
        else if (alive) setProgress(null);
      } catch { if (alive) setProgress(null); }
    };
    void load();
    return () => { alive = false; };
  }, [track, student.id]);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth',block:'end'}); }, [chat,chatLoading]);

  const mastery = progress ?? (track === 'LGS' ? 52 : 38);
  const nav: {id:View; label:string; hint:string; icon:typeof House}[] = [
    {id:'today',label:'Bugünüm',hint:'Günlük rota',icon:House},
    {id:'practice',label:'Soru atölyesi',hint:'Çöz ve öğren',icon:NotebookPen},
    {id:'coach',label:'AI çalışma arkadaşı',hint:'Takıldığın yerde',icon:MessageCircle},
    {id:'progress',label:'Gelişimim',hint:'Neler değişiyor?',icon:Activity}
  ];
  const changeTrack = (next:Track) => { setTrack(next); setRole('student'); setView('today'); setNotice(''); };
  const chooseView = (next:View) => { setView(next); setNotice(''); };

  const submitAnswer = async () => {
    if (!question || !selected || submitted) return;
    setSubmitted(true);
    const local = localAnswer[question.id];
    let correct = false;
    let explanation = '';
    let misconception = '';
    let repeated = false;
    if (question.verified && track === 'LGS') {
      try {
        const r = await fetch('/api/student/answer', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            studentId:student.id, topicId:'top_lgs_uslu', questionId:question.id,
            chosenOptionId:selected, hintsUsedCount:0, aiTutorInteractionsCount:chat.filter(x=>x.role==='user').length
          })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Yanıt kaydedilemedi.');
        correct = Boolean(d.isCorrect); repeated = Boolean(d.isRepeatedAttempt);
        explanation = d.officialSolution?.summary || d.explanation || 'Yanıt değerlendirildi.';
        const selectedIndex = question.options.findIndex(o=>o.id===selected);
        const hintIndex = selectedIndex === 0 ? 0 : Math.max(0, selectedIndex - 1);
        misconception = correct ? '' : (question.hints?.[hintIndex] || 'Önce ifadeleri aynı tabana çevirip üs kurallarını adım adım uygulayalım.');
        if (typeof d.updatedMastery?.currentMastery === 'number') setProgress(d.updatedMastery.currentMastery);
      } catch {
        setAnswerResult({
          correct: false,
          unverified: true,
          explanation: 'Sunucuya ulaşılamadığı için bu yanıt doğrulanamadı. Cevap anahtarını tahmin etmeyeceğiz ve ilerleme kaydı oluşturulmadı.',
          misconception: ''
        });
        return;
      }
    } else if (local) {
      correct = selected === local.key;
      explanation = local.explanation;
      misconception = correct ? '' : (local.misconception[selected] || 'İşlem adımlarını birer birer kontrol edelim.');
    } else {
      explanation = 'Bu örnek için cevap anahtarı doğrulanmadı. Öğretmenle birlikte kontrol etmek üzere işaretlendi.';
    }
    setAnswerResult({correct, explanation, misconception, repeated});
    if (!correct) setNotice('Hata bir sonuç değil, nereden devam edeceğimizi gösteren ipucu.');
  };

  const startRetry = () => {
    setQuestion(track === 'LGS' ? demoRetry : demoYks);
    setRetryMode(true); setSelected(null); setSubmitted(false); setAnswerResult(null);
    setView('practice'); setRole('student');
    setNotice('Pekiştirme sorusu açıldı. Bu soru demo için hazırlandı; resmî sınav sorusu değildir.');
  };

  const sendChat = async (message?:string) => {
    const text = (message ?? chatInput).trim();
    if (!text || chatLoading) return;
    setChatInput('');
    setChatError('');
    const next = [...chat,{role:'user' as const,text}];
    setChat(next); setChatLoading(true);
    try {
      const response = await fetch('/api/tutor/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          studentId:student.id,
          userMessage:text,
          chatHistory:next.slice(-8).map(m=>({role:m.role,content:m.text}))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI yanıtı alınamadı.');
      setChat(old=>[...old,{role:'assistant',text:data.reply}]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Bağlantı kurulamadı.';
      setChatError(messageText);
      const safeFallback = track === 'LGS'
        ? 'Şu anda canlı AI yanıtı alamadım. Yine de şu ilk adımı birlikte yapabiliriz: 8⁴ ifadesini 2 tabanında yaz. Çünkü 8 = 2³. Sonra üslerin üssü kuralını uygula. Bu, otomatik AI yanıtı değil; demo içindeki sabit ipucudur.'
        : 'Canlı AI yanıtı alınamadı. Fonksiyonlarda x yerine verilen sayıyı koyup işlem sırasıyla ilerleriz. Bu parkurda resmî soru içeriği henüz doğrulanmadı; bu yüzden örneği resmî soru diye sunmayacağım.';
      setChat(old=>[...old,{role:'assistant',text:safeFallback}]);
    } finally { setChatLoading(false); }
  };

  const resetPractice = () => {
    if (track === 'LGS' && officialQuestion) { setQuestion(officialQuestion); setRetryMode(false); }
    else { setQuestion(track === 'LGS' ? demoRetry : demoYks); setRetryMode(true); }
    setSelected(null); setSubmitted(false); setAnswerResult(null); setNotice('');
  };

  const renderStudent = () => {
    if (view === 'coach') return Coach();
    if (view === 'progress') return ProgressView();
    if (view === 'practice') return PracticeView();
    return TodayView();
  };

  function TodayView() {
    return <div className="page-stack">
      <section className="welcome-band">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="live-dot" /> BUGÜNÜN ÖĞRENME ROTASI</div>
          <h1>Selam {student.name.split(' ')[0]},<br/><span>küçük adımlar büyütür.</span></h1>
          <p>Bugün her şeyi bitirmek zorunda değilsin. Bir konuyu gerçekten anlamak yeterli.</p>
          <button className="button button-light" onClick={()=>chooseView('practice')}>İlk çalışmaya başla <ArrowRight size={16}/></button>
        </div>
        <div className="route-art" aria-hidden="true">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="orbit-core"><BrainCircuit size={38}/></div>
          <div className="orbit-tag tag-one"><Target size={15}/> 1 konu</div>
          <div className="orbit-tag tag-two"><CheckCircle2 size={15}/> 1 adım</div>
        </div>
      </section>
      <div className="section-heading"><div><span className="eyebrow muted">BUGÜN SANA ÖZEL</span><h2>Çalışma planın</h2></div><span className="quiet-pill"><CalendarDays size={14}/> Bugün · 20 dk</span></div>
      <section className="plan-grid">
        <button className="plan-card plan-main" onClick={()=>chooseView('practice')}>
          <div className="plan-icon indigo"><NotebookPen size={20}/></div><div className="plan-meta"><span>01 · MATEMATİK</span><span className="duration"><Clock3 size={13}/> 10 dk</span></div>
          <h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3><p>{track==='LGS'?'Üs kurallarını bir problemde kullan.':'Fonksiyon değerini adım adım hesapla.'}</p>
          <div className="plan-bottom"><span>Çalışmaya geç</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('coach')}>
          <div className="plan-icon mint"><MessageCircle size={20}/></div><div className="plan-meta"><span>02 · ANLAMA</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Takıldığın yeri sor</h3><p>Bir adımı anlamadıysan AI çalışma arkadaşıyla birlikte aç.</p>
          <div className="plan-bottom"><span>Soru sor</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('progress')}>
          <div className="plan-icon amber"><Activity size={20}/></div><div className="plan-meta"><span>03 · GERİ BAKIŞ</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Ne öğrendin?</h3><p>Yanıtlarını ve sıradaki küçük adımını gözden geçir.</p>
          <div className="plan-bottom"><span>Gelişimi gör</span><ArrowRight size={16}/></div>
        </button>
      </section>
      <div className="lower-grid">
        <section className="surface focus-panel"><div className="surface-heading"><div><span className="eyebrow muted">BU HAFTAKİ ODAĞIN</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="round-icon"><Target size={18}/></span></div>
          <p className="body-copy">Amaç sadece doğru cevabı bulmak değil; hangi kuralı neden kullandığını anlatabilmek.</p>
          <div className="mastery-line"><div><span>Örnek ilerleme göstergesi</span><strong>{mastery}%</strong></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Bu gösterge başlangıç demo değeridir; gerçek öğrenci başarısı değildir.':'Bu demo oturumunda sunucuya kaydedilen konu ilerlemesi.'}</small></div>
        </section>
        <section className="surface note-panel"><div className="note-icon"><Lightbulb size={20}/></div><span className="eyebrow muted">KÜÇÜK HATIRLATMA</span><h3>Hata yapmak, öğrenmenin bir parçası.</h3><p>Yanlış cevapta sadece sonucu değil, düşünme adımını da inceliyoruz.</p><button className="text-button" onClick={()=>chooseView('practice')}>Bir soruda dene <ArrowRight size={15}/></button></section>
      </div>
    </div>;
  }

  function PracticeView() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME ATÖLYESİ / MATEMATİK</span><h1>Çöz. Anla. Bir daha dene.</h1><p>Yanıtından sonra sadece doğru/yanlış değil, düşünme adımına dair geri bildirim alırsın.</p></div><span className="quiet-pill"><ShieldCheck size={14}/>{question?.verified?'Kaynağı doğrulanmış':'Demo örneği'}</span></div>
      {questionLoading || !question ? <div className="surface loading-surface"><div className="spinner"/><p>Soru hazırlanıyor…</p></div> :
      <div className="practice-layout">
        <section className="surface question-panel">
          <div className="question-top"><div className="topic-chip"><BookOpen size={14}/>{question.topic}</div><span className="question-count">{retryMode?'PEKİŞTİRME':'SORU 01'} / MATEMATİK</span></div>
          <h2>{question.prompt}</h2>
          <div className="option-list">{question.options.map((option,index)=><button key={option.id} disabled={submitted} className={'answer-option '+(selected===option.id?'selected ':'')+(submitted && answerResult && !answerResult.unverified && option.id=== (question.verified?'B':localAnswer[question.id]?.key)?'answer-correct ':'')+(submitted && selected===option.id && answerResult && !answerResult.correct && !answerResult.unverified?'answer-wrong':'')} onClick={()=>setSelected(option.id)}><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option.text.replace(/^[A-D]\)\s*/,'')}</span>{selected===option.id&&<span className="option-check"><Check size={15}/></span>}</button>)}</div>
          {!submitted ? <div className="question-actions"><span className="helper-text"><CircleHelp size={14}/> Takılırsan AI çalışma arkadaşına sorabilirsin.</span><button className="button button-primary" disabled={!selected} onClick={submitAnswer}>Yanıtımı kontrol et <ArrowRight size={16}/></button></div> :
          <div className={'feedback-panel '+(answerResult?.correct?'feedback-good':'feedback-try')}><div className="feedback-title">{answerResult?.correct?<CheckCircle2 size={19}/>:<Lightbulb size={19}/>}<div><strong>{answerResult?.unverified?'Yanıt henüz doğrulanamadı.':answerResult?.correct?'Evet, doğru düşünüyorsun.':'Burada bir düşünme adımını yeniden inceleyelim.'}</strong><span>{answerResult?.unverified?'Bağlantı geri geldiğinde yeniden deneyebilirsin.':answerResult?.correct?'Kuralı doğru uyguladın.':'Yanlış cevap bir ipucu; birlikte nerede ayrıldığını bulalım.'}</span></div></div>
            <TutorMessage text={answerResult?.correct ? answerResult.explanation : (answerResult?.misconception || answerResult?.explanation || '')} />
            {answerResult?.repeated&&<small>Bu soru daha önce kaydedilmiş. Tekrar çözüm yeni ilerleme olarak sayılmadı.</small>}
            <div className="feedback-actions"><button className="button button-primary" onClick={()=>{setView('coach');setChatInput('Bu soruda '+(answerResult?.correct?'hangi kuralı kullandığımı':'hangi adımda hata yapmış olabileceğimi')+' adım adım anlatır mısın?')}}><MessageCircle size={15}/> Birlikte incele</button><button className="button button-secondary" onClick={startRetry}>Benzer soru çöz <ArrowRight size={15}/></button></div>
          </div>}
          <div className="source-strip"><ShieldCheck size={15}/><div><strong>{question.verified?'Resmî kaynak bilgisi':'Örnek içerik'}</strong><span>{question.source}</span></div>{question.sourceUrl&&<a href={question.sourceUrl} target="_blank" rel="noreferrer">Kaynağı aç <ArrowUpRight size={13}/></a>}</div>
        </section>
        <aside className="practice-aside">
          <section className="surface aside-card"><div className="aside-heading"><span className="plan-icon mint"><BrainCircuit size={18}/></span><span className="eyebrow muted">ÖĞRENME YÖNTEMİ</span></div><h3>Sonucu değil, düşünme yolunu bul.</h3><ol className="step-list"><li className={submitted?'complete':''}><span>1</span><div><strong>Önce kendin dene</strong><small>İlk düşünceni seç.</small></div></li><li className={answerResult?'complete':''}><span>2</span><div><strong>Geri bildirimi incele</strong><small>Hangi adımın önemli olduğunu gör.</small></div></li><li><span>3</span><div><strong>Benzer soruda uygula</strong><small>Öğrenmeyi tekrar dene.</small></div></li></ol></section>
          <section className="surface aside-card ai-nudge"><span className="eyebrow muted">YARDIMA MI İHTİYACIN VAR?</span><p>“Neden bu işlemi yaptık?” diye sorabilirsin.</p><button className="text-button" onClick={()=>chooseView('coach')}>AI çalışma arkadaşına git <ArrowRight size={15}/></button></section>
        </aside>
      </div>}
    </div>;
  }

  function Coach() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME DESTEĞİ</span><h1>AI çalışma arkadaşın.</h1><p>Sana cevabı hemen vermek yerine düşünme adımlarını açmana yardım eder.</p></div><span className={'connection-pill '+(health?.hasGeminiKey?'connected':'not-connected')}><span/>{health?.hasGeminiKey?'Gemini bağlantısı hazır':health===null?'Bağlantı durumu bilinmiyor':'API anahtarı algılanmadı'}</span></div>
      <div className="coach-layout">
        <section className="surface chat-panel">
          <div className="chat-head"><div className="coach-avatar"><Sparkles size={20}/></div><div><strong>Kübik Öğrenme Rehberi</strong><span><span className="live-dot"/> Matematik · {student.grade}</span></div><span className="chat-safe"><ShieldCheck size={14}/> Öğrenme odaklı</span></div>
          <div className="chat-messages">{chat.map((item,i)=><div key={i} className={'message-row '+(item.role==='user'?'message-user':'')}><div className="message-avatar">{item.role==='user'?student.initials:<Sparkles size={15}/>}</div><div className="message-bubble"><span className="message-author">{item.role==='user'?'Sen':'Öğrenme rehberi'}</span><TutorMessage text={item.text}/></div></div>)}{chatLoading&&<div className="message-row"><div className="message-avatar"><Sparkles size={15}/></div><div className="message-bubble typing"><span/><span/><span/></div></div>}<div ref={chatEnd}/></div>
          {chatError&&<div className="chat-error"><CircleHelp size={14}/>{chatError} <span>Gösterilen sabit ipucu canlı AI yanıtı değildir.</span></div>}
          <div className="suggestion-row"><button onClick={()=>void sendChat(track==='LGS'?'Üslerin üssü kuralını basit bir örnekle açıklar mısın?':'Fonksiyonlarda x yerine değer yazmak ne demek?')}>{track==='LGS'?'Üslerin üssü kuralı':'Fonksiyon nedir?'}</button><button onClick={()=>void sendChat('Bana cevabı söylemeden bir ipucu verir misin?')}>Bir ipucu ver</button><button onClick={()=>void sendChat('Küçük bir örnek üzerinden anlatır mısın?')}>Örnekle anlat</button></div>
          <form className="chat-composer" onSubmit={e=>{e.preventDefault();void sendChat();}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Takıldığın adımı buraya yaz…" aria-label="AI çalışma arkadaşına mesaj"/><button className="send-button" type="submit" disabled={!chatInput.trim()||chatLoading} aria-label="Mesajı gönder"><Send size={17}/></button></form>
          <p className="chat-disclaimer">AI yanıtları hata içerebilir. Önemli akademik kararlar için öğretmeninle kontrol et.</p>
        </section>
        <aside className="surface coach-context"><span className="eyebrow muted">ÇALIŞMA BAĞLAMI</span><h3>Bugünkü konun</h3><div className="context-topic"><div className="plan-icon indigo"><BookOpen size={18}/></div><div><strong>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</strong><span>Matematik · {student.grade}</span></div></div><div className="context-divider"/><span className="eyebrow muted">İSTERSEN ŞUNU SOR</span><button className="prompt-card" onClick={()=>setChatInput('Bu konuyu 3 kısa adımda anlatır mısın?')}>Bu konuyu 3 kısa adımda anlat <ArrowRight size={15}/></button><button className="prompt-card" onClick={()=>setChatInput('Yanlış cevabım hangi düşünce hatasından kaynaklanmış olabilir?')}>Yanlışım ne anlatıyor olabilir? <ArrowRight size={15}/></button><div className="teacher-note"><Lightbulb size={16}/><p>Bir soruda uzun süre takılırsan, öğretmeninden destek istemek de iyi bir öğrenme adımıdır.</p></div></aside>
      </div>
    </div>;
  }

  function ProgressView() {
    return <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KENDİ GELİŞİMİNİ İZLE</span><h1>Her doğru adım bir iz bırakır.</h1><p>Bu görünüm, demo oturumunda kaydedilen yanıtları ve sıradaki çalışma önerisini bir araya getirir.</p></div></div>
      <div className="progress-overview"><section className="surface mastery-card"><span className="eyebrow muted">KONU İLERLEMESİ</span><div className="mastery-number">{mastery}<small>%</small></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><p>{progress===null?'Başlangıç göstergesi · gerçek öğrenci verisi değildir.':'Sunucu tarafında kayıtlı demo konu ilerlemesi.'}</p></section><section className="surface next-step-card"><div className="plan-icon amber"><Target size={19}/></div><span className="eyebrow muted">ÖNERİLEN SONRAKİ ADIM</span><h3>{answerResult&&!answerResult.correct?'Bu adımı yeniden çalış':'Benzer bir soruda kuralı uygula'}</h3><p>{answerResult&&!answerResult.correct?'Yanlış seçeneğin hangi düşünceyi işaret ettiğini AI çalışma arkadaşıyla incele.':'Aynı kazanımı farklı bir örnekte kullanarak gerçekten anladığını kontrol et.'}</p><button className="button button-primary" onClick={startRetry}>Bir soru daha çöz <ArrowRight size={15}/></button></section></div>
      <section className="surface reflection-card"><div className="surface-heading"><div><span className="eyebrow muted">KISA ÖZ DEĞERLENDİRME</span><h3>Bugün kendine sor</h3></div><span className="round-icon"><Lightbulb size={18}/></span></div><div className="reflection-list"><div><span>01</span><p>Hangi kuralı kullandım, neden?</p><button onClick={()=>{setView('coach');setChatInput('Bugünkü soruda hangi kuralı neden kullandığımı anlamama yardım et.')}}>Birlikte düşün <ArrowRight size={14}/></button></div><div><span>02</span><p>Benzer bir soruda tek başıma deneyebilir miyim?</p><button onClick={startRetry}>Kendimi dene <ArrowRight size={14}/></button></div><div><span>03</span><p>Hangi adım için öğretmen desteğine ihtiyacım var?</p><button onClick={()=>setNotice('Öğretmen görünümünde bu konu için destek notu gösteriliyor.')}>Not al <ArrowRight size={14}/></button></div></div></section>
    </div>;
  }

  const renderTeacher = () => <div className="page-stack">
    <div className="page-intro"><div><span className="eyebrow muted">ÖĞRETMEN ÇALIŞMA ALANI</span><h1>Öğrencinin takıldığı yeri görün.</h1><p>Öğrenme verisini bir sonraki öğretmen müdahalesine dönüştüren sade görünüm.</p></div><span className="quiet-pill"><Users size={14}/> Demo öğrenci: {student.name}</span></div>
    <section className="teacher-student-banner"><div className="student-avatar large">{student.initials}</div><div className="teacher-student-copy"><span className="eyebrow">ÖĞRENCİ KARTI · DEMO</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><button className="button button-light" onClick={()=>{setRole('student');setView('practice')}}>Öğrenci akışını aç <ArrowRight size={15}/></button></section>
    <div className="teacher-grid"><section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">KONU DURUMU</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="topic-chip"><Activity size={14}/> {progress===null?'Demo': 'Kayıtlı'}</span></div><div className="teacher-mastery"><strong>{mastery}%</strong><div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Başlangıç örneği; henüz kayıtlı sonuç yok.':'Öğrenci oturumunda kaydedilen konu göstergesi.'}</small></div></div><div className="signal-row"><div className="signal-icon amber"><Lightbulb size={17}/></div><div><strong>Öğretmen için olası müdahale</strong><p>{answerResult&&!answerResult.correct?'Üs kurallarında aynı tabana çevirme adımını kısa bir örnekle tekrar edin.':'Öğrenciden kullandığı kuralı kendi cümleleriyle açıklamasını isteyin.'}</p></div></div></section>
    <section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">OTURUM ÖZETİ</span><h3>Bu çalışmada</h3></div><span className="round-icon"><NotebookPen size={17}/></span></div><div className="session-stat"><span>Yanıt durumu</span><strong>{submitted?(answerResult?.correct?'Doğru':'Tekrar gerekli'):'Henüz yanıtlanmadı'}</strong></div><div className="session-stat"><span>AI destek etkileşimi</span><strong>{chat.filter(x=>x.role==='user').length} mesaj</strong></div><div className="session-stat"><span>İçerik kaynağı</span><strong>{question?.verified?'MEB · doğrulanmış':'Demo örneği'}</strong></div><button className="button button-secondary full-button" onClick={()=>{setRole('student');setView('coach')}}>Öğrenciyle aynı konuyu incele <ArrowRight size={15}/></button></section></div>
    <section className="surface teacher-next"><div className="plan-icon mint"><MessageCircle size={18}/></div><div><span className="eyebrow muted">ÖNERİLEN ÖĞRETMEN NOTU</span><h3>“Sonucu nasıl bulduğunu anlatır mısın?”</h3><p>Öğrencinin yalnızca doğru cevabı değil, kullandığı düşünme yolunu da açıklamasını isteyin.</p></div><button className="text-button" onClick={()=>setNotice('Öğretmen notu bu demo oturumu için seçildi.')}>Notu seç <Check size={15}/></button></section>
  </div>;

  const renderParent = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">VELİ GÖRÜNÜMÜ</span><h1>Gelişimi anlaşılır şekilde takip edin.</h1><p>Notlardan çok, çalışma rutini ve bir sonraki destek adımına odaklanın.</p></div></div>
    <section className="parent-summary surface"><div className="student-avatar large">{student.initials}</div><div className="parent-child"><span className="eyebrow muted">ÖĞRENCİ</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><div className="parent-progress"><span>Konu ilerleme göstergesi</span><strong>{mastery}%</strong><div className="progress-track"><span style={{width:mastery+'%'}}/></div></div></section>
    <div className="parent-grid"><section className="surface"><span className="eyebrow muted">BU OTURUMDA</span><h3>{submitted?'Bir soru üzerinde çalıştı':'Çalışma sırasındaki adım'}</h3><p>{submitted?'Yanıt sonrası açıklama ve tekrar önerisi sunuldu.':'Bir soruyu kendi başına denemesi ve ardından açıklamayı incelemesi planlandı.'}</p><div className="parent-step"><CheckCircle2 size={17}/><span>Önce kendi başına deneme</span></div><div className="parent-step"><CheckCircle2 size={17}/><span>Yanlışın nedenini anlama</span></div><div className="parent-step"><Clock3 size={17}/><span>Benzer soruyla pekiştirme</span></div></section><section className="surface parent-advice"><div className="plan-icon amber"><Lightbulb size={18}/></div><span className="eyebrow muted">EVDE DESTEK İÇİN</span><h3>“Bugün neyi farklı anladın?”</h3><p>Doğru sayısını sormak yerine, öğrendiği kuralı kendi cümleleriyle anlatmasını isteyin.</p><button className="button button-secondary" onClick={()=>{setRole('student');setView('progress')}}>Gelişim görünümünü aç <ArrowRight size={15}/></button></section></div>
  </div>;

  const renderCenter = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KÜBİK · KURUM GÖRÜNÜMÜ</span><h1>Eğitim sürecini görünür kılın.</h1><p>Bu demo, bireysel öğrenme döngüsünün kurum içindeki karşılığını gösterir. Gerçek kurum verisi içermez.</p></div></div>
    <div className="center-metrics"><section className="surface"><span className="metric-label">AKTİF DEMO ÖĞRENCİ</span><strong>01</strong><small>Sunum senaryosu · gerçek kayıt sayısı değil</small></section><section className="surface"><span className="metric-label">ÖĞRENME DÖNGÜSÜ</span><strong>{submitted?'3 / 3':'1 / 3'}</strong><small>{submitted?'Yanıt ve geri bildirim gösterildi.':'Yanıt bekleniyor; akış canlı denenebilir.'}</small></section><section className="surface"><span className="metric-label">AI BAĞLANTISI</span><strong>{health?.hasGeminiKey?'Hazır':'Kontrol gerekli'}</strong><small>API anahtarı sunucu tarafından kontrol edilir.</small></section></div>
    <section className="surface center-flow"><div className="surface-heading"><div><span className="eyebrow muted">ÜRÜNÜN TEMEL DÖNGÜSÜ</span><h3>Tek akış, dört rol</h3></div><span className="round-icon"><Activity size={18}/></span></div><div className="flow-steps"><div><span>01</span><BookOpen size={20}/><strong>Öğrenci çalışır</strong><p>Soru ve yanıt</p></div><ArrowRight/><div><span>02</span><BrainCircuit size={20}/><strong>Geri bildirim</strong><p>Hata nedeni ve ipucu</p></div><ArrowRight/><div><span>03</span><Users size={20}/><strong>Öğretmen görür</strong><p>Müdahale önerisi</p></div><ArrowRight/><div><span>04</span><Activity size={20}/><strong>İlerleme izlenir</strong><p>Ortak kayıt</p></div></div></section>
    <section className="surface center-next"><div><span className="eyebrow muted">ÜRÜN KEŞFİ İÇİN SONRAKİ ADIM</span><h3>Önce Kubik’in gerçek sürecini tanımlayalım.</h3><p>Öğrenci grupları, öğretmen iş akışı, mevcut dijital araçlar ve veli iletişimi sahipleriyle birlikte doğrulanmalı. Bu demo üretim sistemi veya gelir tahmini değildir.</p></div><button className="button button-primary" onClick={()=>setNotice('Keşif gündemi: öğrenci akışı, öğretmen müdahalesi, veli iletişimi ve ölçülebilir kazanımlar.')}>Keşif gündemini göster <ArrowRight size={15}/></button></section>
  </div>;

  return <div className="product-shell">
    <header className="topbar"><button className="brand" onClick={()=>{setRole('student');setView('today')}} aria-label="Kübik ana sayfa"><span className="brand-symbol"><span/><span/><span/><span/></span><span className="brand-word">kübik<span>+</span><small>ÖĞRENME ATÖLYESİ</small></span></button>
      <div className="topbar-center"><span className="demo-status"/><span>ÜRÜN DENEYİMİ</span><span className="topbar-separator">/</span><span>{role==='student'?'ÖĞRENCİ ROTASI':role==='teacher'?'ÖĞRETMEN MASASI':role==='parent'?'VELİ ÖZETİ':'KURUM PERSPEKTİFİ'}</span></div>
      <div className="topbar-actions"><div className="track-switch"><button className={track==='LGS'?'active':''} onClick={()=>changeTrack('LGS')}>LGS</button><button className={track==='YKS'?'active':''} onClick={()=>changeTrack('YKS')}>YKS</button></div><div className="user-chip"><span className="student-avatar">{student.initials}</span><span><strong>{student.name}</strong><small>{student.grade}</small></span><ChevronDown size={14}/></div></div>
    </header>
    <div className="app-frame"><aside className="sidebar"><div className="sidebar-label">ÇALIŞMA ALANI</div><div className="nav-list">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={'nav-item '+(role==='student'&&view===item.id?'active':'')} onClick={()=>{setRole('student');chooseView(item.id)}}><span className="nav-icon"><Icon size={18}/></span><span className="nav-text"><strong>{item.label}</strong><small>{item.hint}</small></span>{role==='student'&&view===item.id&&<span className="nav-active-dot"/>}</button>})}</div><div className="sidebar-divider"/><div className="sidebar-label">AYNI ÖĞRENME, FARKLI BAKIŞ</div><div className="role-list">{roles.filter(r=>r.id!=='student').map(r=><button key={r.id} className={'role-item '+(role===r.id?'active':'')} onClick={()=>setRole(r.id)}><span className="role-avatar">{r.id==='teacher'?<GraduationCap size={17}/>:r.id==='parent'?<Users size={17}/>:<Activity size={17}/>}</span><span>{r.label}</span><ChevronRight size={15}/></button>)}</div><div className="sidebar-bottom"><div className="privacy-mark"><ShieldCheck size={16}/><span><strong>Güvenilir öğrenme</strong><small>Demo · gerçek öğrenci hesabı değil</small></span></div><button className="help-link" onClick={()=>setNotice('Bu demo, Kubik ile birlikte doğrulanacak bir ürün fikridir; üretim sistemi değildir.')}>Bu demo hakkında <CircleHelp size={14}/></button></div></aside>
      <main className="main-area"><div className="mobile-track-note"><span className="live-dot"/> {student.goal} <span>· Demo profili</span></div>{notice&&<div className="notice-bar"><Lightbulb size={16}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Bildirimi kapat"><X size={15}/></button></div>}
        {role==='student'?renderStudent():role==='teacher'?renderTeacher():role==='parent'?renderParent():renderCenter()}
        <footer className="app-footer"><span>kübik+ <i>·</i> Öğrenme atölyesi</span><span><ShieldCheck size={13}/> Demo içerikleri açıkça etiketlenmiştir</span></footer>
      </main>
    </div>
  </div>;
}

export default App;
)
    .replace(/\\\\\\)/g, () => '
type Role = 'student' | 'teacher' | 'parent' | 'center';
type View = 'today' | 'practice' | 'coach' | 'progress';
type ChatItem = { role: 'user' | 'assistant'; text: string };
type AnswerResult = { correct: boolean; explanation: string; misconception?: string; repeated?: boolean; unverified?: boolean };
type Option = { id: string; text: string };
type Question = {
  id: string; track: Track; topic: string; prompt: string; options: Option[];
  source: string; sourceUrl?: string; verified: boolean; hints?: string[];
};
const students: Record<Track, { id: string; name: string; grade: string; goal: string; initials: string }> = {
  LGS: { id: 'std_lgs_801', name: 'Kerem Demir', grade: '8. sınıf', goal: 'LGS · Matematik', initials: 'KD' },
  YKS: { id: 'std_yks_1101', name: 'Selin Yılmaz', grade: '11. sınıf', goal: 'YKS · Matematik', initials: 'SY' }
};
const roles: { id: Role; label: string }[] = [
  { id: 'student', label: 'Öğrenci' }, { id: 'teacher', label: 'Öğretmen' },
  { id: 'parent', label: 'Veli' }, { id: 'center', label: 'Kurum' }
];
const demoRetry: Question = {
  id: 'demo-retry-uslu-01', track: 'LGS', topic: 'Üslü ifadeler · pekiştirme',
  prompt: 'Bir sayının 2⁵ katı 2⁹ ise bu sayı kaçtır?',
  options: [{id:'A',text:'2³'}, {id:'B',text:'2⁴'}, {id:'C',text:'2⁵'}, {id:'D',text:'2¹⁴'}],
  source: 'Kübik demo için hazırlanmış pekiştirme sorusu · resmî sınav sorusu değildir',
  verified: false
};
const demoYks: Question = {
  id: 'demo-yks-function-01', track: 'YKS', topic: 'Fonksiyonlar',
  prompt: 'f(x) = 3x − 2 olduğuna göre f(4) kaçtır?',
  options: [{id:'A',text:'8'}, {id:'B',text:'10'}, {id:'C',text:'12'}, {id:'D',text:'14'}],
  source: 'Kübik demo için hazırlanmış örnek · resmî YKS sorusu değildir',
  verified: false
};
const localAnswer: Record<string, { key: string; explanation: string; misconception: Record<string,string> }> = {
  'demo-retry-uslu-01': {
    key:'B', explanation:'2⁵ ile çarpıldığında 2⁹ elde ediliyorsa, aynı tabanlı üsleri bölme işleminde çıkarırız: 2⁹ ÷ 2⁵ = 2⁴.',
    misconception:{A:'Üsleri çıkarırken 9 − 5 işlemini yeniden kontrol et. Sonuç 4 olmalı.',C:'2⁵ sayının kendisi değil, onu çarptığımız katsayı. Bilinmeyeni bulmak için bölmeliyiz.',D:'Çarpma kuralını kullanmış olabilirsin; bilinmeyeni yalnız bırakmak için bölme yap.'}
  },
  'demo-yks-function-01': {
    key:'B', explanation:'f(4) demek, x yerine 4 yazmak demektir: 3 × 4 − 2 = 12 − 2 = 10.',
    misconception:{A:'3 × 4 = 12 adımından sonra 2 çıkarma adımını da yapmalısın.',C:'12 yalnızca 3 × 4 işleminin sonucu. Sonra 2 çıkarılır.',D:'İşlemde +2 yok; verilen ifade 3x − 2.'}
  }
};

function App() {
  const [track, setTrack] = useState<Track>('LGS');
  const [role, setRole] = useState<Role>('student');
  const [view, setView] = useState<View>('today');
  const [officialQuestion, setOfficialQuestion] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [retryMode, setRetryMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatItem[]>([{role:'assistant',text:'Merhaba! Nerede takıldığını birlikte bulalım. İstersen sorudaki bir adımı yazabilir ya da aşağıdaki kısa sorulardan biriyle başlayabilirsin.'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState<{hasGeminiKey:boolean} | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const student = students[track];

  useEffect(() => {
    fetch('/api/health').then(r=>r.json()).then(setHealth).catch(()=>setHealth(null));
  }, []);

  useEffect(() => {
    let alive = true;
    setQuestionLoading(true);
    setQuestion(null);
    setSelected(null); setSubmitted(false); setAnswerResult(null); setRetryMode(false);
    setChat([{role:'assistant',text:track === 'LGS'
      ? 'Bu soruyu hemen çözmek zorunda değilsin. Önce hangi kuralın gerektiğini bulalım; sonra birlikte adım adım ilerleriz.'
      : 'Fonksiyon sorularında ilk küçük adım, x yerine verilen sayıyı yazmaktır. İstersen bunu bir örnek üzerinde deneyelim.'}]);
    const load = async () => {
      try {
        const response = await fetch('/api/content/verified-question?studentId=' + student.id);
        const data = await response.json();
        if (!alive) return;
        if (track === 'LGS' && data.available && data.question) {
          const q = data.question;
          const mapped: Question = {
            id:q.id, track:'LGS', topic:q.topic, prompt:q.questionText,
            options:q.options.map((o:Option)=>({id:o.id,text:o.text})),
            source:q.sourceDocument, sourceUrl:q.sourceUrl,
            verified:q.verificationStatus === 'verified_official_publication',
            hints:q.pedagogicalHints
          };
          setOfficialQuestion(mapped); setQuestion(mapped);
        } else {
          setOfficialQuestion(null);
          setQuestion(track === 'LGS' ? demoRetry : demoYks);
        }
      } catch {
        if (!alive) return;
        setQuestion(track === 'LGS' ? demoRetry : demoYks);
        setNotice('Sunucuya ulaşılamadı. Şu an yalnızca yerel demo örneği gösteriliyor.');
      } finally {
        if (alive) { setQuestionLoading(false); loadProgress(); }
      }
    };
    const loadProgress = async () => {
      try {
        const r = await fetch('/api/student/progress?studentId=' + student.id);
        const d = await r.json();
        if (alive && r.ok && typeof d.progress?.currentMastery === 'number') setProgress(d.progress.currentMastery);
        else if (alive) setProgress(null);
      } catch { if (alive) setProgress(null); }
    };
    void load();
    return () => { alive = false; };
  }, [track, student.id]);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth',block:'end'}); }, [chat,chatLoading]);

  const mastery = progress ?? (track === 'LGS' ? 52 : 38);
  const nav: {id:View; label:string; hint:string; icon:typeof House}[] = [
    {id:'today',label:'Bugünüm',hint:'Günlük rota',icon:House},
    {id:'practice',label:'Soru atölyesi',hint:'Çöz ve öğren',icon:NotebookPen},
    {id:'coach',label:'AI çalışma arkadaşı',hint:'Takıldığın yerde',icon:MessageCircle},
    {id:'progress',label:'Gelişimim',hint:'Neler değişiyor?',icon:Activity}
  ];
  const changeTrack = (next:Track) => { setTrack(next); setRole('student'); setView('today'); setNotice(''); };
  const chooseView = (next:View) => { setView(next); setNotice(''); };

  const submitAnswer = async () => {
    if (!question || !selected || submitted) return;
    setSubmitted(true);
    const local = localAnswer[question.id];
    let correct = false;
    let explanation = '';
    let misconception = '';
    let repeated = false;
    if (question.verified && track === 'LGS') {
      try {
        const r = await fetch('/api/student/answer', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            studentId:student.id, topicId:'top_lgs_uslu', questionId:question.id,
            chosenOptionId:selected, hintsUsedCount:0, aiTutorInteractionsCount:chat.filter(x=>x.role==='user').length
          })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Yanıt kaydedilemedi.');
        correct = Boolean(d.isCorrect); repeated = Boolean(d.isRepeatedAttempt);
        explanation = d.officialSolution?.summary || d.explanation || 'Yanıt değerlendirildi.';
        const selectedIndex = question.options.findIndex(o=>o.id===selected);
        const hintIndex = selectedIndex === 0 ? 0 : Math.max(0, selectedIndex - 1);
        misconception = correct ? '' : (question.hints?.[hintIndex] || 'Önce ifadeleri aynı tabana çevirip üs kurallarını adım adım uygulayalım.');
        if (typeof d.updatedMastery?.currentMastery === 'number') setProgress(d.updatedMastery.currentMastery);
      } catch {
        setAnswerResult({
          correct: false,
          unverified: true,
          explanation: 'Sunucuya ulaşılamadığı için bu yanıt doğrulanamadı. Cevap anahtarını tahmin etmeyeceğiz ve ilerleme kaydı oluşturulmadı.',
          misconception: ''
        });
        return;
      }
    } else if (local) {
      correct = selected === local.key;
      explanation = local.explanation;
      misconception = correct ? '' : (local.misconception[selected] || 'İşlem adımlarını birer birer kontrol edelim.');
    } else {
      explanation = 'Bu örnek için cevap anahtarı doğrulanmadı. Öğretmenle birlikte kontrol etmek üzere işaretlendi.';
    }
    setAnswerResult({correct, explanation, misconception, repeated});
    if (!correct) setNotice('Hata bir sonuç değil, nereden devam edeceğimizi gösteren ipucu.');
  };

  const startRetry = () => {
    setQuestion(track === 'LGS' ? demoRetry : demoYks);
    setRetryMode(true); setSelected(null); setSubmitted(false); setAnswerResult(null);
    setView('practice'); setRole('student');
    setNotice('Pekiştirme sorusu açıldı. Bu soru demo için hazırlandı; resmî sınav sorusu değildir.');
  };

  const sendChat = async (message?:string) => {
    const text = (message ?? chatInput).trim();
    if (!text || chatLoading) return;
    setChatInput('');
    setChatError('');
    const next = [...chat,{role:'user' as const,text}];
    setChat(next); setChatLoading(true);
    try {
      const response = await fetch('/api/tutor/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          studentId:student.id,
          userMessage:text,
          chatHistory:next.slice(-8).map(m=>({role:m.role,content:m.text}))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI yanıtı alınamadı.');
      setChat(old=>[...old,{role:'assistant',text:data.reply}]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Bağlantı kurulamadı.';
      setChatError(messageText);
      const safeFallback = track === 'LGS'
        ? 'Şu anda canlı AI yanıtı alamadım. Yine de şu ilk adımı birlikte yapabiliriz: 8⁴ ifadesini 2 tabanında yaz. Çünkü 8 = 2³. Sonra üslerin üssü kuralını uygula. Bu, otomatik AI yanıtı değil; demo içindeki sabit ipucudur.'
        : 'Canlı AI yanıtı alınamadı. Fonksiyonlarda x yerine verilen sayıyı koyup işlem sırasıyla ilerleriz. Bu parkurda resmî soru içeriği henüz doğrulanmadı; bu yüzden örneği resmî soru diye sunmayacağım.';
      setChat(old=>[...old,{role:'assistant',text:safeFallback}]);
    } finally { setChatLoading(false); }
  };

  const resetPractice = () => {
    if (track === 'LGS' && officialQuestion) { setQuestion(officialQuestion); setRetryMode(false); }
    else { setQuestion(track === 'LGS' ? demoRetry : demoYks); setRetryMode(true); }
    setSelected(null); setSubmitted(false); setAnswerResult(null); setNotice('');
  };

  const renderStudent = () => {
    if (view === 'coach') return Coach();
    if (view === 'progress') return ProgressView();
    if (view === 'practice') return PracticeView();
    return TodayView();
  };

  function TodayView() {
    return <div className="page-stack">
      <section className="welcome-band">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="live-dot" /> BUGÜNÜN ÖĞRENME ROTASI</div>
          <h1>Selam {student.name.split(' ')[0]},<br/><span>küçük adımlar büyütür.</span></h1>
          <p>Bugün her şeyi bitirmek zorunda değilsin. Bir konuyu gerçekten anlamak yeterli.</p>
          <button className="button button-light" onClick={()=>chooseView('practice')}>İlk çalışmaya başla <ArrowRight size={16}/></button>
        </div>
        <div className="route-art" aria-hidden="true">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="orbit-core"><BrainCircuit size={38}/></div>
          <div className="orbit-tag tag-one"><Target size={15}/> 1 konu</div>
          <div className="orbit-tag tag-two"><CheckCircle2 size={15}/> 1 adım</div>
        </div>
      </section>
      <div className="section-heading"><div><span className="eyebrow muted">BUGÜN SANA ÖZEL</span><h2>Çalışma planın</h2></div><span className="quiet-pill"><CalendarDays size={14}/> Bugün · 20 dk</span></div>
      <section className="plan-grid">
        <button className="plan-card plan-main" onClick={()=>chooseView('practice')}>
          <div className="plan-icon indigo"><NotebookPen size={20}/></div><div className="plan-meta"><span>01 · MATEMATİK</span><span className="duration"><Clock3 size={13}/> 10 dk</span></div>
          <h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3><p>{track==='LGS'?'Üs kurallarını bir problemde kullan.':'Fonksiyon değerini adım adım hesapla.'}</p>
          <div className="plan-bottom"><span>Çalışmaya geç</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('coach')}>
          <div className="plan-icon mint"><MessageCircle size={20}/></div><div className="plan-meta"><span>02 · ANLAMA</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Takıldığın yeri sor</h3><p>Bir adımı anlamadıysan AI çalışma arkadaşıyla birlikte aç.</p>
          <div className="plan-bottom"><span>Soru sor</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('progress')}>
          <div className="plan-icon amber"><Activity size={20}/></div><div className="plan-meta"><span>03 · GERİ BAKIŞ</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Ne öğrendin?</h3><p>Yanıtlarını ve sıradaki küçük adımını gözden geçir.</p>
          <div className="plan-bottom"><span>Gelişimi gör</span><ArrowRight size={16}/></div>
        </button>
      </section>
      <div className="lower-grid">
        <section className="surface focus-panel"><div className="surface-heading"><div><span className="eyebrow muted">BU HAFTAKİ ODAĞIN</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="round-icon"><Target size={18}/></span></div>
          <p className="body-copy">Amaç sadece doğru cevabı bulmak değil; hangi kuralı neden kullandığını anlatabilmek.</p>
          <div className="mastery-line"><div><span>Örnek ilerleme göstergesi</span><strong>{mastery}%</strong></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Bu gösterge başlangıç demo değeridir; gerçek öğrenci başarısı değildir.':'Bu demo oturumunda sunucuya kaydedilen konu ilerlemesi.'}</small></div>
        </section>
        <section className="surface note-panel"><div className="note-icon"><Lightbulb size={20}/></div><span className="eyebrow muted">KÜÇÜK HATIRLATMA</span><h3>Hata yapmak, öğrenmenin bir parçası.</h3><p>Yanlış cevapta sadece sonucu değil, düşünme adımını da inceliyoruz.</p><button className="text-button" onClick={()=>chooseView('practice')}>Bir soruda dene <ArrowRight size={15}/></button></section>
      </div>
    </div>;
  }

  function PracticeView() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME ATÖLYESİ / MATEMATİK</span><h1>Çöz. Anla. Bir daha dene.</h1><p>Yanıtından sonra sadece doğru/yanlış değil, düşünme adımına dair geri bildirim alırsın.</p></div><span className="quiet-pill"><ShieldCheck size={14}/>{question?.verified?'Kaynağı doğrulanmış':'Demo örneği'}</span></div>
      {questionLoading || !question ? <div className="surface loading-surface"><div className="spinner"/><p>Soru hazırlanıyor…</p></div> :
      <div className="practice-layout">
        <section className="surface question-panel">
          <div className="question-top"><div className="topic-chip"><BookOpen size={14}/>{question.topic}</div><span className="question-count">{retryMode?'PEKİŞTİRME':'SORU 01'} / MATEMATİK</span></div>
          <h2>{question.prompt}</h2>
          <div className="option-list">{question.options.map((option,index)=><button key={option.id} disabled={submitted} className={'answer-option '+(selected===option.id?'selected ':'')+(submitted && answerResult && !answerResult.unverified && option.id=== (question.verified?'B':localAnswer[question.id]?.key)?'answer-correct ':'')+(submitted && selected===option.id && answerResult && !answerResult.correct && !answerResult.unverified?'answer-wrong':'')} onClick={()=>setSelected(option.id)}><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option.text.replace(/^[A-D]\)\s*/,'')}</span>{selected===option.id&&<span className="option-check"><Check size={15}/></span>}</button>)}</div>
          {!submitted ? <div className="question-actions"><span className="helper-text"><CircleHelp size={14}/> Takılırsan AI çalışma arkadaşına sorabilirsin.</span><button className="button button-primary" disabled={!selected} onClick={submitAnswer}>Yanıtımı kontrol et <ArrowRight size={16}/></button></div> :
          <div className={'feedback-panel '+(answerResult?.correct?'feedback-good':'feedback-try')}><div className="feedback-title">{answerResult?.correct?<CheckCircle2 size={19}/>:<Lightbulb size={19}/>}<div><strong>{answerResult?.unverified?'Yanıt henüz doğrulanamadı.':answerResult?.correct?'Evet, doğru düşünüyorsun.':'Burada bir düşünme adımını yeniden inceleyelim.'}</strong><span>{answerResult?.unverified?'Bağlantı geri geldiğinde yeniden deneyebilirsin.':answerResult?.correct?'Kuralı doğru uyguladın.':'Yanlış cevap bir ipucu; birlikte nerede ayrıldığını bulalım.'}</span></div></div>
            <p>{answerResult?.correct?answerResult.explanation:(answerResult?.misconception||answerResult?.explanation)}</p>
            {answerResult?.repeated&&<small>Bu soru daha önce kaydedilmiş. Tekrar çözüm yeni ilerleme olarak sayılmadı.</small>}
            <div className="feedback-actions"><button className="button button-primary" onClick={()=>{setView('coach');setChatInput('Bu soruda '+(answerResult?.correct?'hangi kuralı kullandığımı':'hangi adımda hata yapmış olabileceğimi')+' adım adım anlatır mısın?')}}><MessageCircle size={15}/> Birlikte incele</button><button className="button button-secondary" onClick={startRetry}>Benzer soru çöz <ArrowRight size={15}/></button></div>
          </div>}
          <div className="source-strip"><ShieldCheck size={15}/><div><strong>{question.verified?'Resmî kaynak bilgisi':'Örnek içerik'}</strong><span>{question.source}</span></div>{question.sourceUrl&&<a href={question.sourceUrl} target="_blank" rel="noreferrer">Kaynağı aç <ArrowUpRight size={13}/></a>}</div>
        </section>
        <aside className="practice-aside">
          <section className="surface aside-card"><div className="aside-heading"><span className="plan-icon mint"><BrainCircuit size={18}/></span><span className="eyebrow muted">ÖĞRENME YÖNTEMİ</span></div><h3>Sonucu değil, düşünme yolunu bul.</h3><ol className="step-list"><li className={submitted?'complete':''}><span>1</span><div><strong>Önce kendin dene</strong><small>İlk düşünceni seç.</small></div></li><li className={answerResult?'complete':''}><span>2</span><div><strong>Geri bildirimi incele</strong><small>Hangi adımın önemli olduğunu gör.</small></div></li><li><span>3</span><div><strong>Benzer soruda uygula</strong><small>Öğrenmeyi tekrar dene.</small></div></li></ol></section>
          <section className="surface aside-card ai-nudge"><span className="eyebrow muted">YARDIMA MI İHTİYACIN VAR?</span><p>“Neden bu işlemi yaptık?” diye sorabilirsin.</p><button className="text-button" onClick={()=>chooseView('coach')}>AI çalışma arkadaşına git <ArrowRight size={15}/></button></section>
        </aside>
      </div>}
    </div>;
  }

  function Coach() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME DESTEĞİ</span><h1>AI çalışma arkadaşın.</h1><p>Sana cevabı hemen vermek yerine düşünme adımlarını açmana yardım eder.</p></div><span className={'connection-pill '+(health?.hasGeminiKey?'connected':'not-connected')}><span/>{health?.hasGeminiKey?'Gemini bağlantısı hazır':health===null?'Bağlantı durumu bilinmiyor':'API anahtarı algılanmadı'}</span></div>
      <div className="coach-layout">
        <section className="surface chat-panel">
          <div className="chat-head"><div className="coach-avatar"><Sparkles size={20}/></div><div><strong>Kübik Öğrenme Rehberi</strong><span><span className="live-dot"/> Matematik · {student.grade}</span></div><span className="chat-safe"><ShieldCheck size={14}/> Öğrenme odaklı</span></div>
          <div className="chat-messages">{chat.map((item,i)=><div key={i} className={'message-row '+(item.role==='user'?'message-user':'')}><div className="message-avatar">{item.role==='user'?student.initials:<Sparkles size={15}/>}</div><div className="message-bubble"><span className="message-author">{item.role==='user'?'Sen':'Öğrenme rehberi'}</span><p>{item.text}</p></div></div>)}{chatLoading&&<div className="message-row"><div className="message-avatar"><Sparkles size={15}/></div><div className="message-bubble typing"><span/><span/><span/></div></div>}<div ref={chatEnd}/></div>
          {chatError&&<div className="chat-error"><CircleHelp size={14}/>{chatError} <span>Gösterilen sabit ipucu canlı AI yanıtı değildir.</span></div>}
          <div className="suggestion-row"><button onClick={()=>void sendChat(track==='LGS'?'Üslerin üssü kuralını basit bir örnekle açıklar mısın?':'Fonksiyonlarda x yerine değer yazmak ne demek?')}>{track==='LGS'?'Üslerin üssü kuralı':'Fonksiyon nedir?'}</button><button onClick={()=>void sendChat('Bana cevabı söylemeden bir ipucu verir misin?')}>Bir ipucu ver</button><button onClick={()=>void sendChat('Küçük bir örnek üzerinden anlatır mısın?')}>Örnekle anlat</button></div>
          <form className="chat-composer" onSubmit={e=>{e.preventDefault();void sendChat();}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Takıldığın adımı buraya yaz…" aria-label="AI çalışma arkadaşına mesaj"/><button className="send-button" type="submit" disabled={!chatInput.trim()||chatLoading} aria-label="Mesajı gönder"><Send size={17}/></button></form>
          <p className="chat-disclaimer">AI yanıtları hata içerebilir. Önemli akademik kararlar için öğretmeninle kontrol et.</p>
        </section>
        <aside className="surface coach-context"><span className="eyebrow muted">ÇALIŞMA BAĞLAMI</span><h3>Bugünkü konun</h3><div className="context-topic"><div className="plan-icon indigo"><BookOpen size={18}/></div><div><strong>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</strong><span>Matematik · {student.grade}</span></div></div><div className="context-divider"/><span className="eyebrow muted">İSTERSEN ŞUNU SOR</span><button className="prompt-card" onClick={()=>setChatInput('Bu konuyu 3 kısa adımda anlatır mısın?')}>Bu konuyu 3 kısa adımda anlat <ArrowRight size={15}/></button><button className="prompt-card" onClick={()=>setChatInput('Yanlış cevabım hangi düşünce hatasından kaynaklanmış olabilir?')}>Yanlışım ne anlatıyor olabilir? <ArrowRight size={15}/></button><div className="teacher-note"><Lightbulb size={16}/><p>Bir soruda uzun süre takılırsan, öğretmeninden destek istemek de iyi bir öğrenme adımıdır.</p></div></aside>
      </div>
    </div>;
  }

  function ProgressView() {
    return <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KENDİ GELİŞİMİNİ İZLE</span><h1>Her doğru adım bir iz bırakır.</h1><p>Bu görünüm, demo oturumunda kaydedilen yanıtları ve sıradaki çalışma önerisini bir araya getirir.</p></div></div>
      <div className="progress-overview"><section className="surface mastery-card"><span className="eyebrow muted">KONU İLERLEMESİ</span><div className="mastery-number">{mastery}<small>%</small></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><p>{progress===null?'Başlangıç göstergesi · gerçek öğrenci verisi değildir.':'Sunucu tarafında kayıtlı demo konu ilerlemesi.'}</p></section><section className="surface next-step-card"><div className="plan-icon amber"><Target size={19}/></div><span className="eyebrow muted">ÖNERİLEN SONRAKİ ADIM</span><h3>{answerResult&&!answerResult.correct?'Bu adımı yeniden çalış':'Benzer bir soruda kuralı uygula'}</h3><p>{answerResult&&!answerResult.correct?'Yanlış seçeneğin hangi düşünceyi işaret ettiğini AI çalışma arkadaşıyla incele.':'Aynı kazanımı farklı bir örnekte kullanarak gerçekten anladığını kontrol et.'}</p><button className="button button-primary" onClick={startRetry}>Bir soru daha çöz <ArrowRight size={15}/></button></section></div>
      <section className="surface reflection-card"><div className="surface-heading"><div><span className="eyebrow muted">KISA ÖZ DEĞERLENDİRME</span><h3>Bugün kendine sor</h3></div><span className="round-icon"><Lightbulb size={18}/></span></div><div className="reflection-list"><div><span>01</span><p>Hangi kuralı kullandım, neden?</p><button onClick={()=>{setView('coach');setChatInput('Bugünkü soruda hangi kuralı neden kullandığımı anlamama yardım et.')}}>Birlikte düşün <ArrowRight size={14}/></button></div><div><span>02</span><p>Benzer bir soruda tek başıma deneyebilir miyim?</p><button onClick={startRetry}>Kendimi dene <ArrowRight size={14}/></button></div><div><span>03</span><p>Hangi adım için öğretmen desteğine ihtiyacım var?</p><button onClick={()=>setNotice('Öğretmen görünümünde bu konu için destek notu gösteriliyor.')}>Not al <ArrowRight size={14}/></button></div></div></section>
    </div>;
  }

  const renderTeacher = () => <div className="page-stack">
    <div className="page-intro"><div><span className="eyebrow muted">ÖĞRETMEN ÇALIŞMA ALANI</span><h1>Öğrencinin takıldığı yeri görün.</h1><p>Öğrenme verisini bir sonraki öğretmen müdahalesine dönüştüren sade görünüm.</p></div><span className="quiet-pill"><Users size={14}/> Demo öğrenci: {student.name}</span></div>
    <section className="teacher-student-banner"><div className="student-avatar large">{student.initials}</div><div className="teacher-student-copy"><span className="eyebrow">ÖĞRENCİ KARTI · DEMO</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><button className="button button-light" onClick={()=>{setRole('student');setView('practice')}}>Öğrenci akışını aç <ArrowRight size={15}/></button></section>
    <div className="teacher-grid"><section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">KONU DURUMU</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="topic-chip"><Activity size={14}/> {progress===null?'Demo': 'Kayıtlı'}</span></div><div className="teacher-mastery"><strong>{mastery}%</strong><div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Başlangıç örneği; henüz kayıtlı sonuç yok.':'Öğrenci oturumunda kaydedilen konu göstergesi.'}</small></div></div><div className="signal-row"><div className="signal-icon amber"><Lightbulb size={17}/></div><div><strong>Öğretmen için olası müdahale</strong><p>{answerResult&&!answerResult.correct?'Üs kurallarında aynı tabana çevirme adımını kısa bir örnekle tekrar edin.':'Öğrenciden kullandığı kuralı kendi cümleleriyle açıklamasını isteyin.'}</p></div></div></section>
    <section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">OTURUM ÖZETİ</span><h3>Bu çalışmada</h3></div><span className="round-icon"><NotebookPen size={17}/></span></div><div className="session-stat"><span>Yanıt durumu</span><strong>{submitted?(answerResult?.correct?'Doğru':'Tekrar gerekli'):'Henüz yanıtlanmadı'}</strong></div><div className="session-stat"><span>AI destek etkileşimi</span><strong>{chat.filter(x=>x.role==='user').length} mesaj</strong></div><div className="session-stat"><span>İçerik kaynağı</span><strong>{question?.verified?'MEB · doğrulanmış':'Demo örneği'}</strong></div><button className="button button-secondary full-button" onClick={()=>{setRole('student');setView('coach')}}>Öğrenciyle aynı konuyu incele <ArrowRight size={15}/></button></section></div>
    <section className="surface teacher-next"><div className="plan-icon mint"><MessageCircle size={18}/></div><div><span className="eyebrow muted">ÖNERİLEN ÖĞRETMEN NOTU</span><h3>“Sonucu nasıl bulduğunu anlatır mısın?”</h3><p>Öğrencinin yalnızca doğru cevabı değil, kullandığı düşünme yolunu da açıklamasını isteyin.</p></div><button className="text-button" onClick={()=>setNotice('Öğretmen notu bu demo oturumu için seçildi.')}>Notu seç <Check size={15}/></button></section>
  </div>;

  const renderParent = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">VELİ GÖRÜNÜMÜ</span><h1>Gelişimi anlaşılır şekilde takip edin.</h1><p>Notlardan çok, çalışma rutini ve bir sonraki destek adımına odaklanın.</p></div></div>
    <section className="parent-summary surface"><div className="student-avatar large">{student.initials}</div><div className="parent-child"><span className="eyebrow muted">ÖĞRENCİ</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><div className="parent-progress"><span>Konu ilerleme göstergesi</span><strong>{mastery}%</strong><div className="progress-track"><span style={{width:mastery+'%'}}/></div></div></section>
    <div className="parent-grid"><section className="surface"><span className="eyebrow muted">BU OTURUMDA</span><h3>{submitted?'Bir soru üzerinde çalıştı':'Çalışma sırasındaki adım'}</h3><p>{submitted?'Yanıt sonrası açıklama ve tekrar önerisi sunuldu.':'Bir soruyu kendi başına denemesi ve ardından açıklamayı incelemesi planlandı.'}</p><div className="parent-step"><CheckCircle2 size={17}/><span>Önce kendi başına deneme</span></div><div className="parent-step"><CheckCircle2 size={17}/><span>Yanlışın nedenini anlama</span></div><div className="parent-step"><Clock3 size={17}/><span>Benzer soruyla pekiştirme</span></div></section><section className="surface parent-advice"><div className="plan-icon amber"><Lightbulb size={18}/></div><span className="eyebrow muted">EVDE DESTEK İÇİN</span><h3>“Bugün neyi farklı anladın?”</h3><p>Doğru sayısını sormak yerine, öğrendiği kuralı kendi cümleleriyle anlatmasını isteyin.</p><button className="button button-secondary" onClick={()=>{setRole('student');setView('progress')}}>Gelişim görünümünü aç <ArrowRight size={15}/></button></section></div>
  </div>;

  const renderCenter = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KÜBİK · KURUM GÖRÜNÜMÜ</span><h1>Eğitim sürecini görünür kılın.</h1><p>Bu demo, bireysel öğrenme döngüsünün kurum içindeki karşılığını gösterir. Gerçek kurum verisi içermez.</p></div></div>
    <div className="center-metrics"><section className="surface"><span className="metric-label">AKTİF DEMO ÖĞRENCİ</span><strong>01</strong><small>Sunum senaryosu · gerçek kayıt sayısı değil</small></section><section className="surface"><span className="metric-label">ÖĞRENME DÖNGÜSÜ</span><strong>{submitted?'3 / 3':'1 / 3'}</strong><small>{submitted?'Yanıt ve geri bildirim gösterildi.':'Yanıt bekleniyor; akış canlı denenebilir.'}</small></section><section className="surface"><span className="metric-label">AI BAĞLANTISI</span><strong>{health?.hasGeminiKey?'Hazır':'Kontrol gerekli'}</strong><small>API anahtarı sunucu tarafından kontrol edilir.</small></section></div>
    <section className="surface center-flow"><div className="surface-heading"><div><span className="eyebrow muted">ÜRÜNÜN TEMEL DÖNGÜSÜ</span><h3>Tek akış, dört rol</h3></div><span className="round-icon"><Activity size={18}/></span></div><div className="flow-steps"><div><span>01</span><BookOpen size={20}/><strong>Öğrenci çalışır</strong><p>Soru ve yanıt</p></div><ArrowRight/><div><span>02</span><BrainCircuit size={20}/><strong>Geri bildirim</strong><p>Hata nedeni ve ipucu</p></div><ArrowRight/><div><span>03</span><Users size={20}/><strong>Öğretmen görür</strong><p>Müdahale önerisi</p></div><ArrowRight/><div><span>04</span><Activity size={20}/><strong>İlerleme izlenir</strong><p>Ortak kayıt</p></div></div></section>
    <section className="surface center-next"><div><span className="eyebrow muted">ÜRÜN KEŞFİ İÇİN SONRAKİ ADIM</span><h3>Önce Kubik’in gerçek sürecini tanımlayalım.</h3><p>Öğrenci grupları, öğretmen iş akışı, mevcut dijital araçlar ve veli iletişimi sahipleriyle birlikte doğrulanmalı. Bu demo üretim sistemi veya gelir tahmini değildir.</p></div><button className="button button-primary" onClick={()=>setNotice('Keşif gündemi: öğrenci akışı, öğretmen müdahalesi, veli iletişimi ve ölçülebilir kazanımlar.')}>Keşif gündemini göster <ArrowRight size={15}/></button></section>
  </div>;

  return <div className="product-shell">
    <header className="topbar"><button className="brand" onClick={()=>{setRole('student');setView('today')}} aria-label="Kübik ana sayfa"><span className="brand-symbol"><span/><span/><span/><span/></span><span className="brand-word">kübik<span>+</span><small>ÖĞRENME ATÖLYESİ</small></span></button>
      <div className="topbar-center"><span className="demo-status"/><span>ÜRÜN DENEYİMİ</span><span className="topbar-separator">/</span><span>{role==='student'?'ÖĞRENCİ ROTASI':role==='teacher'?'ÖĞRETMEN MASASI':role==='parent'?'VELİ ÖZETİ':'KURUM PERSPEKTİFİ'}</span></div>
      <div className="topbar-actions"><div className="track-switch"><button className={track==='LGS'?'active':''} onClick={()=>changeTrack('LGS')}>LGS</button><button className={track==='YKS'?'active':''} onClick={()=>changeTrack('YKS')}>YKS</button></div><div className="user-chip"><span className="student-avatar">{student.initials}</span><span><strong>{student.name}</strong><small>{student.grade}</small></span><ChevronDown size={14}/></div></div>
    </header>
    <div className="app-frame"><aside className="sidebar"><div className="sidebar-label">ÇALIŞMA ALANI</div><div className="nav-list">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={'nav-item '+(role==='student'&&view===item.id?'active':'')} onClick={()=>{setRole('student');chooseView(item.id)}}><span className="nav-icon"><Icon size={18}/></span><span className="nav-text"><strong>{item.label}</strong><small>{item.hint}</small></span>{role==='student'&&view===item.id&&<span className="nav-active-dot"/>}</button>})}</div><div className="sidebar-divider"/><div className="sidebar-label">AYNI ÖĞRENME, FARKLI BAKIŞ</div><div className="role-list">{roles.filter(r=>r.id!=='student').map(r=><button key={r.id} className={'role-item '+(role===r.id?'active':'')} onClick={()=>setRole(r.id)}><span className="role-avatar">{r.id==='teacher'?<GraduationCap size={17}/>:r.id==='parent'?<Users size={17}/>:<Activity size={17}/>}</span><span>{r.label}</span><ChevronRight size={15}/></button>)}</div><div className="sidebar-bottom"><div className="privacy-mark"><ShieldCheck size={16}/><span><strong>Güvenilir öğrenme</strong><small>Demo · gerçek öğrenci hesabı değil</small></span></div><button className="help-link" onClick={()=>setNotice('Bu demo, Kubik ile birlikte doğrulanacak bir ürün fikridir; üretim sistemi değildir.')}>Bu demo hakkında <CircleHelp size={14}/></button></div></aside>
      <main className="main-area"><div className="mobile-track-note"><span className="live-dot"/> {student.goal} <span>· Demo profili</span></div>{notice&&<div className="notice-bar"><Lightbulb size={16}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Bildirimi kapat"><X size={15}/></button></div>}
        {role==='student'?renderStudent():role==='teacher'?renderTeacher():role==='parent'?renderParent():renderCenter()}
        <footer className="app-footer"><span>kübik+ <i>·</i> Öğrenme atölyesi</span><span><ShieldCheck size={13}/> Demo içerikleri açıkça etiketlenmiştir</span></footer>
      </main>
    </div>
  </div>;
}

export default App;
)
    .replace(/\\\\\\[/g, () => '$')
    .replace(/\\\\\\]/g, () => '$');
  return <div className="tutor-rich-text"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{normalized}</ReactMarkdown></div>;
}

type Track = 'LGS' | 'YKS';
type Role = 'student' | 'teacher' | 'parent' | 'center';
type View = 'today' | 'practice' | 'coach' | 'progress';
type ChatItem = { role: 'user' | 'assistant'; text: string };
type AnswerResult = { correct: boolean; explanation: string; misconception?: string; repeated?: boolean; unverified?: boolean };
type Option = { id: string; text: string };
type Question = {
  id: string; track: Track; topic: string; prompt: string; options: Option[];
  source: string; sourceUrl?: string; verified: boolean; hints?: string[];
};
const students: Record<Track, { id: string; name: string; grade: string; goal: string; initials: string }> = {
  LGS: { id: 'std_lgs_801', name: 'Kerem Demir', grade: '8. sınıf', goal: 'LGS · Matematik', initials: 'KD' },
  YKS: { id: 'std_yks_1101', name: 'Selin Yılmaz', grade: '11. sınıf', goal: 'YKS · Matematik', initials: 'SY' }
};
const roles: { id: Role; label: string }[] = [
  { id: 'student', label: 'Öğrenci' }, { id: 'teacher', label: 'Öğretmen' },
  { id: 'parent', label: 'Veli' }, { id: 'center', label: 'Kurum' }
];
const demoRetry: Question = {
  id: 'demo-retry-uslu-01', track: 'LGS', topic: 'Üslü ifadeler · pekiştirme',
  prompt: 'Bir sayının 2⁵ katı 2⁹ ise bu sayı kaçtır?',
  options: [{id:'A',text:'2³'}, {id:'B',text:'2⁴'}, {id:'C',text:'2⁵'}, {id:'D',text:'2¹⁴'}],
  source: 'Kübik demo için hazırlanmış pekiştirme sorusu · resmî sınav sorusu değildir',
  verified: false
};
const demoYks: Question = {
  id: 'demo-yks-function-01', track: 'YKS', topic: 'Fonksiyonlar',
  prompt: 'f(x) = 3x − 2 olduğuna göre f(4) kaçtır?',
  options: [{id:'A',text:'8'}, {id:'B',text:'10'}, {id:'C',text:'12'}, {id:'D',text:'14'}],
  source: 'Kübik demo için hazırlanmış örnek · resmî YKS sorusu değildir',
  verified: false
};
const localAnswer: Record<string, { key: string; explanation: string; misconception: Record<string,string> }> = {
  'demo-retry-uslu-01': {
    key:'B', explanation:'2⁵ ile çarpıldığında 2⁹ elde ediliyorsa, aynı tabanlı üsleri bölme işleminde çıkarırız: 2⁹ ÷ 2⁵ = 2⁴.',
    misconception:{A:'Üsleri çıkarırken 9 − 5 işlemini yeniden kontrol et. Sonuç 4 olmalı.',C:'2⁵ sayının kendisi değil, onu çarptığımız katsayı. Bilinmeyeni bulmak için bölmeliyiz.',D:'Çarpma kuralını kullanmış olabilirsin; bilinmeyeni yalnız bırakmak için bölme yap.'}
  },
  'demo-yks-function-01': {
    key:'B', explanation:'f(4) demek, x yerine 4 yazmak demektir: 3 × 4 − 2 = 12 − 2 = 10.',
    misconception:{A:'3 × 4 = 12 adımından sonra 2 çıkarma adımını da yapmalısın.',C:'12 yalnızca 3 × 4 işleminin sonucu. Sonra 2 çıkarılır.',D:'İşlemde +2 yok; verilen ifade 3x − 2.'}
  }
};

function App() {
  const [track, setTrack] = useState<Track>('LGS');
  const [role, setRole] = useState<Role>('student');
  const [view, setView] = useState<View>('today');
  const [officialQuestion, setOfficialQuestion] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [retryMode, setRetryMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatItem[]>([{role:'assistant',text:'Merhaba! Nerede takıldığını birlikte bulalım. İstersen sorudaki bir adımı yazabilir ya da aşağıdaki kısa sorulardan biriyle başlayabilirsin.'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState<{hasGeminiKey:boolean} | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const student = students[track];

  useEffect(() => {
    fetch('/api/health').then(r=>r.json()).then(setHealth).catch(()=>setHealth(null));
  }, []);

  useEffect(() => {
    let alive = true;
    setQuestionLoading(true);
    setQuestion(null);
    setSelected(null); setSubmitted(false); setAnswerResult(null); setRetryMode(false);
    setChat([{role:'assistant',text:track === 'LGS'
      ? 'Bu soruyu hemen çözmek zorunda değilsin. Önce hangi kuralın gerektiğini bulalım; sonra birlikte adım adım ilerleriz.'
      : 'Fonksiyon sorularında ilk küçük adım, x yerine verilen sayıyı yazmaktır. İstersen bunu bir örnek üzerinde deneyelim.'}]);
    const load = async () => {
      try {
        const response = await fetch('/api/content/verified-question?studentId=' + student.id);
        const data = await response.json();
        if (!alive) return;
        if (track === 'LGS' && data.available && data.question) {
          const q = data.question;
          const mapped: Question = {
            id:q.id, track:'LGS', topic:q.topic, prompt:q.questionText,
            options:q.options.map((o:Option)=>({id:o.id,text:o.text})),
            source:q.sourceDocument, sourceUrl:q.sourceUrl,
            verified:q.verificationStatus === 'verified_official_publication',
            hints:q.pedagogicalHints
          };
          setOfficialQuestion(mapped); setQuestion(mapped);
        } else {
          setOfficialQuestion(null);
          setQuestion(track === 'LGS' ? demoRetry : demoYks);
        }
      } catch {
        if (!alive) return;
        setQuestion(track === 'LGS' ? demoRetry : demoYks);
        setNotice('Sunucuya ulaşılamadı. Şu an yalnızca yerel demo örneği gösteriliyor.');
      } finally {
        if (alive) { setQuestionLoading(false); loadProgress(); }
      }
    };
    const loadProgress = async () => {
      try {
        const r = await fetch('/api/student/progress?studentId=' + student.id);
        const d = await r.json();
        if (alive && r.ok && typeof d.progress?.currentMastery === 'number') setProgress(d.progress.currentMastery);
        else if (alive) setProgress(null);
      } catch { if (alive) setProgress(null); }
    };
    void load();
    return () => { alive = false; };
  }, [track, student.id]);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth',block:'end'}); }, [chat,chatLoading]);

  const mastery = progress ?? (track === 'LGS' ? 52 : 38);
  const nav: {id:View; label:string; hint:string; icon:typeof House}[] = [
    {id:'today',label:'Bugünüm',hint:'Günlük rota',icon:House},
    {id:'practice',label:'Soru atölyesi',hint:'Çöz ve öğren',icon:NotebookPen},
    {id:'coach',label:'AI çalışma arkadaşı',hint:'Takıldığın yerde',icon:MessageCircle},
    {id:'progress',label:'Gelişimim',hint:'Neler değişiyor?',icon:Activity}
  ];
  const changeTrack = (next:Track) => { setTrack(next); setRole('student'); setView('today'); setNotice(''); };
  const chooseView = (next:View) => { setView(next); setNotice(''); };

  const submitAnswer = async () => {
    if (!question || !selected || submitted) return;
    setSubmitted(true);
    const local = localAnswer[question.id];
    let correct = false;
    let explanation = '';
    let misconception = '';
    let repeated = false;
    if (question.verified && track === 'LGS') {
      try {
        const r = await fetch('/api/student/answer', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            studentId:student.id, topicId:'top_lgs_uslu', questionId:question.id,
            chosenOptionId:selected, hintsUsedCount:0, aiTutorInteractionsCount:chat.filter(x=>x.role==='user').length
          })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Yanıt kaydedilemedi.');
        correct = Boolean(d.isCorrect); repeated = Boolean(d.isRepeatedAttempt);
        explanation = d.officialSolution?.summary || d.explanation || 'Yanıt değerlendirildi.';
        const selectedIndex = question.options.findIndex(o=>o.id===selected);
        const hintIndex = selectedIndex === 0 ? 0 : Math.max(0, selectedIndex - 1);
        misconception = correct ? '' : (question.hints?.[hintIndex] || 'Önce ifadeleri aynı tabana çevirip üs kurallarını adım adım uygulayalım.');
        if (typeof d.updatedMastery?.currentMastery === 'number') setProgress(d.updatedMastery.currentMastery);
      } catch {
        setAnswerResult({
          correct: false,
          unverified: true,
          explanation: 'Sunucuya ulaşılamadığı için bu yanıt doğrulanamadı. Cevap anahtarını tahmin etmeyeceğiz ve ilerleme kaydı oluşturulmadı.',
          misconception: ''
        });
        return;
      }
    } else if (local) {
      correct = selected === local.key;
      explanation = local.explanation;
      misconception = correct ? '' : (local.misconception[selected] || 'İşlem adımlarını birer birer kontrol edelim.');
    } else {
      explanation = 'Bu örnek için cevap anahtarı doğrulanmadı. Öğretmenle birlikte kontrol etmek üzere işaretlendi.';
    }
    setAnswerResult({correct, explanation, misconception, repeated});
    if (!correct) setNotice('Hata bir sonuç değil, nereden devam edeceğimizi gösteren ipucu.');
  };

  const startRetry = () => {
    setQuestion(track === 'LGS' ? demoRetry : demoYks);
    setRetryMode(true); setSelected(null); setSubmitted(false); setAnswerResult(null);
    setView('practice'); setRole('student');
    setNotice('Pekiştirme sorusu açıldı. Bu soru demo için hazırlandı; resmî sınav sorusu değildir.');
  };

  const sendChat = async (message?:string) => {
    const text = (message ?? chatInput).trim();
    if (!text || chatLoading) return;
    setChatInput('');
    setChatError('');
    const next = [...chat,{role:'user' as const,text}];
    setChat(next); setChatLoading(true);
    try {
      const response = await fetch('/api/tutor/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          studentId:student.id,
          userMessage:text,
          chatHistory:next.slice(-8).map(m=>({role:m.role,content:m.text}))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI yanıtı alınamadı.');
      setChat(old=>[...old,{role:'assistant',text:data.reply}]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Bağlantı kurulamadı.';
      setChatError(messageText);
      const safeFallback = track === 'LGS'
        ? 'Şu anda canlı AI yanıtı alamadım. Yine de şu ilk adımı birlikte yapabiliriz: 8⁴ ifadesini 2 tabanında yaz. Çünkü 8 = 2³. Sonra üslerin üssü kuralını uygula. Bu, otomatik AI yanıtı değil; demo içindeki sabit ipucudur.'
        : 'Canlı AI yanıtı alınamadı. Fonksiyonlarda x yerine verilen sayıyı koyup işlem sırasıyla ilerleriz. Bu parkurda resmî soru içeriği henüz doğrulanmadı; bu yüzden örneği resmî soru diye sunmayacağım.';
      setChat(old=>[...old,{role:'assistant',text:safeFallback}]);
    } finally { setChatLoading(false); }
  };

  const resetPractice = () => {
    if (track === 'LGS' && officialQuestion) { setQuestion(officialQuestion); setRetryMode(false); }
    else { setQuestion(track === 'LGS' ? demoRetry : demoYks); setRetryMode(true); }
    setSelected(null); setSubmitted(false); setAnswerResult(null); setNotice('');
  };

  const renderStudent = () => {
    if (view === 'coach') return Coach();
    if (view === 'progress') return ProgressView();
    if (view === 'practice') return PracticeView();
    return TodayView();
  };

  function TodayView() {
    return <div className="page-stack">
      <section className="welcome-band">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="live-dot" /> BUGÜNÜN ÖĞRENME ROTASI</div>
          <h1>Selam {student.name.split(' ')[0]},<br/><span>küçük adımlar büyütür.</span></h1>
          <p>Bugün her şeyi bitirmek zorunda değilsin. Bir konuyu gerçekten anlamak yeterli.</p>
          <button className="button button-light" onClick={()=>chooseView('practice')}>İlk çalışmaya başla <ArrowRight size={16}/></button>
        </div>
        <div className="route-art" aria-hidden="true">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="orbit-core"><BrainCircuit size={38}/></div>
          <div className="orbit-tag tag-one"><Target size={15}/> 1 konu</div>
          <div className="orbit-tag tag-two"><CheckCircle2 size={15}/> 1 adım</div>
        </div>
      </section>
      <div className="section-heading"><div><span className="eyebrow muted">BUGÜN SANA ÖZEL</span><h2>Çalışma planın</h2></div><span className="quiet-pill"><CalendarDays size={14}/> Bugün · 20 dk</span></div>
      <section className="plan-grid">
        <button className="plan-card plan-main" onClick={()=>chooseView('practice')}>
          <div className="plan-icon indigo"><NotebookPen size={20}/></div><div className="plan-meta"><span>01 · MATEMATİK</span><span className="duration"><Clock3 size={13}/> 10 dk</span></div>
          <h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3><p>{track==='LGS'?'Üs kurallarını bir problemde kullan.':'Fonksiyon değerini adım adım hesapla.'}</p>
          <div className="plan-bottom"><span>Çalışmaya geç</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('coach')}>
          <div className="plan-icon mint"><MessageCircle size={20}/></div><div className="plan-meta"><span>02 · ANLAMA</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Takıldığın yeri sor</h3><p>Bir adımı anlamadıysan AI çalışma arkadaşıyla birlikte aç.</p>
          <div className="plan-bottom"><span>Soru sor</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('progress')}>
          <div className="plan-icon amber"><Activity size={20}/></div><div className="plan-meta"><span>03 · GERİ BAKIŞ</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Ne öğrendin?</h3><p>Yanıtlarını ve sıradaki küçük adımını gözden geçir.</p>
          <div className="plan-bottom"><span>Gelişimi gör</span><ArrowRight size={16}/></div>
        </button>
      </section>
      <div className="lower-grid">
        <section className="surface focus-panel"><div className="surface-heading"><div><span className="eyebrow muted">BU HAFTAKİ ODAĞIN</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="round-icon"><Target size={18}/></span></div>
          <p className="body-copy">Amaç sadece doğru cevabı bulmak değil; hangi kuralı neden kullandığını anlatabilmek.</p>
          <div className="mastery-line"><div><span>Örnek ilerleme göstergesi</span><strong>{mastery}%</strong></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Bu gösterge başlangıç demo değeridir; gerçek öğrenci başarısı değildir.':'Bu demo oturumunda sunucuya kaydedilen konu ilerlemesi.'}</small></div>
        </section>
        <section className="surface note-panel"><div className="note-icon"><Lightbulb size={20}/></div><span className="eyebrow muted">KÜÇÜK HATIRLATMA</span><h3>Hata yapmak, öğrenmenin bir parçası.</h3><p>Yanlış cevapta sadece sonucu değil, düşünme adımını da inceliyoruz.</p><button className="text-button" onClick={()=>chooseView('practice')}>Bir soruda dene <ArrowRight size={15}/></button></section>
      </div>
    </div>;
  }

  function PracticeView() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME ATÖLYESİ / MATEMATİK</span><h1>Çöz. Anla. Bir daha dene.</h1><p>Yanıtından sonra sadece doğru/yanlış değil, düşünme adımına dair geri bildirim alırsın.</p></div><span className="quiet-pill"><ShieldCheck size={14}/>{question?.verified?'Kaynağı doğrulanmış':'Demo örneği'}</span></div>
      {questionLoading || !question ? <div className="surface loading-surface"><div className="spinner"/><p>Soru hazırlanıyor…</p></div> :
      <div className="practice-layout">
        <section className="surface question-panel">
          <div className="question-top"><div className="topic-chip"><BookOpen size={14}/>{question.topic}</div><span className="question-count">{retryMode?'PEKİŞTİRME':'SORU 01'} / MATEMATİK</span></div>
          <h2>{question.prompt}</h2>
          <div className="option-list">{question.options.map((option,index)=><button key={option.id} disabled={submitted} className={'answer-option '+(selected===option.id?'selected ':'')+(submitted && answerResult && !answerResult.unverified && option.id=== (question.verified?'B':localAnswer[question.id]?.key)?'answer-correct ':'')+(submitted && selected===option.id && answerResult && !answerResult.correct && !answerResult.unverified?'answer-wrong':'')} onClick={()=>setSelected(option.id)}><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option.text.replace(/^[A-D]\)\s*/,'')}</span>{selected===option.id&&<span className="option-check"><Check size={15}/></span>}</button>)}</div>
          {!submitted ? <div className="question-actions"><span className="helper-text"><CircleHelp size={14}/> Takılırsan AI çalışma arkadaşına sorabilirsin.</span><button className="button button-primary" disabled={!selected} onClick={submitAnswer}>Yanıtımı kontrol et <ArrowRight size={16}/></button></div> :
          <div className={'feedback-panel '+(answerResult?.correct?'feedback-good':'feedback-try')}><div className="feedback-title">{answerResult?.correct?<CheckCircle2 size={19}/>:<Lightbulb size={19}/>}<div><strong>{answerResult?.unverified?'Yanıt henüz doğrulanamadı.':answerResult?.correct?'Evet, doğru düşünüyorsun.':'Burada bir düşünme adımını yeniden inceleyelim.'}</strong><span>{answerResult?.unverified?'Bağlantı geri geldiğinde yeniden deneyebilirsin.':answerResult?.correct?'Kuralı doğru uyguladın.':'Yanlış cevap bir ipucu; birlikte nerede ayrıldığını bulalım.'}</span></div></div>
            <p>{answerResult?.correct?answerResult.explanation:(answerResult?.misconception||answerResult?.explanation)}</p>
            {answerResult?.repeated&&<small>Bu soru daha önce kaydedilmiş. Tekrar çözüm yeni ilerleme olarak sayılmadı.</small>}
            <div className="feedback-actions"><button className="button button-primary" onClick={()=>{setView('coach');setChatInput('Bu soruda '+(answerResult?.correct?'hangi kuralı kullandığımı':'hangi adımda hata yapmış olabileceğimi')+' adım adım anlatır mısın?')}}><MessageCircle size={15}/> Birlikte incele</button><button className="button button-secondary" onClick={startRetry}>Benzer soru çöz <ArrowRight size={15}/></button></div>
          </div>}
          <div className="source-strip"><ShieldCheck size={15}/><div><strong>{question.verified?'Resmî kaynak bilgisi':'Örnek içerik'}</strong><span>{question.source}</span></div>{question.sourceUrl&&<a href={question.sourceUrl} target="_blank" rel="noreferrer">Kaynağı aç <ArrowUpRight size={13}/></a>}</div>
        </section>
        <aside className="practice-aside">
          <section className="surface aside-card"><div className="aside-heading"><span className="plan-icon mint"><BrainCircuit size={18}/></span><span className="eyebrow muted">ÖĞRENME YÖNTEMİ</span></div><h3>Sonucu değil, düşünme yolunu bul.</h3><ol className="step-list"><li className={submitted?'complete':''}><span>1</span><div><strong>Önce kendin dene</strong><small>İlk düşünceni seç.</small></div></li><li className={answerResult?'complete':''}><span>2</span><div><strong>Geri bildirimi incele</strong><small>Hangi adımın önemli olduğunu gör.</small></div></li><li><span>3</span><div><strong>Benzer soruda uygula</strong><small>Öğrenmeyi tekrar dene.</small></div></li></ol></section>
          <section className="surface aside-card ai-nudge"><span className="eyebrow muted">YARDIMA MI İHTİYACIN VAR?</span><p>“Neden bu işlemi yaptık?” diye sorabilirsin.</p><button className="text-button" onClick={()=>chooseView('coach')}>AI çalışma arkadaşına git <ArrowRight size={15}/></button></section>
        </aside>
      </div>}
    </div>;
  }

  function Coach() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME DESTEĞİ</span><h1>AI çalışma arkadaşın.</h1><p>Sana cevabı hemen vermek yerine düşünme adımlarını açmana yardım eder.</p></div><span className={'connection-pill '+(health?.hasGeminiKey?'connected':'not-connected')}><span/>{health?.hasGeminiKey?'Gemini bağlantısı hazır':health===null?'Bağlantı durumu bilinmiyor':'API anahtarı algılanmadı'}</span></div>
      <div className="coach-layout">
        <section className="surface chat-panel">
          <div className="chat-head"><div className="coach-avatar"><Sparkles size={20}/></div><div><strong>Kübik Öğrenme Rehberi</strong><span><span className="live-dot"/> Matematik · {student.grade}</span></div><span className="chat-safe"><ShieldCheck size={14}/> Öğrenme odaklı</span></div>
          <div className="chat-messages">{chat.map((item,i)=><div key={i} className={'message-row '+(item.role==='user'?'message-user':'')}><div className="message-avatar">{item.role==='user'?student.initials:<Sparkles size={15}/>}</div><div className="message-bubble"><span className="message-author">{item.role==='user'?'Sen':'Öğrenme rehberi'}</span><p>{item.text}</p></div></div>)}{chatLoading&&<div className="message-row"><div className="message-avatar"><Sparkles size={15}/></div><div className="message-bubble typing"><span/><span/><span/></div></div>}<div ref={chatEnd}/></div>
          {chatError&&<div className="chat-error"><CircleHelp size={14}/>{chatError} <span>Gösterilen sabit ipucu canlı AI yanıtı değildir.</span></div>}
          <div className="suggestion-row"><button onClick={()=>void sendChat(track==='LGS'?'Üslerin üssü kuralını basit bir örnekle açıklar mısın?':'Fonksiyonlarda x yerine değer yazmak ne demek?')}>{track==='LGS'?'Üslerin üssü kuralı':'Fonksiyon nedir?'}</button><button onClick={()=>void sendChat('Bana cevabı söylemeden bir ipucu verir misin?')}>Bir ipucu ver</button><button onClick={()=>void sendChat('Küçük bir örnek üzerinden anlatır mısın?')}>Örnekle anlat</button></div>
          <form className="chat-composer" onSubmit={e=>{e.preventDefault();void sendChat();}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Takıldığın adımı buraya yaz…" aria-label="AI çalışma arkadaşına mesaj"/><button className="send-button" type="submit" disabled={!chatInput.trim()||chatLoading} aria-label="Mesajı gönder"><Send size={17}/></button></form>
          <p className="chat-disclaimer">AI yanıtları hata içerebilir. Önemli akademik kararlar için öğretmeninle kontrol et.</p>
        </section>
        <aside className="surface coach-context"><span className="eyebrow muted">ÇALIŞMA BAĞLAMI</span><h3>Bugünkü konun</h3><div className="context-topic"><div className="plan-icon indigo"><BookOpen size={18}/></div><div><strong>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</strong><span>Matematik · {student.grade}</span></div></div><div className="context-divider"/><span className="eyebrow muted">İSTERSEN ŞUNU SOR</span><button className="prompt-card" onClick={()=>setChatInput('Bu konuyu 3 kısa adımda anlatır mısın?')}>Bu konuyu 3 kısa adımda anlat <ArrowRight size={15}/></button><button className="prompt-card" onClick={()=>setChatInput('Yanlış cevabım hangi düşünce hatasından kaynaklanmış olabilir?')}>Yanlışım ne anlatıyor olabilir? <ArrowRight size={15}/></button><div className="teacher-note"><Lightbulb size={16}/><p>Bir soruda uzun süre takılırsan, öğretmeninden destek istemek de iyi bir öğrenme adımıdır.</p></div></aside>
      </div>
    </div>;
  }

  function ProgressView() {
    return <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KENDİ GELİŞİMİNİ İZLE</span><h1>Her doğru adım bir iz bırakır.</h1><p>Bu görünüm, demo oturumunda kaydedilen yanıtları ve sıradaki çalışma önerisini bir araya getirir.</p></div></div>
      <div className="progress-overview"><section className="surface mastery-card"><span className="eyebrow muted">KONU İLERLEMESİ</span><div className="mastery-number">{mastery}<small>%</small></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><p>{progress===null?'Başlangıç göstergesi · gerçek öğrenci verisi değildir.':'Sunucu tarafında kayıtlı demo konu ilerlemesi.'}</p></section><section className="surface next-step-card"><div className="plan-icon amber"><Target size={19}/></div><span className="eyebrow muted">ÖNERİLEN SONRAKİ ADIM</span><h3>{answerResult&&!answerResult.correct?'Bu adımı yeniden çalış':'Benzer bir soruda kuralı uygula'}</h3><p>{answerResult&&!answerResult.correct?'Yanlış seçeneğin hangi düşünceyi işaret ettiğini AI çalışma arkadaşıyla incele.':'Aynı kazanımı farklı bir örnekte kullanarak gerçekten anladığını kontrol et.'}</p><button className="button button-primary" onClick={startRetry}>Bir soru daha çöz <ArrowRight size={15}/></button></section></div>
      <section className="surface reflection-card"><div className="surface-heading"><div><span className="eyebrow muted">KISA ÖZ DEĞERLENDİRME</span><h3>Bugün kendine sor</h3></div><span className="round-icon"><Lightbulb size={18}/></span></div><div className="reflection-list"><div><span>01</span><p>Hangi kuralı kullandım, neden?</p><button onClick={()=>{setView('coach');setChatInput('Bugünkü soruda hangi kuralı neden kullandığımı anlamama yardım et.')}}>Birlikte düşün <ArrowRight size={14}/></button></div><div><span>02</span><p>Benzer bir soruda tek başıma deneyebilir miyim?</p><button onClick={startRetry}>Kendimi dene <ArrowRight size={14}/></button></div><div><span>03</span><p>Hangi adım için öğretmen desteğine ihtiyacım var?</p><button onClick={()=>setNotice('Öğretmen görünümünde bu konu için destek notu gösteriliyor.')}>Not al <ArrowRight size={14}/></button></div></div></section>
    </div>;
  }

  const renderTeacher = () => <div className="page-stack">
    <div className="page-intro"><div><span className="eyebrow muted">ÖĞRETMEN ÇALIŞMA ALANI</span><h1>Öğrencinin takıldığı yeri görün.</h1><p>Öğrenme verisini bir sonraki öğretmen müdahalesine dönüştüren sade görünüm.</p></div><span className="quiet-pill"><Users size={14}/> Demo öğrenci: {student.name}</span></div>
    <section className="teacher-student-banner"><div className="student-avatar large">{student.initials}</div><div className="teacher-student-copy"><span className="eyebrow">ÖĞRENCİ KARTI · DEMO</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><button className="button button-light" onClick={()=>{setRole('student');setView('practice')}}>Öğrenci akışını aç <ArrowRight size={15}/></button></section>
    <div className="teacher-grid"><section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">KONU DURUMU</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="topic-chip"><Activity size={14}/> {progress===null?'Demo': 'Kayıtlı'}</span></div><div className="teacher-mastery"><strong>{mastery}%</strong><div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Başlangıç örneği; henüz kayıtlı sonuç yok.':'Öğrenci oturumunda kaydedilen konu göstergesi.'}</small></div></div><div className="signal-row"><div className="signal-icon amber"><Lightbulb size={17}/></div><div><strong>Öğretmen için olası müdahale</strong><p>{answerResult&&!answerResult.correct?'Üs kurallarında aynı tabana çevirme adımını kısa bir örnekle tekrar edin.':'Öğrenciden kullandığı kuralı kendi cümleleriyle açıklamasını isteyin.'}</p></div></div></section>
    <section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">OTURUM ÖZETİ</span><h3>Bu çalışmada</h3></div><span className="round-icon"><NotebookPen size={17}/></span></div><div className="session-stat"><span>Yanıt durumu</span><strong>{submitted?(answerResult?.correct?'Doğru':'Tekrar gerekli'):'Henüz yanıtlanmadı'}</strong></div><div className="session-stat"><span>AI destek etkileşimi</span><strong>{chat.filter(x=>x.role==='user').length} mesaj</strong></div><div className="session-stat"><span>İçerik kaynağı</span><strong>{question?.verified?'MEB · doğrulanmış':'Demo örneği'}</strong></div><button className="button button-secondary full-button" onClick={()=>{setRole('student');setView('coach')}}>Öğrenciyle aynı konuyu incele <ArrowRight size={15}/></button></section></div>
    <section className="surface teacher-next"><div className="plan-icon mint"><MessageCircle size={18}/></div><div><span className="eyebrow muted">ÖNERİLEN ÖĞRETMEN NOTU</span><h3>“Sonucu nasıl bulduğunu anlatır mısın?”</h3><p>Öğrencinin yalnızca doğru cevabı değil, kullandığı düşünme yolunu da açıklamasını isteyin.</p></div><button className="text-button" onClick={()=>setNotice('Öğretmen notu bu demo oturumu için seçildi.')}>Notu seç <Check size={15}/></button></section>
  </div>;

  const renderParent = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">VELİ GÖRÜNÜMÜ</span><h1>Gelişimi anlaşılır şekilde takip edin.</h1><p>Notlardan çok, çalışma rutini ve bir sonraki destek adımına odaklanın.</p></div></div>
    <section className="parent-summary surface"><div className="student-avatar large">{student.initials}</div><div className="parent-child"><span className="eyebrow muted">ÖĞRENCİ</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><div className="parent-progress"><span>Konu ilerleme göstergesi</span><strong>{mastery}%</strong><div className="progress-track"><span style={{width:mastery+'%'}}/></div></div></section>
    <div className="parent-grid"><section className="surface"><span className="eyebrow muted">BU OTURUMDA</span><h3>{submitted?'Bir soru üzerinde çalıştı':'Çalışma sırasındaki adım'}</h3><p>{submitted?'Yanıt sonrası açıklama ve tekrar önerisi sunuldu.':'Bir soruyu kendi başına denemesi ve ardından açıklamayı incelemesi planlandı.'}</p><div className="parent-step"><CheckCircle2 size={17}/><span>Önce kendi başına deneme</span></div><div className="parent-step"><CheckCircle2 size={17}/><span>Yanlışın nedenini anlama</span></div><div className="parent-step"><Clock3 size={17}/><span>Benzer soruyla pekiştirme</span></div></section><section className="surface parent-advice"><div className="plan-icon amber"><Lightbulb size={18}/></div><span className="eyebrow muted">EVDE DESTEK İÇİN</span><h3>“Bugün neyi farklı anladın?”</h3><p>Doğru sayısını sormak yerine, öğrendiği kuralı kendi cümleleriyle anlatmasını isteyin.</p><button className="button button-secondary" onClick={()=>{setRole('student');setView('progress')}}>Gelişim görünümünü aç <ArrowRight size={15}/></button></section></div>
  </div>;

  const renderCenter = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KÜBİK · KURUM GÖRÜNÜMÜ</span><h1>Eğitim sürecini görünür kılın.</h1><p>Bu demo, bireysel öğrenme döngüsünün kurum içindeki karşılığını gösterir. Gerçek kurum verisi içermez.</p></div></div>
    <div className="center-metrics"><section className="surface"><span className="metric-label">AKTİF DEMO ÖĞRENCİ</span><strong>01</strong><small>Sunum senaryosu · gerçek kayıt sayısı değil</small></section><section className="surface"><span className="metric-label">ÖĞRENME DÖNGÜSÜ</span><strong>{submitted?'3 / 3':'1 / 3'}</strong><small>{submitted?'Yanıt ve geri bildirim gösterildi.':'Yanıt bekleniyor; akış canlı denenebilir.'}</small></section><section className="surface"><span className="metric-label">AI BAĞLANTISI</span><strong>{health?.hasGeminiKey?'Hazır':'Kontrol gerekli'}</strong><small>API anahtarı sunucu tarafından kontrol edilir.</small></section></div>
    <section className="surface center-flow"><div className="surface-heading"><div><span className="eyebrow muted">ÜRÜNÜN TEMEL DÖNGÜSÜ</span><h3>Tek akış, dört rol</h3></div><span className="round-icon"><Activity size={18}/></span></div><div className="flow-steps"><div><span>01</span><BookOpen size={20}/><strong>Öğrenci çalışır</strong><p>Soru ve yanıt</p></div><ArrowRight/><div><span>02</span><BrainCircuit size={20}/><strong>Geri bildirim</strong><p>Hata nedeni ve ipucu</p></div><ArrowRight/><div><span>03</span><Users size={20}/><strong>Öğretmen görür</strong><p>Müdahale önerisi</p></div><ArrowRight/><div><span>04</span><Activity size={20}/><strong>İlerleme izlenir</strong><p>Ortak kayıt</p></div></div></section>
    <section className="surface center-next"><div><span className="eyebrow muted">ÜRÜN KEŞFİ İÇİN SONRAKİ ADIM</span><h3>Önce Kubik’in gerçek sürecini tanımlayalım.</h3><p>Öğrenci grupları, öğretmen iş akışı, mevcut dijital araçlar ve veli iletişimi sahipleriyle birlikte doğrulanmalı. Bu demo üretim sistemi veya gelir tahmini değildir.</p></div><button className="button button-primary" onClick={()=>setNotice('Keşif gündemi: öğrenci akışı, öğretmen müdahalesi, veli iletişimi ve ölçülebilir kazanımlar.')}>Keşif gündemini göster <ArrowRight size={15}/></button></section>
  </div>;

  return <div className="product-shell">
    <header className="topbar"><button className="brand" onClick={()=>{setRole('student');setView('today')}} aria-label="Kübik ana sayfa"><span className="brand-symbol"><span/><span/><span/><span/></span><span className="brand-word">kübik<span>+</span><small>ÖĞRENME ATÖLYESİ</small></span></button>
      <div className="topbar-center"><span className="demo-status"/><span>ÜRÜN DENEYİMİ</span><span className="topbar-separator">/</span><span>{role==='student'?'ÖĞRENCİ ROTASI':role==='teacher'?'ÖĞRETMEN MASASI':role==='parent'?'VELİ ÖZETİ':'KURUM PERSPEKTİFİ'}</span></div>
      <div className="topbar-actions"><div className="track-switch"><button className={track==='LGS'?'active':''} onClick={()=>changeTrack('LGS')}>LGS</button><button className={track==='YKS'?'active':''} onClick={()=>changeTrack('YKS')}>YKS</button></div><div className="user-chip"><span className="student-avatar">{student.initials}</span><span><strong>{student.name}</strong><small>{student.grade}</small></span><ChevronDown size={14}/></div></div>
    </header>
    <div className="app-frame"><aside className="sidebar"><div className="sidebar-label">ÇALIŞMA ALANI</div><div className="nav-list">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={'nav-item '+(role==='student'&&view===item.id?'active':'')} onClick={()=>{setRole('student');chooseView(item.id)}}><span className="nav-icon"><Icon size={18}/></span><span className="nav-text"><strong>{item.label}</strong><small>{item.hint}</small></span>{role==='student'&&view===item.id&&<span className="nav-active-dot"/>}</button>})}</div><div className="sidebar-divider"/><div className="sidebar-label">AYNI ÖĞRENME, FARKLI BAKIŞ</div><div className="role-list">{roles.filter(r=>r.id!=='student').map(r=><button key={r.id} className={'role-item '+(role===r.id?'active':'')} onClick={()=>setRole(r.id)}><span className="role-avatar">{r.id==='teacher'?<GraduationCap size={17}/>:r.id==='parent'?<Users size={17}/>:<Activity size={17}/>}</span><span>{r.label}</span><ChevronRight size={15}/></button>)}</div><div className="sidebar-bottom"><div className="privacy-mark"><ShieldCheck size={16}/><span><strong>Güvenilir öğrenme</strong><small>Demo · gerçek öğrenci hesabı değil</small></span></div><button className="help-link" onClick={()=>setNotice('Bu demo, Kubik ile birlikte doğrulanacak bir ürün fikridir; üretim sistemi değildir.')}>Bu demo hakkında <CircleHelp size={14}/></button></div></aside>
      <main className="main-area"><div className="mobile-track-note"><span className="live-dot"/> {student.goal} <span>· Demo profili</span></div>{notice&&<div className="notice-bar"><Lightbulb size={16}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Bildirimi kapat"><X size={15}/></button></div>}
        {role==='student'?renderStudent():role==='teacher'?renderTeacher():role==='parent'?renderParent():renderCenter()}
        <footer className="app-footer"><span>kübik+ <i>·</i> Öğrenme atölyesi</span><span><ShieldCheck size={13}/> Demo içerikleri açıkça etiketlenmiştir</span></footer>
      </main>
    </div>
  </div>;
}

export default App;
).split(slash + ')').join('
  return <div className="tutor-rich-text">{chunks.map((chunk, index) => {
    if (chunk.startsWith('$') && chunk.endsWith('$') && chunk.length > 2) {
      return <span className="math-inline" key={index}>{formatMath(chunk.slice(1, -1))}</span>;
    }
    return <span key={index}>{renderPlainText(chunk)}</span>;
  })}</div>;
}

type Track = 'LGS' | 'YKS';
type Role = 'student' | 'teacher' | 'parent' | 'center';
type View = 'today' | 'practice' | 'coach' | 'progress';
type ChatItem = { role: 'user' | 'assistant'; text: string };
type AnswerResult = { correct: boolean; explanation: string; misconception?: string; repeated?: boolean; unverified?: boolean };
type Option = { id: string; text: string };
type Question = {
  id: string; track: Track; topic: string; prompt: string; options: Option[];
  source: string; sourceUrl?: string; verified: boolean; hints?: string[];
};
const students: Record<Track, { id: string; name: string; grade: string; goal: string; initials: string }> = {
  LGS: { id: 'std_lgs_801', name: 'Kerem Demir', grade: '8. sınıf', goal: 'LGS · Matematik', initials: 'KD' },
  YKS: { id: 'std_yks_1101', name: 'Selin Yılmaz', grade: '11. sınıf', goal: 'YKS · Matematik', initials: 'SY' }
};
const roles: { id: Role; label: string }[] = [
  { id: 'student', label: 'Öğrenci' }, { id: 'teacher', label: 'Öğretmen' },
  { id: 'parent', label: 'Veli' }, { id: 'center', label: 'Kurum' }
];
const demoRetry: Question = {
  id: 'demo-retry-uslu-01', track: 'LGS', topic: 'Üslü ifadeler · pekiştirme',
  prompt: 'Bir sayının 2⁵ katı 2⁹ ise bu sayı kaçtır?',
  options: [{id:'A',text:'2³'}, {id:'B',text:'2⁴'}, {id:'C',text:'2⁵'}, {id:'D',text:'2¹⁴'}],
  source: 'Kübik demo için hazırlanmış pekiştirme sorusu · resmî sınav sorusu değildir',
  verified: false
};
const demoYks: Question = {
  id: 'demo-yks-function-01', track: 'YKS', topic: 'Fonksiyonlar',
  prompt: 'f(x) = 3x − 2 olduğuna göre f(4) kaçtır?',
  options: [{id:'A',text:'8'}, {id:'B',text:'10'}, {id:'C',text:'12'}, {id:'D',text:'14'}],
  source: 'Kübik demo için hazırlanmış örnek · resmî YKS sorusu değildir',
  verified: false
};
const localAnswer: Record<string, { key: string; explanation: string; misconception: Record<string,string> }> = {
  'demo-retry-uslu-01': {
    key:'B', explanation:'2⁵ ile çarpıldığında 2⁹ elde ediliyorsa, aynı tabanlı üsleri bölme işleminde çıkarırız: 2⁹ ÷ 2⁵ = 2⁴.',
    misconception:{A:'Üsleri çıkarırken 9 − 5 işlemini yeniden kontrol et. Sonuç 4 olmalı.',C:'2⁵ sayının kendisi değil, onu çarptığımız katsayı. Bilinmeyeni bulmak için bölmeliyiz.',D:'Çarpma kuralını kullanmış olabilirsin; bilinmeyeni yalnız bırakmak için bölme yap.'}
  },
  'demo-yks-function-01': {
    key:'B', explanation:'f(4) demek, x yerine 4 yazmak demektir: 3 × 4 − 2 = 12 − 2 = 10.',
    misconception:{A:'3 × 4 = 12 adımından sonra 2 çıkarma adımını da yapmalısın.',C:'12 yalnızca 3 × 4 işleminin sonucu. Sonra 2 çıkarılır.',D:'İşlemde +2 yok; verilen ifade 3x − 2.'}
  }
};

function App() {
  const [track, setTrack] = useState<Track>('LGS');
  const [role, setRole] = useState<Role>('student');
  const [view, setView] = useState<View>('today');
  const [officialQuestion, setOfficialQuestion] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [retryMode, setRetryMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatItem[]>([{role:'assistant',text:'Merhaba! Nerede takıldığını birlikte bulalım. İstersen sorudaki bir adımı yazabilir ya da aşağıdaki kısa sorulardan biriyle başlayabilirsin.'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState<{hasGeminiKey:boolean} | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const student = students[track];

  useEffect(() => {
    fetch('/api/health').then(r=>r.json()).then(setHealth).catch(()=>setHealth(null));
  }, []);

  useEffect(() => {
    let alive = true;
    setQuestionLoading(true);
    setQuestion(null);
    setSelected(null); setSubmitted(false); setAnswerResult(null); setRetryMode(false);
    setChat([{role:'assistant',text:track === 'LGS'
      ? 'Bu soruyu hemen çözmek zorunda değilsin. Önce hangi kuralın gerektiğini bulalım; sonra birlikte adım adım ilerleriz.'
      : 'Fonksiyon sorularında ilk küçük adım, x yerine verilen sayıyı yazmaktır. İstersen bunu bir örnek üzerinde deneyelim.'}]);
    const load = async () => {
      try {
        const response = await fetch('/api/content/verified-question?studentId=' + student.id);
        const data = await response.json();
        if (!alive) return;
        if (track === 'LGS' && data.available && data.question) {
          const q = data.question;
          const mapped: Question = {
            id:q.id, track:'LGS', topic:q.topic, prompt:q.questionText,
            options:q.options.map((o:Option)=>({id:o.id,text:o.text})),
            source:q.sourceDocument, sourceUrl:q.sourceUrl,
            verified:q.verificationStatus === 'verified_official_publication',
            hints:q.pedagogicalHints
          };
          setOfficialQuestion(mapped); setQuestion(mapped);
        } else {
          setOfficialQuestion(null);
          setQuestion(track === 'LGS' ? demoRetry : demoYks);
        }
      } catch {
        if (!alive) return;
        setQuestion(track === 'LGS' ? demoRetry : demoYks);
        setNotice('Sunucuya ulaşılamadı. Şu an yalnızca yerel demo örneği gösteriliyor.');
      } finally {
        if (alive) { setQuestionLoading(false); loadProgress(); }
      }
    };
    const loadProgress = async () => {
      try {
        const r = await fetch('/api/student/progress?studentId=' + student.id);
        const d = await r.json();
        if (alive && r.ok && typeof d.progress?.currentMastery === 'number') setProgress(d.progress.currentMastery);
        else if (alive) setProgress(null);
      } catch { if (alive) setProgress(null); }
    };
    void load();
    return () => { alive = false; };
  }, [track, student.id]);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth',block:'end'}); }, [chat,chatLoading]);

  const mastery = progress ?? (track === 'LGS' ? 52 : 38);
  const nav: {id:View; label:string; hint:string; icon:typeof House}[] = [
    {id:'today',label:'Bugünüm',hint:'Günlük rota',icon:House},
    {id:'practice',label:'Soru atölyesi',hint:'Çöz ve öğren',icon:NotebookPen},
    {id:'coach',label:'AI çalışma arkadaşı',hint:'Takıldığın yerde',icon:MessageCircle},
    {id:'progress',label:'Gelişimim',hint:'Neler değişiyor?',icon:Activity}
  ];
  const changeTrack = (next:Track) => { setTrack(next); setRole('student'); setView('today'); setNotice(''); };
  const chooseView = (next:View) => { setView(next); setNotice(''); };

  const submitAnswer = async () => {
    if (!question || !selected || submitted) return;
    setSubmitted(true);
    const local = localAnswer[question.id];
    let correct = false;
    let explanation = '';
    let misconception = '';
    let repeated = false;
    if (question.verified && track === 'LGS') {
      try {
        const r = await fetch('/api/student/answer', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            studentId:student.id, topicId:'top_lgs_uslu', questionId:question.id,
            chosenOptionId:selected, hintsUsedCount:0, aiTutorInteractionsCount:chat.filter(x=>x.role==='user').length
          })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Yanıt kaydedilemedi.');
        correct = Boolean(d.isCorrect); repeated = Boolean(d.isRepeatedAttempt);
        explanation = d.officialSolution?.summary || d.explanation || 'Yanıt değerlendirildi.';
        const selectedIndex = question.options.findIndex(o=>o.id===selected);
        const hintIndex = selectedIndex === 0 ? 0 : Math.max(0, selectedIndex - 1);
        misconception = correct ? '' : (question.hints?.[hintIndex] || 'Önce ifadeleri aynı tabana çevirip üs kurallarını adım adım uygulayalım.');
        if (typeof d.updatedMastery?.currentMastery === 'number') setProgress(d.updatedMastery.currentMastery);
      } catch {
        setAnswerResult({
          correct: false,
          unverified: true,
          explanation: 'Sunucuya ulaşılamadığı için bu yanıt doğrulanamadı. Cevap anahtarını tahmin etmeyeceğiz ve ilerleme kaydı oluşturulmadı.',
          misconception: ''
        });
        return;
      }
    } else if (local) {
      correct = selected === local.key;
      explanation = local.explanation;
      misconception = correct ? '' : (local.misconception[selected] || 'İşlem adımlarını birer birer kontrol edelim.');
    } else {
      explanation = 'Bu örnek için cevap anahtarı doğrulanmadı. Öğretmenle birlikte kontrol etmek üzere işaretlendi.';
    }
    setAnswerResult({correct, explanation, misconception, repeated});
    if (!correct) setNotice('Hata bir sonuç değil, nereden devam edeceğimizi gösteren ipucu.');
  };

  const startRetry = () => {
    setQuestion(track === 'LGS' ? demoRetry : demoYks);
    setRetryMode(true); setSelected(null); setSubmitted(false); setAnswerResult(null);
    setView('practice'); setRole('student');
    setNotice('Pekiştirme sorusu açıldı. Bu soru demo için hazırlandı; resmî sınav sorusu değildir.');
  };

  const sendChat = async (message?:string) => {
    const text = (message ?? chatInput).trim();
    if (!text || chatLoading) return;
    setChatInput('');
    setChatError('');
    const next = [...chat,{role:'user' as const,text}];
    setChat(next); setChatLoading(true);
    try {
      const response = await fetch('/api/tutor/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          studentId:student.id,
          userMessage:text,
          chatHistory:next.slice(-8).map(m=>({role:m.role,content:m.text}))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI yanıtı alınamadı.');
      setChat(old=>[...old,{role:'assistant',text:data.reply}]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Bağlantı kurulamadı.';
      setChatError(messageText);
      const safeFallback = track === 'LGS'
        ? 'Şu anda canlı AI yanıtı alamadım. Yine de şu ilk adımı birlikte yapabiliriz: 8⁴ ifadesini 2 tabanında yaz. Çünkü 8 = 2³. Sonra üslerin üssü kuralını uygula. Bu, otomatik AI yanıtı değil; demo içindeki sabit ipucudur.'
        : 'Canlı AI yanıtı alınamadı. Fonksiyonlarda x yerine verilen sayıyı koyup işlem sırasıyla ilerleriz. Bu parkurda resmî soru içeriği henüz doğrulanmadı; bu yüzden örneği resmî soru diye sunmayacağım.';
      setChat(old=>[...old,{role:'assistant',text:safeFallback}]);
    } finally { setChatLoading(false); }
  };

  const resetPractice = () => {
    if (track === 'LGS' && officialQuestion) { setQuestion(officialQuestion); setRetryMode(false); }
    else { setQuestion(track === 'LGS' ? demoRetry : demoYks); setRetryMode(true); }
    setSelected(null); setSubmitted(false); setAnswerResult(null); setNotice('');
  };

  const renderStudent = () => {
    if (view === 'coach') return Coach();
    if (view === 'progress') return ProgressView();
    if (view === 'practice') return PracticeView();
    return TodayView();
  };

  function TodayView() {
    return <div className="page-stack">
      <section className="welcome-band">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="live-dot" /> BUGÜNÜN ÖĞRENME ROTASI</div>
          <h1>Selam {student.name.split(' ')[0]},<br/><span>küçük adımlar büyütür.</span></h1>
          <p>Bugün her şeyi bitirmek zorunda değilsin. Bir konuyu gerçekten anlamak yeterli.</p>
          <button className="button button-light" onClick={()=>chooseView('practice')}>İlk çalışmaya başla <ArrowRight size={16}/></button>
        </div>
        <div className="route-art" aria-hidden="true">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="orbit-core"><BrainCircuit size={38}/></div>
          <div className="orbit-tag tag-one"><Target size={15}/> 1 konu</div>
          <div className="orbit-tag tag-two"><CheckCircle2 size={15}/> 1 adım</div>
        </div>
      </section>
      <div className="section-heading"><div><span className="eyebrow muted">BUGÜN SANA ÖZEL</span><h2>Çalışma planın</h2></div><span className="quiet-pill"><CalendarDays size={14}/> Bugün · 20 dk</span></div>
      <section className="plan-grid">
        <button className="plan-card plan-main" onClick={()=>chooseView('practice')}>
          <div className="plan-icon indigo"><NotebookPen size={20}/></div><div className="plan-meta"><span>01 · MATEMATİK</span><span className="duration"><Clock3 size={13}/> 10 dk</span></div>
          <h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3><p>{track==='LGS'?'Üs kurallarını bir problemde kullan.':'Fonksiyon değerini adım adım hesapla.'}</p>
          <div className="plan-bottom"><span>Çalışmaya geç</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('coach')}>
          <div className="plan-icon mint"><MessageCircle size={20}/></div><div className="plan-meta"><span>02 · ANLAMA</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Takıldığın yeri sor</h3><p>Bir adımı anlamadıysan AI çalışma arkadaşıyla birlikte aç.</p>
          <div className="plan-bottom"><span>Soru sor</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('progress')}>
          <div className="plan-icon amber"><Activity size={20}/></div><div className="plan-meta"><span>03 · GERİ BAKIŞ</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Ne öğrendin?</h3><p>Yanıtlarını ve sıradaki küçük adımını gözden geçir.</p>
          <div className="plan-bottom"><span>Gelişimi gör</span><ArrowRight size={16}/></div>
        </button>
      </section>
      <div className="lower-grid">
        <section className="surface focus-panel"><div className="surface-heading"><div><span className="eyebrow muted">BU HAFTAKİ ODAĞIN</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="round-icon"><Target size={18}/></span></div>
          <p className="body-copy">Amaç sadece doğru cevabı bulmak değil; hangi kuralı neden kullandığını anlatabilmek.</p>
          <div className="mastery-line"><div><span>Örnek ilerleme göstergesi</span><strong>{mastery}%</strong></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Bu gösterge başlangıç demo değeridir; gerçek öğrenci başarısı değildir.':'Bu demo oturumunda sunucuya kaydedilen konu ilerlemesi.'}</small></div>
        </section>
        <section className="surface note-panel"><div className="note-icon"><Lightbulb size={20}/></div><span className="eyebrow muted">KÜÇÜK HATIRLATMA</span><h3>Hata yapmak, öğrenmenin bir parçası.</h3><p>Yanlış cevapta sadece sonucu değil, düşünme adımını da inceliyoruz.</p><button className="text-button" onClick={()=>chooseView('practice')}>Bir soruda dene <ArrowRight size={15}/></button></section>
      </div>
    </div>;
  }

  function PracticeView() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME ATÖLYESİ / MATEMATİK</span><h1>Çöz. Anla. Bir daha dene.</h1><p>Yanıtından sonra sadece doğru/yanlış değil, düşünme adımına dair geri bildirim alırsın.</p></div><span className="quiet-pill"><ShieldCheck size={14}/>{question?.verified?'Kaynağı doğrulanmış':'Demo örneği'}</span></div>
      {questionLoading || !question ? <div className="surface loading-surface"><div className="spinner"/><p>Soru hazırlanıyor…</p></div> :
      <div className="practice-layout">
        <section className="surface question-panel">
          <div className="question-top"><div className="topic-chip"><BookOpen size={14}/>{question.topic}</div><span className="question-count">{retryMode?'PEKİŞTİRME':'SORU 01'} / MATEMATİK</span></div>
          <h2>{question.prompt}</h2>
          <div className="option-list">{question.options.map((option,index)=><button key={option.id} disabled={submitted} className={'answer-option '+(selected===option.id?'selected ':'')+(submitted && answerResult && !answerResult.unverified && option.id=== (question.verified?'B':localAnswer[question.id]?.key)?'answer-correct ':'')+(submitted && selected===option.id && answerResult && !answerResult.correct && !answerResult.unverified?'answer-wrong':'')} onClick={()=>setSelected(option.id)}><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option.text.replace(/^[A-D]\)\s*/,'')}</span>{selected===option.id&&<span className="option-check"><Check size={15}/></span>}</button>)}</div>
          {!submitted ? <div className="question-actions"><span className="helper-text"><CircleHelp size={14}/> Takılırsan AI çalışma arkadaşına sorabilirsin.</span><button className="button button-primary" disabled={!selected} onClick={submitAnswer}>Yanıtımı kontrol et <ArrowRight size={16}/></button></div> :
          <div className={'feedback-panel '+(answerResult?.correct?'feedback-good':'feedback-try')}><div className="feedback-title">{answerResult?.correct?<CheckCircle2 size={19}/>:<Lightbulb size={19}/>}<div><strong>{answerResult?.unverified?'Yanıt henüz doğrulanamadı.':answerResult?.correct?'Evet, doğru düşünüyorsun.':'Burada bir düşünme adımını yeniden inceleyelim.'}</strong><span>{answerResult?.unverified?'Bağlantı geri geldiğinde yeniden deneyebilirsin.':answerResult?.correct?'Kuralı doğru uyguladın.':'Yanlış cevap bir ipucu; birlikte nerede ayrıldığını bulalım.'}</span></div></div>
            <TutorMessage text={answerResult?.correct ? answerResult.explanation : (answerResult?.misconception || answerResult?.explanation || '')} />
            {answerResult?.repeated&&<small>Bu soru daha önce kaydedilmiş. Tekrar çözüm yeni ilerleme olarak sayılmadı.</small>}
            <div className="feedback-actions"><button className="button button-primary" onClick={()=>{setView('coach');setChatInput('Bu soruda '+(answerResult?.correct?'hangi kuralı kullandığımı':'hangi adımda hata yapmış olabileceğimi')+' adım adım anlatır mısın?')}}><MessageCircle size={15}/> Birlikte incele</button><button className="button button-secondary" onClick={startRetry}>Benzer soru çöz <ArrowRight size={15}/></button></div>
          </div>}
          <div className="source-strip"><ShieldCheck size={15}/><div><strong>{question.verified?'Resmî kaynak bilgisi':'Örnek içerik'}</strong><span>{question.source}</span></div>{question.sourceUrl&&<a href={question.sourceUrl} target="_blank" rel="noreferrer">Kaynağı aç <ArrowUpRight size={13}/></a>}</div>
        </section>
        <aside className="practice-aside">
          <section className="surface aside-card"><div className="aside-heading"><span className="plan-icon mint"><BrainCircuit size={18}/></span><span className="eyebrow muted">ÖĞRENME YÖNTEMİ</span></div><h3>Sonucu değil, düşünme yolunu bul.</h3><ol className="step-list"><li className={submitted?'complete':''}><span>1</span><div><strong>Önce kendin dene</strong><small>İlk düşünceni seç.</small></div></li><li className={answerResult?'complete':''}><span>2</span><div><strong>Geri bildirimi incele</strong><small>Hangi adımın önemli olduğunu gör.</small></div></li><li><span>3</span><div><strong>Benzer soruda uygula</strong><small>Öğrenmeyi tekrar dene.</small></div></li></ol></section>
          <section className="surface aside-card ai-nudge"><span className="eyebrow muted">YARDIMA MI İHTİYACIN VAR?</span><p>“Neden bu işlemi yaptık?” diye sorabilirsin.</p><button className="text-button" onClick={()=>chooseView('coach')}>AI çalışma arkadaşına git <ArrowRight size={15}/></button></section>
        </aside>
      </div>}
    </div>;
  }

  function Coach() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME DESTEĞİ</span><h1>AI çalışma arkadaşın.</h1><p>Sana cevabı hemen vermek yerine düşünme adımlarını açmana yardım eder.</p></div><span className={'connection-pill '+(health?.hasGeminiKey?'connected':'not-connected')}><span/>{health?.hasGeminiKey?'Gemini bağlantısı hazır':health===null?'Bağlantı durumu bilinmiyor':'API anahtarı algılanmadı'}</span></div>
      <div className="coach-layout">
        <section className="surface chat-panel">
          <div className="chat-head"><div className="coach-avatar"><Sparkles size={20}/></div><div><strong>Kübik Öğrenme Rehberi</strong><span><span className="live-dot"/> Matematik · {student.grade}</span></div><span className="chat-safe"><ShieldCheck size={14}/> Öğrenme odaklı</span></div>
          <div className="chat-messages">{chat.map((item,i)=><div key={i} className={'message-row '+(item.role==='user'?'message-user':'')}><div className="message-avatar">{item.role==='user'?student.initials:<Sparkles size={15}/>}</div><div className="message-bubble"><span className="message-author">{item.role==='user'?'Sen':'Öğrenme rehberi'}</span><TutorMessage text={item.text}/></div></div>)}{chatLoading&&<div className="message-row"><div className="message-avatar"><Sparkles size={15}/></div><div className="message-bubble typing"><span/><span/><span/></div></div>}<div ref={chatEnd}/></div>
          {chatError&&<div className="chat-error"><CircleHelp size={14}/>{chatError} <span>Gösterilen sabit ipucu canlı AI yanıtı değildir.</span></div>}
          <div className="suggestion-row"><button onClick={()=>void sendChat(track==='LGS'?'Üslerin üssü kuralını basit bir örnekle açıklar mısın?':'Fonksiyonlarda x yerine değer yazmak ne demek?')}>{track==='LGS'?'Üslerin üssü kuralı':'Fonksiyon nedir?'}</button><button onClick={()=>void sendChat('Bana cevabı söylemeden bir ipucu verir misin?')}>Bir ipucu ver</button><button onClick={()=>void sendChat('Küçük bir örnek üzerinden anlatır mısın?')}>Örnekle anlat</button></div>
          <form className="chat-composer" onSubmit={e=>{e.preventDefault();void sendChat();}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Takıldığın adımı buraya yaz…" aria-label="AI çalışma arkadaşına mesaj"/><button className="send-button" type="submit" disabled={!chatInput.trim()||chatLoading} aria-label="Mesajı gönder"><Send size={17}/></button></form>
          <p className="chat-disclaimer">AI yanıtları hata içerebilir. Önemli akademik kararlar için öğretmeninle kontrol et.</p>
        </section>
        <aside className="surface coach-context"><span className="eyebrow muted">ÇALIŞMA BAĞLAMI</span><h3>Bugünkü konun</h3><div className="context-topic"><div className="plan-icon indigo"><BookOpen size={18}/></div><div><strong>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</strong><span>Matematik · {student.grade}</span></div></div><div className="context-divider"/><span className="eyebrow muted">İSTERSEN ŞUNU SOR</span><button className="prompt-card" onClick={()=>setChatInput('Bu konuyu 3 kısa adımda anlatır mısın?')}>Bu konuyu 3 kısa adımda anlat <ArrowRight size={15}/></button><button className="prompt-card" onClick={()=>setChatInput('Yanlış cevabım hangi düşünce hatasından kaynaklanmış olabilir?')}>Yanlışım ne anlatıyor olabilir? <ArrowRight size={15}/></button><div className="teacher-note"><Lightbulb size={16}/><p>Bir soruda uzun süre takılırsan, öğretmeninden destek istemek de iyi bir öğrenme adımıdır.</p></div></aside>
      </div>
    </div>;
  }

  function ProgressView() {
    return <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KENDİ GELİŞİMİNİ İZLE</span><h1>Her doğru adım bir iz bırakır.</h1><p>Bu görünüm, demo oturumunda kaydedilen yanıtları ve sıradaki çalışma önerisini bir araya getirir.</p></div></div>
      <div className="progress-overview"><section className="surface mastery-card"><span className="eyebrow muted">KONU İLERLEMESİ</span><div className="mastery-number">{mastery}<small>%</small></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><p>{progress===null?'Başlangıç göstergesi · gerçek öğrenci verisi değildir.':'Sunucu tarafında kayıtlı demo konu ilerlemesi.'}</p></section><section className="surface next-step-card"><div className="plan-icon amber"><Target size={19}/></div><span className="eyebrow muted">ÖNERİLEN SONRAKİ ADIM</span><h3>{answerResult&&!answerResult.correct?'Bu adımı yeniden çalış':'Benzer bir soruda kuralı uygula'}</h3><p>{answerResult&&!answerResult.correct?'Yanlış seçeneğin hangi düşünceyi işaret ettiğini AI çalışma arkadaşıyla incele.':'Aynı kazanımı farklı bir örnekte kullanarak gerçekten anladığını kontrol et.'}</p><button className="button button-primary" onClick={startRetry}>Bir soru daha çöz <ArrowRight size={15}/></button></section></div>
      <section className="surface reflection-card"><div className="surface-heading"><div><span className="eyebrow muted">KISA ÖZ DEĞERLENDİRME</span><h3>Bugün kendine sor</h3></div><span className="round-icon"><Lightbulb size={18}/></span></div><div className="reflection-list"><div><span>01</span><p>Hangi kuralı kullandım, neden?</p><button onClick={()=>{setView('coach');setChatInput('Bugünkü soruda hangi kuralı neden kullandığımı anlamama yardım et.')}}>Birlikte düşün <ArrowRight size={14}/></button></div><div><span>02</span><p>Benzer bir soruda tek başıma deneyebilir miyim?</p><button onClick={startRetry}>Kendimi dene <ArrowRight size={14}/></button></div><div><span>03</span><p>Hangi adım için öğretmen desteğine ihtiyacım var?</p><button onClick={()=>setNotice('Öğretmen görünümünde bu konu için destek notu gösteriliyor.')}>Not al <ArrowRight size={14}/></button></div></div></section>
    </div>;
  }

  const renderTeacher = () => <div className="page-stack">
    <div className="page-intro"><div><span className="eyebrow muted">ÖĞRETMEN ÇALIŞMA ALANI</span><h1>Öğrencinin takıldığı yeri görün.</h1><p>Öğrenme verisini bir sonraki öğretmen müdahalesine dönüştüren sade görünüm.</p></div><span className="quiet-pill"><Users size={14}/> Demo öğrenci: {student.name}</span></div>
    <section className="teacher-student-banner"><div className="student-avatar large">{student.initials}</div><div className="teacher-student-copy"><span className="eyebrow">ÖĞRENCİ KARTI · DEMO</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><button className="button button-light" onClick={()=>{setRole('student');setView('practice')}}>Öğrenci akışını aç <ArrowRight size={15}/></button></section>
    <div className="teacher-grid"><section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">KONU DURUMU</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="topic-chip"><Activity size={14}/> {progress===null?'Demo': 'Kayıtlı'}</span></div><div className="teacher-mastery"><strong>{mastery}%</strong><div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Başlangıç örneği; henüz kayıtlı sonuç yok.':'Öğrenci oturumunda kaydedilen konu göstergesi.'}</small></div></div><div className="signal-row"><div className="signal-icon amber"><Lightbulb size={17}/></div><div><strong>Öğretmen için olası müdahale</strong><p>{answerResult&&!answerResult.correct?'Üs kurallarında aynı tabana çevirme adımını kısa bir örnekle tekrar edin.':'Öğrenciden kullandığı kuralı kendi cümleleriyle açıklamasını isteyin.'}</p></div></div></section>
    <section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">OTURUM ÖZETİ</span><h3>Bu çalışmada</h3></div><span className="round-icon"><NotebookPen size={17}/></span></div><div className="session-stat"><span>Yanıt durumu</span><strong>{submitted?(answerResult?.correct?'Doğru':'Tekrar gerekli'):'Henüz yanıtlanmadı'}</strong></div><div className="session-stat"><span>AI destek etkileşimi</span><strong>{chat.filter(x=>x.role==='user').length} mesaj</strong></div><div className="session-stat"><span>İçerik kaynağı</span><strong>{question?.verified?'MEB · doğrulanmış':'Demo örneği'}</strong></div><button className="button button-secondary full-button" onClick={()=>{setRole('student');setView('coach')}}>Öğrenciyle aynı konuyu incele <ArrowRight size={15}/></button></section></div>
    <section className="surface teacher-next"><div className="plan-icon mint"><MessageCircle size={18}/></div><div><span className="eyebrow muted">ÖNERİLEN ÖĞRETMEN NOTU</span><h3>“Sonucu nasıl bulduğunu anlatır mısın?”</h3><p>Öğrencinin yalnızca doğru cevabı değil, kullandığı düşünme yolunu da açıklamasını isteyin.</p></div><button className="text-button" onClick={()=>setNotice('Öğretmen notu bu demo oturumu için seçildi.')}>Notu seç <Check size={15}/></button></section>
  </div>;

  const renderParent = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">VELİ GÖRÜNÜMÜ</span><h1>Gelişimi anlaşılır şekilde takip edin.</h1><p>Notlardan çok, çalışma rutini ve bir sonraki destek adımına odaklanın.</p></div></div>
    <section className="parent-summary surface"><div className="student-avatar large">{student.initials}</div><div className="parent-child"><span className="eyebrow muted">ÖĞRENCİ</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><div className="parent-progress"><span>Konu ilerleme göstergesi</span><strong>{mastery}%</strong><div className="progress-track"><span style={{width:mastery+'%'}}/></div></div></section>
    <div className="parent-grid"><section className="surface"><span className="eyebrow muted">BU OTURUMDA</span><h3>{submitted?'Bir soru üzerinde çalıştı':'Çalışma sırasındaki adım'}</h3><p>{submitted?'Yanıt sonrası açıklama ve tekrar önerisi sunuldu.':'Bir soruyu kendi başına denemesi ve ardından açıklamayı incelemesi planlandı.'}</p><div className="parent-step"><CheckCircle2 size={17}/><span>Önce kendi başına deneme</span></div><div className="parent-step"><CheckCircle2 size={17}/><span>Yanlışın nedenini anlama</span></div><div className="parent-step"><Clock3 size={17}/><span>Benzer soruyla pekiştirme</span></div></section><section className="surface parent-advice"><div className="plan-icon amber"><Lightbulb size={18}/></div><span className="eyebrow muted">EVDE DESTEK İÇİN</span><h3>“Bugün neyi farklı anladın?”</h3><p>Doğru sayısını sormak yerine, öğrendiği kuralı kendi cümleleriyle anlatmasını isteyin.</p><button className="button button-secondary" onClick={()=>{setRole('student');setView('progress')}}>Gelişim görünümünü aç <ArrowRight size={15}/></button></section></div>
  </div>;

  const renderCenter = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KÜBİK · KURUM GÖRÜNÜMÜ</span><h1>Eğitim sürecini görünür kılın.</h1><p>Bu demo, bireysel öğrenme döngüsünün kurum içindeki karşılığını gösterir. Gerçek kurum verisi içermez.</p></div></div>
    <div className="center-metrics"><section className="surface"><span className="metric-label">AKTİF DEMO ÖĞRENCİ</span><strong>01</strong><small>Sunum senaryosu · gerçek kayıt sayısı değil</small></section><section className="surface"><span className="metric-label">ÖĞRENME DÖNGÜSÜ</span><strong>{submitted?'3 / 3':'1 / 3'}</strong><small>{submitted?'Yanıt ve geri bildirim gösterildi.':'Yanıt bekleniyor; akış canlı denenebilir.'}</small></section><section className="surface"><span className="metric-label">AI BAĞLANTISI</span><strong>{health?.hasGeminiKey?'Hazır':'Kontrol gerekli'}</strong><small>API anahtarı sunucu tarafından kontrol edilir.</small></section></div>
    <section className="surface center-flow"><div className="surface-heading"><div><span className="eyebrow muted">ÜRÜNÜN TEMEL DÖNGÜSÜ</span><h3>Tek akış, dört rol</h3></div><span className="round-icon"><Activity size={18}/></span></div><div className="flow-steps"><div><span>01</span><BookOpen size={20}/><strong>Öğrenci çalışır</strong><p>Soru ve yanıt</p></div><ArrowRight/><div><span>02</span><BrainCircuit size={20}/><strong>Geri bildirim</strong><p>Hata nedeni ve ipucu</p></div><ArrowRight/><div><span>03</span><Users size={20}/><strong>Öğretmen görür</strong><p>Müdahale önerisi</p></div><ArrowRight/><div><span>04</span><Activity size={20}/><strong>İlerleme izlenir</strong><p>Ortak kayıt</p></div></div></section>
    <section className="surface center-next"><div><span className="eyebrow muted">ÜRÜN KEŞFİ İÇİN SONRAKİ ADIM</span><h3>Önce Kubik’in gerçek sürecini tanımlayalım.</h3><p>Öğrenci grupları, öğretmen iş akışı, mevcut dijital araçlar ve veli iletişimi sahipleriyle birlikte doğrulanmalı. Bu demo üretim sistemi veya gelir tahmini değildir.</p></div><button className="button button-primary" onClick={()=>setNotice('Keşif gündemi: öğrenci akışı, öğretmen müdahalesi, veli iletişimi ve ölçülebilir kazanımlar.')}>Keşif gündemini göster <ArrowRight size={15}/></button></section>
  </div>;

  return <div className="product-shell">
    <header className="topbar"><button className="brand" onClick={()=>{setRole('student');setView('today')}} aria-label="Kübik ana sayfa"><span className="brand-symbol"><span/><span/><span/><span/></span><span className="brand-word">kübik<span>+</span><small>ÖĞRENME ATÖLYESİ</small></span></button>
      <div className="topbar-center"><span className="demo-status"/><span>ÜRÜN DENEYİMİ</span><span className="topbar-separator">/</span><span>{role==='student'?'ÖĞRENCİ ROTASI':role==='teacher'?'ÖĞRETMEN MASASI':role==='parent'?'VELİ ÖZETİ':'KURUM PERSPEKTİFİ'}</span></div>
      <div className="topbar-actions"><div className="track-switch"><button className={track==='LGS'?'active':''} onClick={()=>changeTrack('LGS')}>LGS</button><button className={track==='YKS'?'active':''} onClick={()=>changeTrack('YKS')}>YKS</button></div><div className="user-chip"><span className="student-avatar">{student.initials}</span><span><strong>{student.name}</strong><small>{student.grade}</small></span><ChevronDown size={14}/></div></div>
    </header>
    <div className="app-frame"><aside className="sidebar"><div className="sidebar-label">ÇALIŞMA ALANI</div><div className="nav-list">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={'nav-item '+(role==='student'&&view===item.id?'active':'')} onClick={()=>{setRole('student');chooseView(item.id)}}><span className="nav-icon"><Icon size={18}/></span><span className="nav-text"><strong>{item.label}</strong><small>{item.hint}</small></span>{role==='student'&&view===item.id&&<span className="nav-active-dot"/>}</button>})}</div><div className="sidebar-divider"/><div className="sidebar-label">AYNI ÖĞRENME, FARKLI BAKIŞ</div><div className="role-list">{roles.filter(r=>r.id!=='student').map(r=><button key={r.id} className={'role-item '+(role===r.id?'active':'')} onClick={()=>setRole(r.id)}><span className="role-avatar">{r.id==='teacher'?<GraduationCap size={17}/>:r.id==='parent'?<Users size={17}/>:<Activity size={17}/>}</span><span>{r.label}</span><ChevronRight size={15}/></button>)}</div><div className="sidebar-bottom"><div className="privacy-mark"><ShieldCheck size={16}/><span><strong>Güvenilir öğrenme</strong><small>Demo · gerçek öğrenci hesabı değil</small></span></div><button className="help-link" onClick={()=>setNotice('Bu demo, Kubik ile birlikte doğrulanacak bir ürün fikridir; üretim sistemi değildir.')}>Bu demo hakkında <CircleHelp size={14}/></button></div></aside>
      <main className="main-area"><div className="mobile-track-note"><span className="live-dot"/> {student.goal} <span>· Demo profili</span></div>{notice&&<div className="notice-bar"><Lightbulb size={16}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Bildirimi kapat"><X size={15}/></button></div>}
        {role==='student'?renderStudent():role==='teacher'?renderTeacher():role==='parent'?renderParent():renderCenter()}
        <footer className="app-footer"><span>kübik+ <i>·</i> Öğrenme atölyesi</span><span><ShieldCheck size={13}/> Demo içerikleri açıkça etiketlenmiştir</span></footer>
      </main>
    </div>
  </div>;
}

export default App;
)
    .replace(/\\\\\\)/g, () => '
type Role = 'student' | 'teacher' | 'parent' | 'center';
type View = 'today' | 'practice' | 'coach' | 'progress';
type ChatItem = { role: 'user' | 'assistant'; text: string };
type AnswerResult = { correct: boolean; explanation: string; misconception?: string; repeated?: boolean; unverified?: boolean };
type Option = { id: string; text: string };
type Question = {
  id: string; track: Track; topic: string; prompt: string; options: Option[];
  source: string; sourceUrl?: string; verified: boolean; hints?: string[];
};
const students: Record<Track, { id: string; name: string; grade: string; goal: string; initials: string }> = {
  LGS: { id: 'std_lgs_801', name: 'Kerem Demir', grade: '8. sınıf', goal: 'LGS · Matematik', initials: 'KD' },
  YKS: { id: 'std_yks_1101', name: 'Selin Yılmaz', grade: '11. sınıf', goal: 'YKS · Matematik', initials: 'SY' }
};
const roles: { id: Role; label: string }[] = [
  { id: 'student', label: 'Öğrenci' }, { id: 'teacher', label: 'Öğretmen' },
  { id: 'parent', label: 'Veli' }, { id: 'center', label: 'Kurum' }
];
const demoRetry: Question = {
  id: 'demo-retry-uslu-01', track: 'LGS', topic: 'Üslü ifadeler · pekiştirme',
  prompt: 'Bir sayının 2⁵ katı 2⁹ ise bu sayı kaçtır?',
  options: [{id:'A',text:'2³'}, {id:'B',text:'2⁴'}, {id:'C',text:'2⁵'}, {id:'D',text:'2¹⁴'}],
  source: 'Kübik demo için hazırlanmış pekiştirme sorusu · resmî sınav sorusu değildir',
  verified: false
};
const demoYks: Question = {
  id: 'demo-yks-function-01', track: 'YKS', topic: 'Fonksiyonlar',
  prompt: 'f(x) = 3x − 2 olduğuna göre f(4) kaçtır?',
  options: [{id:'A',text:'8'}, {id:'B',text:'10'}, {id:'C',text:'12'}, {id:'D',text:'14'}],
  source: 'Kübik demo için hazırlanmış örnek · resmî YKS sorusu değildir',
  verified: false
};
const localAnswer: Record<string, { key: string; explanation: string; misconception: Record<string,string> }> = {
  'demo-retry-uslu-01': {
    key:'B', explanation:'2⁵ ile çarpıldığında 2⁹ elde ediliyorsa, aynı tabanlı üsleri bölme işleminde çıkarırız: 2⁹ ÷ 2⁵ = 2⁴.',
    misconception:{A:'Üsleri çıkarırken 9 − 5 işlemini yeniden kontrol et. Sonuç 4 olmalı.',C:'2⁵ sayının kendisi değil, onu çarptığımız katsayı. Bilinmeyeni bulmak için bölmeliyiz.',D:'Çarpma kuralını kullanmış olabilirsin; bilinmeyeni yalnız bırakmak için bölme yap.'}
  },
  'demo-yks-function-01': {
    key:'B', explanation:'f(4) demek, x yerine 4 yazmak demektir: 3 × 4 − 2 = 12 − 2 = 10.',
    misconception:{A:'3 × 4 = 12 adımından sonra 2 çıkarma adımını da yapmalısın.',C:'12 yalnızca 3 × 4 işleminin sonucu. Sonra 2 çıkarılır.',D:'İşlemde +2 yok; verilen ifade 3x − 2.'}
  }
};

function App() {
  const [track, setTrack] = useState<Track>('LGS');
  const [role, setRole] = useState<Role>('student');
  const [view, setView] = useState<View>('today');
  const [officialQuestion, setOfficialQuestion] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [retryMode, setRetryMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatItem[]>([{role:'assistant',text:'Merhaba! Nerede takıldığını birlikte bulalım. İstersen sorudaki bir adımı yazabilir ya da aşağıdaki kısa sorulardan biriyle başlayabilirsin.'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState<{hasGeminiKey:boolean} | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const student = students[track];

  useEffect(() => {
    fetch('/api/health').then(r=>r.json()).then(setHealth).catch(()=>setHealth(null));
  }, []);

  useEffect(() => {
    let alive = true;
    setQuestionLoading(true);
    setQuestion(null);
    setSelected(null); setSubmitted(false); setAnswerResult(null); setRetryMode(false);
    setChat([{role:'assistant',text:track === 'LGS'
      ? 'Bu soruyu hemen çözmek zorunda değilsin. Önce hangi kuralın gerektiğini bulalım; sonra birlikte adım adım ilerleriz.'
      : 'Fonksiyon sorularında ilk küçük adım, x yerine verilen sayıyı yazmaktır. İstersen bunu bir örnek üzerinde deneyelim.'}]);
    const load = async () => {
      try {
        const response = await fetch('/api/content/verified-question?studentId=' + student.id);
        const data = await response.json();
        if (!alive) return;
        if (track === 'LGS' && data.available && data.question) {
          const q = data.question;
          const mapped: Question = {
            id:q.id, track:'LGS', topic:q.topic, prompt:q.questionText,
            options:q.options.map((o:Option)=>({id:o.id,text:o.text})),
            source:q.sourceDocument, sourceUrl:q.sourceUrl,
            verified:q.verificationStatus === 'verified_official_publication',
            hints:q.pedagogicalHints
          };
          setOfficialQuestion(mapped); setQuestion(mapped);
        } else {
          setOfficialQuestion(null);
          setQuestion(track === 'LGS' ? demoRetry : demoYks);
        }
      } catch {
        if (!alive) return;
        setQuestion(track === 'LGS' ? demoRetry : demoYks);
        setNotice('Sunucuya ulaşılamadı. Şu an yalnızca yerel demo örneği gösteriliyor.');
      } finally {
        if (alive) { setQuestionLoading(false); loadProgress(); }
      }
    };
    const loadProgress = async () => {
      try {
        const r = await fetch('/api/student/progress?studentId=' + student.id);
        const d = await r.json();
        if (alive && r.ok && typeof d.progress?.currentMastery === 'number') setProgress(d.progress.currentMastery);
        else if (alive) setProgress(null);
      } catch { if (alive) setProgress(null); }
    };
    void load();
    return () => { alive = false; };
  }, [track, student.id]);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth',block:'end'}); }, [chat,chatLoading]);

  const mastery = progress ?? (track === 'LGS' ? 52 : 38);
  const nav: {id:View; label:string; hint:string; icon:typeof House}[] = [
    {id:'today',label:'Bugünüm',hint:'Günlük rota',icon:House},
    {id:'practice',label:'Soru atölyesi',hint:'Çöz ve öğren',icon:NotebookPen},
    {id:'coach',label:'AI çalışma arkadaşı',hint:'Takıldığın yerde',icon:MessageCircle},
    {id:'progress',label:'Gelişimim',hint:'Neler değişiyor?',icon:Activity}
  ];
  const changeTrack = (next:Track) => { setTrack(next); setRole('student'); setView('today'); setNotice(''); };
  const chooseView = (next:View) => { setView(next); setNotice(''); };

  const submitAnswer = async () => {
    if (!question || !selected || submitted) return;
    setSubmitted(true);
    const local = localAnswer[question.id];
    let correct = false;
    let explanation = '';
    let misconception = '';
    let repeated = false;
    if (question.verified && track === 'LGS') {
      try {
        const r = await fetch('/api/student/answer', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            studentId:student.id, topicId:'top_lgs_uslu', questionId:question.id,
            chosenOptionId:selected, hintsUsedCount:0, aiTutorInteractionsCount:chat.filter(x=>x.role==='user').length
          })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Yanıt kaydedilemedi.');
        correct = Boolean(d.isCorrect); repeated = Boolean(d.isRepeatedAttempt);
        explanation = d.officialSolution?.summary || d.explanation || 'Yanıt değerlendirildi.';
        const selectedIndex = question.options.findIndex(o=>o.id===selected);
        const hintIndex = selectedIndex === 0 ? 0 : Math.max(0, selectedIndex - 1);
        misconception = correct ? '' : (question.hints?.[hintIndex] || 'Önce ifadeleri aynı tabana çevirip üs kurallarını adım adım uygulayalım.');
        if (typeof d.updatedMastery?.currentMastery === 'number') setProgress(d.updatedMastery.currentMastery);
      } catch {
        setAnswerResult({
          correct: false,
          unverified: true,
          explanation: 'Sunucuya ulaşılamadığı için bu yanıt doğrulanamadı. Cevap anahtarını tahmin etmeyeceğiz ve ilerleme kaydı oluşturulmadı.',
          misconception: ''
        });
        return;
      }
    } else if (local) {
      correct = selected === local.key;
      explanation = local.explanation;
      misconception = correct ? '' : (local.misconception[selected] || 'İşlem adımlarını birer birer kontrol edelim.');
    } else {
      explanation = 'Bu örnek için cevap anahtarı doğrulanmadı. Öğretmenle birlikte kontrol etmek üzere işaretlendi.';
    }
    setAnswerResult({correct, explanation, misconception, repeated});
    if (!correct) setNotice('Hata bir sonuç değil, nereden devam edeceğimizi gösteren ipucu.');
  };

  const startRetry = () => {
    setQuestion(track === 'LGS' ? demoRetry : demoYks);
    setRetryMode(true); setSelected(null); setSubmitted(false); setAnswerResult(null);
    setView('practice'); setRole('student');
    setNotice('Pekiştirme sorusu açıldı. Bu soru demo için hazırlandı; resmî sınav sorusu değildir.');
  };

  const sendChat = async (message?:string) => {
    const text = (message ?? chatInput).trim();
    if (!text || chatLoading) return;
    setChatInput('');
    setChatError('');
    const next = [...chat,{role:'user' as const,text}];
    setChat(next); setChatLoading(true);
    try {
      const response = await fetch('/api/tutor/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          studentId:student.id,
          userMessage:text,
          chatHistory:next.slice(-8).map(m=>({role:m.role,content:m.text}))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI yanıtı alınamadı.');
      setChat(old=>[...old,{role:'assistant',text:data.reply}]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Bağlantı kurulamadı.';
      setChatError(messageText);
      const safeFallback = track === 'LGS'
        ? 'Şu anda canlı AI yanıtı alamadım. Yine de şu ilk adımı birlikte yapabiliriz: 8⁴ ifadesini 2 tabanında yaz. Çünkü 8 = 2³. Sonra üslerin üssü kuralını uygula. Bu, otomatik AI yanıtı değil; demo içindeki sabit ipucudur.'
        : 'Canlı AI yanıtı alınamadı. Fonksiyonlarda x yerine verilen sayıyı koyup işlem sırasıyla ilerleriz. Bu parkurda resmî soru içeriği henüz doğrulanmadı; bu yüzden örneği resmî soru diye sunmayacağım.';
      setChat(old=>[...old,{role:'assistant',text:safeFallback}]);
    } finally { setChatLoading(false); }
  };

  const resetPractice = () => {
    if (track === 'LGS' && officialQuestion) { setQuestion(officialQuestion); setRetryMode(false); }
    else { setQuestion(track === 'LGS' ? demoRetry : demoYks); setRetryMode(true); }
    setSelected(null); setSubmitted(false); setAnswerResult(null); setNotice('');
  };

  const renderStudent = () => {
    if (view === 'coach') return Coach();
    if (view === 'progress') return ProgressView();
    if (view === 'practice') return PracticeView();
    return TodayView();
  };

  function TodayView() {
    return <div className="page-stack">
      <section className="welcome-band">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="live-dot" /> BUGÜNÜN ÖĞRENME ROTASI</div>
          <h1>Selam {student.name.split(' ')[0]},<br/><span>küçük adımlar büyütür.</span></h1>
          <p>Bugün her şeyi bitirmek zorunda değilsin. Bir konuyu gerçekten anlamak yeterli.</p>
          <button className="button button-light" onClick={()=>chooseView('practice')}>İlk çalışmaya başla <ArrowRight size={16}/></button>
        </div>
        <div className="route-art" aria-hidden="true">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="orbit-core"><BrainCircuit size={38}/></div>
          <div className="orbit-tag tag-one"><Target size={15}/> 1 konu</div>
          <div className="orbit-tag tag-two"><CheckCircle2 size={15}/> 1 adım</div>
        </div>
      </section>
      <div className="section-heading"><div><span className="eyebrow muted">BUGÜN SANA ÖZEL</span><h2>Çalışma planın</h2></div><span className="quiet-pill"><CalendarDays size={14}/> Bugün · 20 dk</span></div>
      <section className="plan-grid">
        <button className="plan-card plan-main" onClick={()=>chooseView('practice')}>
          <div className="plan-icon indigo"><NotebookPen size={20}/></div><div className="plan-meta"><span>01 · MATEMATİK</span><span className="duration"><Clock3 size={13}/> 10 dk</span></div>
          <h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3><p>{track==='LGS'?'Üs kurallarını bir problemde kullan.':'Fonksiyon değerini adım adım hesapla.'}</p>
          <div className="plan-bottom"><span>Çalışmaya geç</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('coach')}>
          <div className="plan-icon mint"><MessageCircle size={20}/></div><div className="plan-meta"><span>02 · ANLAMA</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Takıldığın yeri sor</h3><p>Bir adımı anlamadıysan AI çalışma arkadaşıyla birlikte aç.</p>
          <div className="plan-bottom"><span>Soru sor</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('progress')}>
          <div className="plan-icon amber"><Activity size={20}/></div><div className="plan-meta"><span>03 · GERİ BAKIŞ</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Ne öğrendin?</h3><p>Yanıtlarını ve sıradaki küçük adımını gözden geçir.</p>
          <div className="plan-bottom"><span>Gelişimi gör</span><ArrowRight size={16}/></div>
        </button>
      </section>
      <div className="lower-grid">
        <section className="surface focus-panel"><div className="surface-heading"><div><span className="eyebrow muted">BU HAFTAKİ ODAĞIN</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="round-icon"><Target size={18}/></span></div>
          <p className="body-copy">Amaç sadece doğru cevabı bulmak değil; hangi kuralı neden kullandığını anlatabilmek.</p>
          <div className="mastery-line"><div><span>Örnek ilerleme göstergesi</span><strong>{mastery}%</strong></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Bu gösterge başlangıç demo değeridir; gerçek öğrenci başarısı değildir.':'Bu demo oturumunda sunucuya kaydedilen konu ilerlemesi.'}</small></div>
        </section>
        <section className="surface note-panel"><div className="note-icon"><Lightbulb size={20}/></div><span className="eyebrow muted">KÜÇÜK HATIRLATMA</span><h3>Hata yapmak, öğrenmenin bir parçası.</h3><p>Yanlış cevapta sadece sonucu değil, düşünme adımını da inceliyoruz.</p><button className="text-button" onClick={()=>chooseView('practice')}>Bir soruda dene <ArrowRight size={15}/></button></section>
      </div>
    </div>;
  }

  function PracticeView() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME ATÖLYESİ / MATEMATİK</span><h1>Çöz. Anla. Bir daha dene.</h1><p>Yanıtından sonra sadece doğru/yanlış değil, düşünme adımına dair geri bildirim alırsın.</p></div><span className="quiet-pill"><ShieldCheck size={14}/>{question?.verified?'Kaynağı doğrulanmış':'Demo örneği'}</span></div>
      {questionLoading || !question ? <div className="surface loading-surface"><div className="spinner"/><p>Soru hazırlanıyor…</p></div> :
      <div className="practice-layout">
        <section className="surface question-panel">
          <div className="question-top"><div className="topic-chip"><BookOpen size={14}/>{question.topic}</div><span className="question-count">{retryMode?'PEKİŞTİRME':'SORU 01'} / MATEMATİK</span></div>
          <h2>{question.prompt}</h2>
          <div className="option-list">{question.options.map((option,index)=><button key={option.id} disabled={submitted} className={'answer-option '+(selected===option.id?'selected ':'')+(submitted && answerResult && !answerResult.unverified && option.id=== (question.verified?'B':localAnswer[question.id]?.key)?'answer-correct ':'')+(submitted && selected===option.id && answerResult && !answerResult.correct && !answerResult.unverified?'answer-wrong':'')} onClick={()=>setSelected(option.id)}><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option.text.replace(/^[A-D]\)\s*/,'')}</span>{selected===option.id&&<span className="option-check"><Check size={15}/></span>}</button>)}</div>
          {!submitted ? <div className="question-actions"><span className="helper-text"><CircleHelp size={14}/> Takılırsan AI çalışma arkadaşına sorabilirsin.</span><button className="button button-primary" disabled={!selected} onClick={submitAnswer}>Yanıtımı kontrol et <ArrowRight size={16}/></button></div> :
          <div className={'feedback-panel '+(answerResult?.correct?'feedback-good':'feedback-try')}><div className="feedback-title">{answerResult?.correct?<CheckCircle2 size={19}/>:<Lightbulb size={19}/>}<div><strong>{answerResult?.unverified?'Yanıt henüz doğrulanamadı.':answerResult?.correct?'Evet, doğru düşünüyorsun.':'Burada bir düşünme adımını yeniden inceleyelim.'}</strong><span>{answerResult?.unverified?'Bağlantı geri geldiğinde yeniden deneyebilirsin.':answerResult?.correct?'Kuralı doğru uyguladın.':'Yanlış cevap bir ipucu; birlikte nerede ayrıldığını bulalım.'}</span></div></div>
            <p>{answerResult?.correct?answerResult.explanation:(answerResult?.misconception||answerResult?.explanation)}</p>
            {answerResult?.repeated&&<small>Bu soru daha önce kaydedilmiş. Tekrar çözüm yeni ilerleme olarak sayılmadı.</small>}
            <div className="feedback-actions"><button className="button button-primary" onClick={()=>{setView('coach');setChatInput('Bu soruda '+(answerResult?.correct?'hangi kuralı kullandığımı':'hangi adımda hata yapmış olabileceğimi')+' adım adım anlatır mısın?')}}><MessageCircle size={15}/> Birlikte incele</button><button className="button button-secondary" onClick={startRetry}>Benzer soru çöz <ArrowRight size={15}/></button></div>
          </div>}
          <div className="source-strip"><ShieldCheck size={15}/><div><strong>{question.verified?'Resmî kaynak bilgisi':'Örnek içerik'}</strong><span>{question.source}</span></div>{question.sourceUrl&&<a href={question.sourceUrl} target="_blank" rel="noreferrer">Kaynağı aç <ArrowUpRight size={13}/></a>}</div>
        </section>
        <aside className="practice-aside">
          <section className="surface aside-card"><div className="aside-heading"><span className="plan-icon mint"><BrainCircuit size={18}/></span><span className="eyebrow muted">ÖĞRENME YÖNTEMİ</span></div><h3>Sonucu değil, düşünme yolunu bul.</h3><ol className="step-list"><li className={submitted?'complete':''}><span>1</span><div><strong>Önce kendin dene</strong><small>İlk düşünceni seç.</small></div></li><li className={answerResult?'complete':''}><span>2</span><div><strong>Geri bildirimi incele</strong><small>Hangi adımın önemli olduğunu gör.</small></div></li><li><span>3</span><div><strong>Benzer soruda uygula</strong><small>Öğrenmeyi tekrar dene.</small></div></li></ol></section>
          <section className="surface aside-card ai-nudge"><span className="eyebrow muted">YARDIMA MI İHTİYACIN VAR?</span><p>“Neden bu işlemi yaptık?” diye sorabilirsin.</p><button className="text-button" onClick={()=>chooseView('coach')}>AI çalışma arkadaşına git <ArrowRight size={15}/></button></section>
        </aside>
      </div>}
    </div>;
  }

  function Coach() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME DESTEĞİ</span><h1>AI çalışma arkadaşın.</h1><p>Sana cevabı hemen vermek yerine düşünme adımlarını açmana yardım eder.</p></div><span className={'connection-pill '+(health?.hasGeminiKey?'connected':'not-connected')}><span/>{health?.hasGeminiKey?'Gemini bağlantısı hazır':health===null?'Bağlantı durumu bilinmiyor':'API anahtarı algılanmadı'}</span></div>
      <div className="coach-layout">
        <section className="surface chat-panel">
          <div className="chat-head"><div className="coach-avatar"><Sparkles size={20}/></div><div><strong>Kübik Öğrenme Rehberi</strong><span><span className="live-dot"/> Matematik · {student.grade}</span></div><span className="chat-safe"><ShieldCheck size={14}/> Öğrenme odaklı</span></div>
          <div className="chat-messages">{chat.map((item,i)=><div key={i} className={'message-row '+(item.role==='user'?'message-user':'')}><div className="message-avatar">{item.role==='user'?student.initials:<Sparkles size={15}/>}</div><div className="message-bubble"><span className="message-author">{item.role==='user'?'Sen':'Öğrenme rehberi'}</span><p>{item.text}</p></div></div>)}{chatLoading&&<div className="message-row"><div className="message-avatar"><Sparkles size={15}/></div><div className="message-bubble typing"><span/><span/><span/></div></div>}<div ref={chatEnd}/></div>
          {chatError&&<div className="chat-error"><CircleHelp size={14}/>{chatError} <span>Gösterilen sabit ipucu canlı AI yanıtı değildir.</span></div>}
          <div className="suggestion-row"><button onClick={()=>void sendChat(track==='LGS'?'Üslerin üssü kuralını basit bir örnekle açıklar mısın?':'Fonksiyonlarda x yerine değer yazmak ne demek?')}>{track==='LGS'?'Üslerin üssü kuralı':'Fonksiyon nedir?'}</button><button onClick={()=>void sendChat('Bana cevabı söylemeden bir ipucu verir misin?')}>Bir ipucu ver</button><button onClick={()=>void sendChat('Küçük bir örnek üzerinden anlatır mısın?')}>Örnekle anlat</button></div>
          <form className="chat-composer" onSubmit={e=>{e.preventDefault();void sendChat();}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Takıldığın adımı buraya yaz…" aria-label="AI çalışma arkadaşına mesaj"/><button className="send-button" type="submit" disabled={!chatInput.trim()||chatLoading} aria-label="Mesajı gönder"><Send size={17}/></button></form>
          <p className="chat-disclaimer">AI yanıtları hata içerebilir. Önemli akademik kararlar için öğretmeninle kontrol et.</p>
        </section>
        <aside className="surface coach-context"><span className="eyebrow muted">ÇALIŞMA BAĞLAMI</span><h3>Bugünkü konun</h3><div className="context-topic"><div className="plan-icon indigo"><BookOpen size={18}/></div><div><strong>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</strong><span>Matematik · {student.grade}</span></div></div><div className="context-divider"/><span className="eyebrow muted">İSTERSEN ŞUNU SOR</span><button className="prompt-card" onClick={()=>setChatInput('Bu konuyu 3 kısa adımda anlatır mısın?')}>Bu konuyu 3 kısa adımda anlat <ArrowRight size={15}/></button><button className="prompt-card" onClick={()=>setChatInput('Yanlış cevabım hangi düşünce hatasından kaynaklanmış olabilir?')}>Yanlışım ne anlatıyor olabilir? <ArrowRight size={15}/></button><div className="teacher-note"><Lightbulb size={16}/><p>Bir soruda uzun süre takılırsan, öğretmeninden destek istemek de iyi bir öğrenme adımıdır.</p></div></aside>
      </div>
    </div>;
  }

  function ProgressView() {
    return <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KENDİ GELİŞİMİNİ İZLE</span><h1>Her doğru adım bir iz bırakır.</h1><p>Bu görünüm, demo oturumunda kaydedilen yanıtları ve sıradaki çalışma önerisini bir araya getirir.</p></div></div>
      <div className="progress-overview"><section className="surface mastery-card"><span className="eyebrow muted">KONU İLERLEMESİ</span><div className="mastery-number">{mastery}<small>%</small></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><p>{progress===null?'Başlangıç göstergesi · gerçek öğrenci verisi değildir.':'Sunucu tarafında kayıtlı demo konu ilerlemesi.'}</p></section><section className="surface next-step-card"><div className="plan-icon amber"><Target size={19}/></div><span className="eyebrow muted">ÖNERİLEN SONRAKİ ADIM</span><h3>{answerResult&&!answerResult.correct?'Bu adımı yeniden çalış':'Benzer bir soruda kuralı uygula'}</h3><p>{answerResult&&!answerResult.correct?'Yanlış seçeneğin hangi düşünceyi işaret ettiğini AI çalışma arkadaşıyla incele.':'Aynı kazanımı farklı bir örnekte kullanarak gerçekten anladığını kontrol et.'}</p><button className="button button-primary" onClick={startRetry}>Bir soru daha çöz <ArrowRight size={15}/></button></section></div>
      <section className="surface reflection-card"><div className="surface-heading"><div><span className="eyebrow muted">KISA ÖZ DEĞERLENDİRME</span><h3>Bugün kendine sor</h3></div><span className="round-icon"><Lightbulb size={18}/></span></div><div className="reflection-list"><div><span>01</span><p>Hangi kuralı kullandım, neden?</p><button onClick={()=>{setView('coach');setChatInput('Bugünkü soruda hangi kuralı neden kullandığımı anlamama yardım et.')}}>Birlikte düşün <ArrowRight size={14}/></button></div><div><span>02</span><p>Benzer bir soruda tek başıma deneyebilir miyim?</p><button onClick={startRetry}>Kendimi dene <ArrowRight size={14}/></button></div><div><span>03</span><p>Hangi adım için öğretmen desteğine ihtiyacım var?</p><button onClick={()=>setNotice('Öğretmen görünümünde bu konu için destek notu gösteriliyor.')}>Not al <ArrowRight size={14}/></button></div></div></section>
    </div>;
  }

  const renderTeacher = () => <div className="page-stack">
    <div className="page-intro"><div><span className="eyebrow muted">ÖĞRETMEN ÇALIŞMA ALANI</span><h1>Öğrencinin takıldığı yeri görün.</h1><p>Öğrenme verisini bir sonraki öğretmen müdahalesine dönüştüren sade görünüm.</p></div><span className="quiet-pill"><Users size={14}/> Demo öğrenci: {student.name}</span></div>
    <section className="teacher-student-banner"><div className="student-avatar large">{student.initials}</div><div className="teacher-student-copy"><span className="eyebrow">ÖĞRENCİ KARTI · DEMO</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><button className="button button-light" onClick={()=>{setRole('student');setView('practice')}}>Öğrenci akışını aç <ArrowRight size={15}/></button></section>
    <div className="teacher-grid"><section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">KONU DURUMU</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="topic-chip"><Activity size={14}/> {progress===null?'Demo': 'Kayıtlı'}</span></div><div className="teacher-mastery"><strong>{mastery}%</strong><div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Başlangıç örneği; henüz kayıtlı sonuç yok.':'Öğrenci oturumunda kaydedilen konu göstergesi.'}</small></div></div><div className="signal-row"><div className="signal-icon amber"><Lightbulb size={17}/></div><div><strong>Öğretmen için olası müdahale</strong><p>{answerResult&&!answerResult.correct?'Üs kurallarında aynı tabana çevirme adımını kısa bir örnekle tekrar edin.':'Öğrenciden kullandığı kuralı kendi cümleleriyle açıklamasını isteyin.'}</p></div></div></section>
    <section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">OTURUM ÖZETİ</span><h3>Bu çalışmada</h3></div><span className="round-icon"><NotebookPen size={17}/></span></div><div className="session-stat"><span>Yanıt durumu</span><strong>{submitted?(answerResult?.correct?'Doğru':'Tekrar gerekli'):'Henüz yanıtlanmadı'}</strong></div><div className="session-stat"><span>AI destek etkileşimi</span><strong>{chat.filter(x=>x.role==='user').length} mesaj</strong></div><div className="session-stat"><span>İçerik kaynağı</span><strong>{question?.verified?'MEB · doğrulanmış':'Demo örneği'}</strong></div><button className="button button-secondary full-button" onClick={()=>{setRole('student');setView('coach')}}>Öğrenciyle aynı konuyu incele <ArrowRight size={15}/></button></section></div>
    <section className="surface teacher-next"><div className="plan-icon mint"><MessageCircle size={18}/></div><div><span className="eyebrow muted">ÖNERİLEN ÖĞRETMEN NOTU</span><h3>“Sonucu nasıl bulduğunu anlatır mısın?”</h3><p>Öğrencinin yalnızca doğru cevabı değil, kullandığı düşünme yolunu da açıklamasını isteyin.</p></div><button className="text-button" onClick={()=>setNotice('Öğretmen notu bu demo oturumu için seçildi.')}>Notu seç <Check size={15}/></button></section>
  </div>;

  const renderParent = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">VELİ GÖRÜNÜMÜ</span><h1>Gelişimi anlaşılır şekilde takip edin.</h1><p>Notlardan çok, çalışma rutini ve bir sonraki destek adımına odaklanın.</p></div></div>
    <section className="parent-summary surface"><div className="student-avatar large">{student.initials}</div><div className="parent-child"><span className="eyebrow muted">ÖĞRENCİ</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><div className="parent-progress"><span>Konu ilerleme göstergesi</span><strong>{mastery}%</strong><div className="progress-track"><span style={{width:mastery+'%'}}/></div></div></section>
    <div className="parent-grid"><section className="surface"><span className="eyebrow muted">BU OTURUMDA</span><h3>{submitted?'Bir soru üzerinde çalıştı':'Çalışma sırasındaki adım'}</h3><p>{submitted?'Yanıt sonrası açıklama ve tekrar önerisi sunuldu.':'Bir soruyu kendi başına denemesi ve ardından açıklamayı incelemesi planlandı.'}</p><div className="parent-step"><CheckCircle2 size={17}/><span>Önce kendi başına deneme</span></div><div className="parent-step"><CheckCircle2 size={17}/><span>Yanlışın nedenini anlama</span></div><div className="parent-step"><Clock3 size={17}/><span>Benzer soruyla pekiştirme</span></div></section><section className="surface parent-advice"><div className="plan-icon amber"><Lightbulb size={18}/></div><span className="eyebrow muted">EVDE DESTEK İÇİN</span><h3>“Bugün neyi farklı anladın?”</h3><p>Doğru sayısını sormak yerine, öğrendiği kuralı kendi cümleleriyle anlatmasını isteyin.</p><button className="button button-secondary" onClick={()=>{setRole('student');setView('progress')}}>Gelişim görünümünü aç <ArrowRight size={15}/></button></section></div>
  </div>;

  const renderCenter = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KÜBİK · KURUM GÖRÜNÜMÜ</span><h1>Eğitim sürecini görünür kılın.</h1><p>Bu demo, bireysel öğrenme döngüsünün kurum içindeki karşılığını gösterir. Gerçek kurum verisi içermez.</p></div></div>
    <div className="center-metrics"><section className="surface"><span className="metric-label">AKTİF DEMO ÖĞRENCİ</span><strong>01</strong><small>Sunum senaryosu · gerçek kayıt sayısı değil</small></section><section className="surface"><span className="metric-label">ÖĞRENME DÖNGÜSÜ</span><strong>{submitted?'3 / 3':'1 / 3'}</strong><small>{submitted?'Yanıt ve geri bildirim gösterildi.':'Yanıt bekleniyor; akış canlı denenebilir.'}</small></section><section className="surface"><span className="metric-label">AI BAĞLANTISI</span><strong>{health?.hasGeminiKey?'Hazır':'Kontrol gerekli'}</strong><small>API anahtarı sunucu tarafından kontrol edilir.</small></section></div>
    <section className="surface center-flow"><div className="surface-heading"><div><span className="eyebrow muted">ÜRÜNÜN TEMEL DÖNGÜSÜ</span><h3>Tek akış, dört rol</h3></div><span className="round-icon"><Activity size={18}/></span></div><div className="flow-steps"><div><span>01</span><BookOpen size={20}/><strong>Öğrenci çalışır</strong><p>Soru ve yanıt</p></div><ArrowRight/><div><span>02</span><BrainCircuit size={20}/><strong>Geri bildirim</strong><p>Hata nedeni ve ipucu</p></div><ArrowRight/><div><span>03</span><Users size={20}/><strong>Öğretmen görür</strong><p>Müdahale önerisi</p></div><ArrowRight/><div><span>04</span><Activity size={20}/><strong>İlerleme izlenir</strong><p>Ortak kayıt</p></div></div></section>
    <section className="surface center-next"><div><span className="eyebrow muted">ÜRÜN KEŞFİ İÇİN SONRAKİ ADIM</span><h3>Önce Kubik’in gerçek sürecini tanımlayalım.</h3><p>Öğrenci grupları, öğretmen iş akışı, mevcut dijital araçlar ve veli iletişimi sahipleriyle birlikte doğrulanmalı. Bu demo üretim sistemi veya gelir tahmini değildir.</p></div><button className="button button-primary" onClick={()=>setNotice('Keşif gündemi: öğrenci akışı, öğretmen müdahalesi, veli iletişimi ve ölçülebilir kazanımlar.')}>Keşif gündemini göster <ArrowRight size={15}/></button></section>
  </div>;

  return <div className="product-shell">
    <header className="topbar"><button className="brand" onClick={()=>{setRole('student');setView('today')}} aria-label="Kübik ana sayfa"><span className="brand-symbol"><span/><span/><span/><span/></span><span className="brand-word">kübik<span>+</span><small>ÖĞRENME ATÖLYESİ</small></span></button>
      <div className="topbar-center"><span className="demo-status"/><span>ÜRÜN DENEYİMİ</span><span className="topbar-separator">/</span><span>{role==='student'?'ÖĞRENCİ ROTASI':role==='teacher'?'ÖĞRETMEN MASASI':role==='parent'?'VELİ ÖZETİ':'KURUM PERSPEKTİFİ'}</span></div>
      <div className="topbar-actions"><div className="track-switch"><button className={track==='LGS'?'active':''} onClick={()=>changeTrack('LGS')}>LGS</button><button className={track==='YKS'?'active':''} onClick={()=>changeTrack('YKS')}>YKS</button></div><div className="user-chip"><span className="student-avatar">{student.initials}</span><span><strong>{student.name}</strong><small>{student.grade}</small></span><ChevronDown size={14}/></div></div>
    </header>
    <div className="app-frame"><aside className="sidebar"><div className="sidebar-label">ÇALIŞMA ALANI</div><div className="nav-list">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={'nav-item '+(role==='student'&&view===item.id?'active':'')} onClick={()=>{setRole('student');chooseView(item.id)}}><span className="nav-icon"><Icon size={18}/></span><span className="nav-text"><strong>{item.label}</strong><small>{item.hint}</small></span>{role==='student'&&view===item.id&&<span className="nav-active-dot"/>}</button>})}</div><div className="sidebar-divider"/><div className="sidebar-label">AYNI ÖĞRENME, FARKLI BAKIŞ</div><div className="role-list">{roles.filter(r=>r.id!=='student').map(r=><button key={r.id} className={'role-item '+(role===r.id?'active':'')} onClick={()=>setRole(r.id)}><span className="role-avatar">{r.id==='teacher'?<GraduationCap size={17}/>:r.id==='parent'?<Users size={17}/>:<Activity size={17}/>}</span><span>{r.label}</span><ChevronRight size={15}/></button>)}</div><div className="sidebar-bottom"><div className="privacy-mark"><ShieldCheck size={16}/><span><strong>Güvenilir öğrenme</strong><small>Demo · gerçek öğrenci hesabı değil</small></span></div><button className="help-link" onClick={()=>setNotice('Bu demo, Kubik ile birlikte doğrulanacak bir ürün fikridir; üretim sistemi değildir.')}>Bu demo hakkında <CircleHelp size={14}/></button></div></aside>
      <main className="main-area"><div className="mobile-track-note"><span className="live-dot"/> {student.goal} <span>· Demo profili</span></div>{notice&&<div className="notice-bar"><Lightbulb size={16}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Bildirimi kapat"><X size={15}/></button></div>}
        {role==='student'?renderStudent():role==='teacher'?renderTeacher():role==='parent'?renderParent():renderCenter()}
        <footer className="app-footer"><span>kübik+ <i>·</i> Öğrenme atölyesi</span><span><ShieldCheck size={13}/> Demo içerikleri açıkça etiketlenmiştir</span></footer>
      </main>
    </div>
  </div>;
}

export default App;
)
    .replace(/\\\\\\[/g, () => '$')
    .replace(/\\\\\\]/g, () => '$');
  return <div className="tutor-rich-text"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{normalized}</ReactMarkdown></div>;
}

type Track = 'LGS' | 'YKS';
type Role = 'student' | 'teacher' | 'parent' | 'center';
type View = 'today' | 'practice' | 'coach' | 'progress';
type ChatItem = { role: 'user' | 'assistant'; text: string };
type AnswerResult = { correct: boolean; explanation: string; misconception?: string; repeated?: boolean; unverified?: boolean };
type Option = { id: string; text: string };
type Question = {
  id: string; track: Track; topic: string; prompt: string; options: Option[];
  source: string; sourceUrl?: string; verified: boolean; hints?: string[];
};
const students: Record<Track, { id: string; name: string; grade: string; goal: string; initials: string }> = {
  LGS: { id: 'std_lgs_801', name: 'Kerem Demir', grade: '8. sınıf', goal: 'LGS · Matematik', initials: 'KD' },
  YKS: { id: 'std_yks_1101', name: 'Selin Yılmaz', grade: '11. sınıf', goal: 'YKS · Matematik', initials: 'SY' }
};
const roles: { id: Role; label: string }[] = [
  { id: 'student', label: 'Öğrenci' }, { id: 'teacher', label: 'Öğretmen' },
  { id: 'parent', label: 'Veli' }, { id: 'center', label: 'Kurum' }
];
const demoRetry: Question = {
  id: 'demo-retry-uslu-01', track: 'LGS', topic: 'Üslü ifadeler · pekiştirme',
  prompt: 'Bir sayının 2⁵ katı 2⁹ ise bu sayı kaçtır?',
  options: [{id:'A',text:'2³'}, {id:'B',text:'2⁴'}, {id:'C',text:'2⁵'}, {id:'D',text:'2¹⁴'}],
  source: 'Kübik demo için hazırlanmış pekiştirme sorusu · resmî sınav sorusu değildir',
  verified: false
};
const demoYks: Question = {
  id: 'demo-yks-function-01', track: 'YKS', topic: 'Fonksiyonlar',
  prompt: 'f(x) = 3x − 2 olduğuna göre f(4) kaçtır?',
  options: [{id:'A',text:'8'}, {id:'B',text:'10'}, {id:'C',text:'12'}, {id:'D',text:'14'}],
  source: 'Kübik demo için hazırlanmış örnek · resmî YKS sorusu değildir',
  verified: false
};
const localAnswer: Record<string, { key: string; explanation: string; misconception: Record<string,string> }> = {
  'demo-retry-uslu-01': {
    key:'B', explanation:'2⁵ ile çarpıldığında 2⁹ elde ediliyorsa, aynı tabanlı üsleri bölme işleminde çıkarırız: 2⁹ ÷ 2⁵ = 2⁴.',
    misconception:{A:'Üsleri çıkarırken 9 − 5 işlemini yeniden kontrol et. Sonuç 4 olmalı.',C:'2⁵ sayının kendisi değil, onu çarptığımız katsayı. Bilinmeyeni bulmak için bölmeliyiz.',D:'Çarpma kuralını kullanmış olabilirsin; bilinmeyeni yalnız bırakmak için bölme yap.'}
  },
  'demo-yks-function-01': {
    key:'B', explanation:'f(4) demek, x yerine 4 yazmak demektir: 3 × 4 − 2 = 12 − 2 = 10.',
    misconception:{A:'3 × 4 = 12 adımından sonra 2 çıkarma adımını da yapmalısın.',C:'12 yalnızca 3 × 4 işleminin sonucu. Sonra 2 çıkarılır.',D:'İşlemde +2 yok; verilen ifade 3x − 2.'}
  }
};

function App() {
  const [track, setTrack] = useState<Track>('LGS');
  const [role, setRole] = useState<Role>('student');
  const [view, setView] = useState<View>('today');
  const [officialQuestion, setOfficialQuestion] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [retryMode, setRetryMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatItem[]>([{role:'assistant',text:'Merhaba! Nerede takıldığını birlikte bulalım. İstersen sorudaki bir adımı yazabilir ya da aşağıdaki kısa sorulardan biriyle başlayabilirsin.'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState<{hasGeminiKey:boolean} | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const student = students[track];

  useEffect(() => {
    fetch('/api/health').then(r=>r.json()).then(setHealth).catch(()=>setHealth(null));
  }, []);

  useEffect(() => {
    let alive = true;
    setQuestionLoading(true);
    setQuestion(null);
    setSelected(null); setSubmitted(false); setAnswerResult(null); setRetryMode(false);
    setChat([{role:'assistant',text:track === 'LGS'
      ? 'Bu soruyu hemen çözmek zorunda değilsin. Önce hangi kuralın gerektiğini bulalım; sonra birlikte adım adım ilerleriz.'
      : 'Fonksiyon sorularında ilk küçük adım, x yerine verilen sayıyı yazmaktır. İstersen bunu bir örnek üzerinde deneyelim.'}]);
    const load = async () => {
      try {
        const response = await fetch('/api/content/verified-question?studentId=' + student.id);
        const data = await response.json();
        if (!alive) return;
        if (track === 'LGS' && data.available && data.question) {
          const q = data.question;
          const mapped: Question = {
            id:q.id, track:'LGS', topic:q.topic, prompt:q.questionText,
            options:q.options.map((o:Option)=>({id:o.id,text:o.text})),
            source:q.sourceDocument, sourceUrl:q.sourceUrl,
            verified:q.verificationStatus === 'verified_official_publication',
            hints:q.pedagogicalHints
          };
          setOfficialQuestion(mapped); setQuestion(mapped);
        } else {
          setOfficialQuestion(null);
          setQuestion(track === 'LGS' ? demoRetry : demoYks);
        }
      } catch {
        if (!alive) return;
        setQuestion(track === 'LGS' ? demoRetry : demoYks);
        setNotice('Sunucuya ulaşılamadı. Şu an yalnızca yerel demo örneği gösteriliyor.');
      } finally {
        if (alive) { setQuestionLoading(false); loadProgress(); }
      }
    };
    const loadProgress = async () => {
      try {
        const r = await fetch('/api/student/progress?studentId=' + student.id);
        const d = await r.json();
        if (alive && r.ok && typeof d.progress?.currentMastery === 'number') setProgress(d.progress.currentMastery);
        else if (alive) setProgress(null);
      } catch { if (alive) setProgress(null); }
    };
    void load();
    return () => { alive = false; };
  }, [track, student.id]);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth',block:'end'}); }, [chat,chatLoading]);

  const mastery = progress ?? (track === 'LGS' ? 52 : 38);
  const nav: {id:View; label:string; hint:string; icon:typeof House}[] = [
    {id:'today',label:'Bugünüm',hint:'Günlük rota',icon:House},
    {id:'practice',label:'Soru atölyesi',hint:'Çöz ve öğren',icon:NotebookPen},
    {id:'coach',label:'AI çalışma arkadaşı',hint:'Takıldığın yerde',icon:MessageCircle},
    {id:'progress',label:'Gelişimim',hint:'Neler değişiyor?',icon:Activity}
  ];
  const changeTrack = (next:Track) => { setTrack(next); setRole('student'); setView('today'); setNotice(''); };
  const chooseView = (next:View) => { setView(next); setNotice(''); };

  const submitAnswer = async () => {
    if (!question || !selected || submitted) return;
    setSubmitted(true);
    const local = localAnswer[question.id];
    let correct = false;
    let explanation = '';
    let misconception = '';
    let repeated = false;
    if (question.verified && track === 'LGS') {
      try {
        const r = await fetch('/api/student/answer', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            studentId:student.id, topicId:'top_lgs_uslu', questionId:question.id,
            chosenOptionId:selected, hintsUsedCount:0, aiTutorInteractionsCount:chat.filter(x=>x.role==='user').length
          })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Yanıt kaydedilemedi.');
        correct = Boolean(d.isCorrect); repeated = Boolean(d.isRepeatedAttempt);
        explanation = d.officialSolution?.summary || d.explanation || 'Yanıt değerlendirildi.';
        const selectedIndex = question.options.findIndex(o=>o.id===selected);
        const hintIndex = selectedIndex === 0 ? 0 : Math.max(0, selectedIndex - 1);
        misconception = correct ? '' : (question.hints?.[hintIndex] || 'Önce ifadeleri aynı tabana çevirip üs kurallarını adım adım uygulayalım.');
        if (typeof d.updatedMastery?.currentMastery === 'number') setProgress(d.updatedMastery.currentMastery);
      } catch {
        setAnswerResult({
          correct: false,
          unverified: true,
          explanation: 'Sunucuya ulaşılamadığı için bu yanıt doğrulanamadı. Cevap anahtarını tahmin etmeyeceğiz ve ilerleme kaydı oluşturulmadı.',
          misconception: ''
        });
        return;
      }
    } else if (local) {
      correct = selected === local.key;
      explanation = local.explanation;
      misconception = correct ? '' : (local.misconception[selected] || 'İşlem adımlarını birer birer kontrol edelim.');
    } else {
      explanation = 'Bu örnek için cevap anahtarı doğrulanmadı. Öğretmenle birlikte kontrol etmek üzere işaretlendi.';
    }
    setAnswerResult({correct, explanation, misconception, repeated});
    if (!correct) setNotice('Hata bir sonuç değil, nereden devam edeceğimizi gösteren ipucu.');
  };

  const startRetry = () => {
    setQuestion(track === 'LGS' ? demoRetry : demoYks);
    setRetryMode(true); setSelected(null); setSubmitted(false); setAnswerResult(null);
    setView('practice'); setRole('student');
    setNotice('Pekiştirme sorusu açıldı. Bu soru demo için hazırlandı; resmî sınav sorusu değildir.');
  };

  const sendChat = async (message?:string) => {
    const text = (message ?? chatInput).trim();
    if (!text || chatLoading) return;
    setChatInput('');
    setChatError('');
    const next = [...chat,{role:'user' as const,text}];
    setChat(next); setChatLoading(true);
    try {
      const response = await fetch('/api/tutor/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          studentId:student.id,
          userMessage:text,
          chatHistory:next.slice(-8).map(m=>({role:m.role,content:m.text}))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI yanıtı alınamadı.');
      setChat(old=>[...old,{role:'assistant',text:data.reply}]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Bağlantı kurulamadı.';
      setChatError(messageText);
      const safeFallback = track === 'LGS'
        ? 'Şu anda canlı AI yanıtı alamadım. Yine de şu ilk adımı birlikte yapabiliriz: 8⁴ ifadesini 2 tabanında yaz. Çünkü 8 = 2³. Sonra üslerin üssü kuralını uygula. Bu, otomatik AI yanıtı değil; demo içindeki sabit ipucudur.'
        : 'Canlı AI yanıtı alınamadı. Fonksiyonlarda x yerine verilen sayıyı koyup işlem sırasıyla ilerleriz. Bu parkurda resmî soru içeriği henüz doğrulanmadı; bu yüzden örneği resmî soru diye sunmayacağım.';
      setChat(old=>[...old,{role:'assistant',text:safeFallback}]);
    } finally { setChatLoading(false); }
  };

  const resetPractice = () => {
    if (track === 'LGS' && officialQuestion) { setQuestion(officialQuestion); setRetryMode(false); }
    else { setQuestion(track === 'LGS' ? demoRetry : demoYks); setRetryMode(true); }
    setSelected(null); setSubmitted(false); setAnswerResult(null); setNotice('');
  };

  const renderStudent = () => {
    if (view === 'coach') return Coach();
    if (view === 'progress') return ProgressView();
    if (view === 'practice') return PracticeView();
    return TodayView();
  };

  function TodayView() {
    return <div className="page-stack">
      <section className="welcome-band">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="live-dot" /> BUGÜNÜN ÖĞRENME ROTASI</div>
          <h1>Selam {student.name.split(' ')[0]},<br/><span>küçük adımlar büyütür.</span></h1>
          <p>Bugün her şeyi bitirmek zorunda değilsin. Bir konuyu gerçekten anlamak yeterli.</p>
          <button className="button button-light" onClick={()=>chooseView('practice')}>İlk çalışmaya başla <ArrowRight size={16}/></button>
        </div>
        <div className="route-art" aria-hidden="true">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="orbit-core"><BrainCircuit size={38}/></div>
          <div className="orbit-tag tag-one"><Target size={15}/> 1 konu</div>
          <div className="orbit-tag tag-two"><CheckCircle2 size={15}/> 1 adım</div>
        </div>
      </section>
      <div className="section-heading"><div><span className="eyebrow muted">BUGÜN SANA ÖZEL</span><h2>Çalışma planın</h2></div><span className="quiet-pill"><CalendarDays size={14}/> Bugün · 20 dk</span></div>
      <section className="plan-grid">
        <button className="plan-card plan-main" onClick={()=>chooseView('practice')}>
          <div className="plan-icon indigo"><NotebookPen size={20}/></div><div className="plan-meta"><span>01 · MATEMATİK</span><span className="duration"><Clock3 size={13}/> 10 dk</span></div>
          <h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3><p>{track==='LGS'?'Üs kurallarını bir problemde kullan.':'Fonksiyon değerini adım adım hesapla.'}</p>
          <div className="plan-bottom"><span>Çalışmaya geç</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('coach')}>
          <div className="plan-icon mint"><MessageCircle size={20}/></div><div className="plan-meta"><span>02 · ANLAMA</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Takıldığın yeri sor</h3><p>Bir adımı anlamadıysan AI çalışma arkadaşıyla birlikte aç.</p>
          <div className="plan-bottom"><span>Soru sor</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('progress')}>
          <div className="plan-icon amber"><Activity size={20}/></div><div className="plan-meta"><span>03 · GERİ BAKIŞ</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Ne öğrendin?</h3><p>Yanıtlarını ve sıradaki küçük adımını gözden geçir.</p>
          <div className="plan-bottom"><span>Gelişimi gör</span><ArrowRight size={16}/></div>
        </button>
      </section>
      <div className="lower-grid">
        <section className="surface focus-panel"><div className="surface-heading"><div><span className="eyebrow muted">BU HAFTAKİ ODAĞIN</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="round-icon"><Target size={18}/></span></div>
          <p className="body-copy">Amaç sadece doğru cevabı bulmak değil; hangi kuralı neden kullandığını anlatabilmek.</p>
          <div className="mastery-line"><div><span>Örnek ilerleme göstergesi</span><strong>{mastery}%</strong></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Bu gösterge başlangıç demo değeridir; gerçek öğrenci başarısı değildir.':'Bu demo oturumunda sunucuya kaydedilen konu ilerlemesi.'}</small></div>
        </section>
        <section className="surface note-panel"><div className="note-icon"><Lightbulb size={20}/></div><span className="eyebrow muted">KÜÇÜK HATIRLATMA</span><h3>Hata yapmak, öğrenmenin bir parçası.</h3><p>Yanlış cevapta sadece sonucu değil, düşünme adımını da inceliyoruz.</p><button className="text-button" onClick={()=>chooseView('practice')}>Bir soruda dene <ArrowRight size={15}/></button></section>
      </div>
    </div>;
  }

  function PracticeView() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME ATÖLYESİ / MATEMATİK</span><h1>Çöz. Anla. Bir daha dene.</h1><p>Yanıtından sonra sadece doğru/yanlış değil, düşünme adımına dair geri bildirim alırsın.</p></div><span className="quiet-pill"><ShieldCheck size={14}/>{question?.verified?'Kaynağı doğrulanmış':'Demo örneği'}</span></div>
      {questionLoading || !question ? <div className="surface loading-surface"><div className="spinner"/><p>Soru hazırlanıyor…</p></div> :
      <div className="practice-layout">
        <section className="surface question-panel">
          <div className="question-top"><div className="topic-chip"><BookOpen size={14}/>{question.topic}</div><span className="question-count">{retryMode?'PEKİŞTİRME':'SORU 01'} / MATEMATİK</span></div>
          <h2>{question.prompt}</h2>
          <div className="option-list">{question.options.map((option,index)=><button key={option.id} disabled={submitted} className={'answer-option '+(selected===option.id?'selected ':'')+(submitted && answerResult && !answerResult.unverified && option.id=== (question.verified?'B':localAnswer[question.id]?.key)?'answer-correct ':'')+(submitted && selected===option.id && answerResult && !answerResult.correct && !answerResult.unverified?'answer-wrong':'')} onClick={()=>setSelected(option.id)}><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option.text.replace(/^[A-D]\)\s*/,'')}</span>{selected===option.id&&<span className="option-check"><Check size={15}/></span>}</button>)}</div>
          {!submitted ? <div className="question-actions"><span className="helper-text"><CircleHelp size={14}/> Takılırsan AI çalışma arkadaşına sorabilirsin.</span><button className="button button-primary" disabled={!selected} onClick={submitAnswer}>Yanıtımı kontrol et <ArrowRight size={16}/></button></div> :
          <div className={'feedback-panel '+(answerResult?.correct?'feedback-good':'feedback-try')}><div className="feedback-title">{answerResult?.correct?<CheckCircle2 size={19}/>:<Lightbulb size={19}/>}<div><strong>{answerResult?.unverified?'Yanıt henüz doğrulanamadı.':answerResult?.correct?'Evet, doğru düşünüyorsun.':'Burada bir düşünme adımını yeniden inceleyelim.'}</strong><span>{answerResult?.unverified?'Bağlantı geri geldiğinde yeniden deneyebilirsin.':answerResult?.correct?'Kuralı doğru uyguladın.':'Yanlış cevap bir ipucu; birlikte nerede ayrıldığını bulalım.'}</span></div></div>
            <p>{answerResult?.correct?answerResult.explanation:(answerResult?.misconception||answerResult?.explanation)}</p>
            {answerResult?.repeated&&<small>Bu soru daha önce kaydedilmiş. Tekrar çözüm yeni ilerleme olarak sayılmadı.</small>}
            <div className="feedback-actions"><button className="button button-primary" onClick={()=>{setView('coach');setChatInput('Bu soruda '+(answerResult?.correct?'hangi kuralı kullandığımı':'hangi adımda hata yapmış olabileceğimi')+' adım adım anlatır mısın?')}}><MessageCircle size={15}/> Birlikte incele</button><button className="button button-secondary" onClick={startRetry}>Benzer soru çöz <ArrowRight size={15}/></button></div>
          </div>}
          <div className="source-strip"><ShieldCheck size={15}/><div><strong>{question.verified?'Resmî kaynak bilgisi':'Örnek içerik'}</strong><span>{question.source}</span></div>{question.sourceUrl&&<a href={question.sourceUrl} target="_blank" rel="noreferrer">Kaynağı aç <ArrowUpRight size={13}/></a>}</div>
        </section>
        <aside className="practice-aside">
          <section className="surface aside-card"><div className="aside-heading"><span className="plan-icon mint"><BrainCircuit size={18}/></span><span className="eyebrow muted">ÖĞRENME YÖNTEMİ</span></div><h3>Sonucu değil, düşünme yolunu bul.</h3><ol className="step-list"><li className={submitted?'complete':''}><span>1</span><div><strong>Önce kendin dene</strong><small>İlk düşünceni seç.</small></div></li><li className={answerResult?'complete':''}><span>2</span><div><strong>Geri bildirimi incele</strong><small>Hangi adımın önemli olduğunu gör.</small></div></li><li><span>3</span><div><strong>Benzer soruda uygula</strong><small>Öğrenmeyi tekrar dene.</small></div></li></ol></section>
          <section className="surface aside-card ai-nudge"><span className="eyebrow muted">YARDIMA MI İHTİYACIN VAR?</span><p>“Neden bu işlemi yaptık?” diye sorabilirsin.</p><button className="text-button" onClick={()=>chooseView('coach')}>AI çalışma arkadaşına git <ArrowRight size={15}/></button></section>
        </aside>
      </div>}
    </div>;
  }

  function Coach() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME DESTEĞİ</span><h1>AI çalışma arkadaşın.</h1><p>Sana cevabı hemen vermek yerine düşünme adımlarını açmana yardım eder.</p></div><span className={'connection-pill '+(health?.hasGeminiKey?'connected':'not-connected')}><span/>{health?.hasGeminiKey?'Gemini bağlantısı hazır':health===null?'Bağlantı durumu bilinmiyor':'API anahtarı algılanmadı'}</span></div>
      <div className="coach-layout">
        <section className="surface chat-panel">
          <div className="chat-head"><div className="coach-avatar"><Sparkles size={20}/></div><div><strong>Kübik Öğrenme Rehberi</strong><span><span className="live-dot"/> Matematik · {student.grade}</span></div><span className="chat-safe"><ShieldCheck size={14}/> Öğrenme odaklı</span></div>
          <div className="chat-messages">{chat.map((item,i)=><div key={i} className={'message-row '+(item.role==='user'?'message-user':'')}><div className="message-avatar">{item.role==='user'?student.initials:<Sparkles size={15}/>}</div><div className="message-bubble"><span className="message-author">{item.role==='user'?'Sen':'Öğrenme rehberi'}</span><p>{item.text}</p></div></div>)}{chatLoading&&<div className="message-row"><div className="message-avatar"><Sparkles size={15}/></div><div className="message-bubble typing"><span/><span/><span/></div></div>}<div ref={chatEnd}/></div>
          {chatError&&<div className="chat-error"><CircleHelp size={14}/>{chatError} <span>Gösterilen sabit ipucu canlı AI yanıtı değildir.</span></div>}
          <div className="suggestion-row"><button onClick={()=>void sendChat(track==='LGS'?'Üslerin üssü kuralını basit bir örnekle açıklar mısın?':'Fonksiyonlarda x yerine değer yazmak ne demek?')}>{track==='LGS'?'Üslerin üssü kuralı':'Fonksiyon nedir?'}</button><button onClick={()=>void sendChat('Bana cevabı söylemeden bir ipucu verir misin?')}>Bir ipucu ver</button><button onClick={()=>void sendChat('Küçük bir örnek üzerinden anlatır mısın?')}>Örnekle anlat</button></div>
          <form className="chat-composer" onSubmit={e=>{e.preventDefault();void sendChat();}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Takıldığın adımı buraya yaz…" aria-label="AI çalışma arkadaşına mesaj"/><button className="send-button" type="submit" disabled={!chatInput.trim()||chatLoading} aria-label="Mesajı gönder"><Send size={17}/></button></form>
          <p className="chat-disclaimer">AI yanıtları hata içerebilir. Önemli akademik kararlar için öğretmeninle kontrol et.</p>
        </section>
        <aside className="surface coach-context"><span className="eyebrow muted">ÇALIŞMA BAĞLAMI</span><h3>Bugünkü konun</h3><div className="context-topic"><div className="plan-icon indigo"><BookOpen size={18}/></div><div><strong>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</strong><span>Matematik · {student.grade}</span></div></div><div className="context-divider"/><span className="eyebrow muted">İSTERSEN ŞUNU SOR</span><button className="prompt-card" onClick={()=>setChatInput('Bu konuyu 3 kısa adımda anlatır mısın?')}>Bu konuyu 3 kısa adımda anlat <ArrowRight size={15}/></button><button className="prompt-card" onClick={()=>setChatInput('Yanlış cevabım hangi düşünce hatasından kaynaklanmış olabilir?')}>Yanlışım ne anlatıyor olabilir? <ArrowRight size={15}/></button><div className="teacher-note"><Lightbulb size={16}/><p>Bir soruda uzun süre takılırsan, öğretmeninden destek istemek de iyi bir öğrenme adımıdır.</p></div></aside>
      </div>
    </div>;
  }

  function ProgressView() {
    return <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KENDİ GELİŞİMİNİ İZLE</span><h1>Her doğru adım bir iz bırakır.</h1><p>Bu görünüm, demo oturumunda kaydedilen yanıtları ve sıradaki çalışma önerisini bir araya getirir.</p></div></div>
      <div className="progress-overview"><section className="surface mastery-card"><span className="eyebrow muted">KONU İLERLEMESİ</span><div className="mastery-number">{mastery}<small>%</small></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><p>{progress===null?'Başlangıç göstergesi · gerçek öğrenci verisi değildir.':'Sunucu tarafında kayıtlı demo konu ilerlemesi.'}</p></section><section className="surface next-step-card"><div className="plan-icon amber"><Target size={19}/></div><span className="eyebrow muted">ÖNERİLEN SONRAKİ ADIM</span><h3>{answerResult&&!answerResult.correct?'Bu adımı yeniden çalış':'Benzer bir soruda kuralı uygula'}</h3><p>{answerResult&&!answerResult.correct?'Yanlış seçeneğin hangi düşünceyi işaret ettiğini AI çalışma arkadaşıyla incele.':'Aynı kazanımı farklı bir örnekte kullanarak gerçekten anladığını kontrol et.'}</p><button className="button button-primary" onClick={startRetry}>Bir soru daha çöz <ArrowRight size={15}/></button></section></div>
      <section className="surface reflection-card"><div className="surface-heading"><div><span className="eyebrow muted">KISA ÖZ DEĞERLENDİRME</span><h3>Bugün kendine sor</h3></div><span className="round-icon"><Lightbulb size={18}/></span></div><div className="reflection-list"><div><span>01</span><p>Hangi kuralı kullandım, neden?</p><button onClick={()=>{setView('coach');setChatInput('Bugünkü soruda hangi kuralı neden kullandığımı anlamama yardım et.')}}>Birlikte düşün <ArrowRight size={14}/></button></div><div><span>02</span><p>Benzer bir soruda tek başıma deneyebilir miyim?</p><button onClick={startRetry}>Kendimi dene <ArrowRight size={14}/></button></div><div><span>03</span><p>Hangi adım için öğretmen desteğine ihtiyacım var?</p><button onClick={()=>setNotice('Öğretmen görünümünde bu konu için destek notu gösteriliyor.')}>Not al <ArrowRight size={14}/></button></div></div></section>
    </div>;
  }

  const renderTeacher = () => <div className="page-stack">
    <div className="page-intro"><div><span className="eyebrow muted">ÖĞRETMEN ÇALIŞMA ALANI</span><h1>Öğrencinin takıldığı yeri görün.</h1><p>Öğrenme verisini bir sonraki öğretmen müdahalesine dönüştüren sade görünüm.</p></div><span className="quiet-pill"><Users size={14}/> Demo öğrenci: {student.name}</span></div>
    <section className="teacher-student-banner"><div className="student-avatar large">{student.initials}</div><div className="teacher-student-copy"><span className="eyebrow">ÖĞRENCİ KARTI · DEMO</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><button className="button button-light" onClick={()=>{setRole('student');setView('practice')}}>Öğrenci akışını aç <ArrowRight size={15}/></button></section>
    <div className="teacher-grid"><section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">KONU DURUMU</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="topic-chip"><Activity size={14}/> {progress===null?'Demo': 'Kayıtlı'}</span></div><div className="teacher-mastery"><strong>{mastery}%</strong><div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Başlangıç örneği; henüz kayıtlı sonuç yok.':'Öğrenci oturumunda kaydedilen konu göstergesi.'}</small></div></div><div className="signal-row"><div className="signal-icon amber"><Lightbulb size={17}/></div><div><strong>Öğretmen için olası müdahale</strong><p>{answerResult&&!answerResult.correct?'Üs kurallarında aynı tabana çevirme adımını kısa bir örnekle tekrar edin.':'Öğrenciden kullandığı kuralı kendi cümleleriyle açıklamasını isteyin.'}</p></div></div></section>
    <section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">OTURUM ÖZETİ</span><h3>Bu çalışmada</h3></div><span className="round-icon"><NotebookPen size={17}/></span></div><div className="session-stat"><span>Yanıt durumu</span><strong>{submitted?(answerResult?.correct?'Doğru':'Tekrar gerekli'):'Henüz yanıtlanmadı'}</strong></div><div className="session-stat"><span>AI destek etkileşimi</span><strong>{chat.filter(x=>x.role==='user').length} mesaj</strong></div><div className="session-stat"><span>İçerik kaynağı</span><strong>{question?.verified?'MEB · doğrulanmış':'Demo örneği'}</strong></div><button className="button button-secondary full-button" onClick={()=>{setRole('student');setView('coach')}}>Öğrenciyle aynı konuyu incele <ArrowRight size={15}/></button></section></div>
    <section className="surface teacher-next"><div className="plan-icon mint"><MessageCircle size={18}/></div><div><span className="eyebrow muted">ÖNERİLEN ÖĞRETMEN NOTU</span><h3>“Sonucu nasıl bulduğunu anlatır mısın?”</h3><p>Öğrencinin yalnızca doğru cevabı değil, kullandığı düşünme yolunu da açıklamasını isteyin.</p></div><button className="text-button" onClick={()=>setNotice('Öğretmen notu bu demo oturumu için seçildi.')}>Notu seç <Check size={15}/></button></section>
  </div>;

  const renderParent = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">VELİ GÖRÜNÜMÜ</span><h1>Gelişimi anlaşılır şekilde takip edin.</h1><p>Notlardan çok, çalışma rutini ve bir sonraki destek adımına odaklanın.</p></div></div>
    <section className="parent-summary surface"><div className="student-avatar large">{student.initials}</div><div className="parent-child"><span className="eyebrow muted">ÖĞRENCİ</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><div className="parent-progress"><span>Konu ilerleme göstergesi</span><strong>{mastery}%</strong><div className="progress-track"><span style={{width:mastery+'%'}}/></div></div></section>
    <div className="parent-grid"><section className="surface"><span className="eyebrow muted">BU OTURUMDA</span><h3>{submitted?'Bir soru üzerinde çalıştı':'Çalışma sırasındaki adım'}</h3><p>{submitted?'Yanıt sonrası açıklama ve tekrar önerisi sunuldu.':'Bir soruyu kendi başına denemesi ve ardından açıklamayı incelemesi planlandı.'}</p><div className="parent-step"><CheckCircle2 size={17}/><span>Önce kendi başına deneme</span></div><div className="parent-step"><CheckCircle2 size={17}/><span>Yanlışın nedenini anlama</span></div><div className="parent-step"><Clock3 size={17}/><span>Benzer soruyla pekiştirme</span></div></section><section className="surface parent-advice"><div className="plan-icon amber"><Lightbulb size={18}/></div><span className="eyebrow muted">EVDE DESTEK İÇİN</span><h3>“Bugün neyi farklı anladın?”</h3><p>Doğru sayısını sormak yerine, öğrendiği kuralı kendi cümleleriyle anlatmasını isteyin.</p><button className="button button-secondary" onClick={()=>{setRole('student');setView('progress')}}>Gelişim görünümünü aç <ArrowRight size={15}/></button></section></div>
  </div>;

  const renderCenter = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KÜBİK · KURUM GÖRÜNÜMÜ</span><h1>Eğitim sürecini görünür kılın.</h1><p>Bu demo, bireysel öğrenme döngüsünün kurum içindeki karşılığını gösterir. Gerçek kurum verisi içermez.</p></div></div>
    <div className="center-metrics"><section className="surface"><span className="metric-label">AKTİF DEMO ÖĞRENCİ</span><strong>01</strong><small>Sunum senaryosu · gerçek kayıt sayısı değil</small></section><section className="surface"><span className="metric-label">ÖĞRENME DÖNGÜSÜ</span><strong>{submitted?'3 / 3':'1 / 3'}</strong><small>{submitted?'Yanıt ve geri bildirim gösterildi.':'Yanıt bekleniyor; akış canlı denenebilir.'}</small></section><section className="surface"><span className="metric-label">AI BAĞLANTISI</span><strong>{health?.hasGeminiKey?'Hazır':'Kontrol gerekli'}</strong><small>API anahtarı sunucu tarafından kontrol edilir.</small></section></div>
    <section className="surface center-flow"><div className="surface-heading"><div><span className="eyebrow muted">ÜRÜNÜN TEMEL DÖNGÜSÜ</span><h3>Tek akış, dört rol</h3></div><span className="round-icon"><Activity size={18}/></span></div><div className="flow-steps"><div><span>01</span><BookOpen size={20}/><strong>Öğrenci çalışır</strong><p>Soru ve yanıt</p></div><ArrowRight/><div><span>02</span><BrainCircuit size={20}/><strong>Geri bildirim</strong><p>Hata nedeni ve ipucu</p></div><ArrowRight/><div><span>03</span><Users size={20}/><strong>Öğretmen görür</strong><p>Müdahale önerisi</p></div><ArrowRight/><div><span>04</span><Activity size={20}/><strong>İlerleme izlenir</strong><p>Ortak kayıt</p></div></div></section>
    <section className="surface center-next"><div><span className="eyebrow muted">ÜRÜN KEŞFİ İÇİN SONRAKİ ADIM</span><h3>Önce Kubik’in gerçek sürecini tanımlayalım.</h3><p>Öğrenci grupları, öğretmen iş akışı, mevcut dijital araçlar ve veli iletişimi sahipleriyle birlikte doğrulanmalı. Bu demo üretim sistemi veya gelir tahmini değildir.</p></div><button className="button button-primary" onClick={()=>setNotice('Keşif gündemi: öğrenci akışı, öğretmen müdahalesi, veli iletişimi ve ölçülebilir kazanımlar.')}>Keşif gündemini göster <ArrowRight size={15}/></button></section>
  </div>;

  return <div className="product-shell">
    <header className="topbar"><button className="brand" onClick={()=>{setRole('student');setView('today')}} aria-label="Kübik ana sayfa"><span className="brand-symbol"><span/><span/><span/><span/></span><span className="brand-word">kübik<span>+</span><small>ÖĞRENME ATÖLYESİ</small></span></button>
      <div className="topbar-center"><span className="demo-status"/><span>ÜRÜN DENEYİMİ</span><span className="topbar-separator">/</span><span>{role==='student'?'ÖĞRENCİ ROTASI':role==='teacher'?'ÖĞRETMEN MASASI':role==='parent'?'VELİ ÖZETİ':'KURUM PERSPEKTİFİ'}</span></div>
      <div className="topbar-actions"><div className="track-switch"><button className={track==='LGS'?'active':''} onClick={()=>changeTrack('LGS')}>LGS</button><button className={track==='YKS'?'active':''} onClick={()=>changeTrack('YKS')}>YKS</button></div><div className="user-chip"><span className="student-avatar">{student.initials}</span><span><strong>{student.name}</strong><small>{student.grade}</small></span><ChevronDown size={14}/></div></div>
    </header>
    <div className="app-frame"><aside className="sidebar"><div className="sidebar-label">ÇALIŞMA ALANI</div><div className="nav-list">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={'nav-item '+(role==='student'&&view===item.id?'active':'')} onClick={()=>{setRole('student');chooseView(item.id)}}><span className="nav-icon"><Icon size={18}/></span><span className="nav-text"><strong>{item.label}</strong><small>{item.hint}</small></span>{role==='student'&&view===item.id&&<span className="nav-active-dot"/>}</button>})}</div><div className="sidebar-divider"/><div className="sidebar-label">AYNI ÖĞRENME, FARKLI BAKIŞ</div><div className="role-list">{roles.filter(r=>r.id!=='student').map(r=><button key={r.id} className={'role-item '+(role===r.id?'active':'')} onClick={()=>setRole(r.id)}><span className="role-avatar">{r.id==='teacher'?<GraduationCap size={17}/>:r.id==='parent'?<Users size={17}/>:<Activity size={17}/>}</span><span>{r.label}</span><ChevronRight size={15}/></button>)}</div><div className="sidebar-bottom"><div className="privacy-mark"><ShieldCheck size={16}/><span><strong>Güvenilir öğrenme</strong><small>Demo · gerçek öğrenci hesabı değil</small></span></div><button className="help-link" onClick={()=>setNotice('Bu demo, Kubik ile birlikte doğrulanacak bir ürün fikridir; üretim sistemi değildir.')}>Bu demo hakkında <CircleHelp size={14}/></button></div></aside>
      <main className="main-area"><div className="mobile-track-note"><span className="live-dot"/> {student.goal} <span>· Demo profili</span></div>{notice&&<div className="notice-bar"><Lightbulb size={16}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Bildirimi kapat"><X size={15}/></button></div>}
        {role==='student'?renderStudent():role==='teacher'?renderTeacher():role==='parent'?renderParent():renderCenter()}
        <footer className="app-footer"><span>kübik+ <i>·</i> Öğrenme atölyesi</span><span><ShieldCheck size={13}/> Demo içerikleri açıkça etiketlenmiştir</span></footer>
      </main>
    </div>
  </div>;
}

export default App;
);
  const chunks = normalized.split(/(\$[^$\n]+\$)/g);
  return <div className="tutor-rich-text">{chunks.map((chunk, index) => {
    if (chunk.startsWith('$') && chunk.endsWith('$') && chunk.length > 2) {
      return <span className="math-inline" key={index}>{formatMath(chunk.slice(1, -1))}</span>;
    }
    return <span key={index}>{renderPlainText(chunk)}</span>;
  })}</div>;
}

type Track = 'LGS' | 'YKS';
type Role = 'student' | 'teacher' | 'parent' | 'center';
type View = 'today' | 'practice' | 'coach' | 'progress';
type ChatItem = { role: 'user' | 'assistant'; text: string };
type AnswerResult = { correct: boolean; explanation: string; misconception?: string; repeated?: boolean; unverified?: boolean };
type Option = { id: string; text: string };
type Question = {
  id: string; track: Track; topic: string; prompt: string; options: Option[];
  source: string; sourceUrl?: string; verified: boolean; hints?: string[];
};
const students: Record<Track, { id: string; name: string; grade: string; goal: string; initials: string }> = {
  LGS: { id: 'std_lgs_801', name: 'Kerem Demir', grade: '8. sınıf', goal: 'LGS · Matematik', initials: 'KD' },
  YKS: { id: 'std_yks_1101', name: 'Selin Yılmaz', grade: '11. sınıf', goal: 'YKS · Matematik', initials: 'SY' }
};
const roles: { id: Role; label: string }[] = [
  { id: 'student', label: 'Öğrenci' }, { id: 'teacher', label: 'Öğretmen' },
  { id: 'parent', label: 'Veli' }, { id: 'center', label: 'Kurum' }
];
const demoRetry: Question = {
  id: 'demo-retry-uslu-01', track: 'LGS', topic: 'Üslü ifadeler · pekiştirme',
  prompt: 'Bir sayının 2⁵ katı 2⁹ ise bu sayı kaçtır?',
  options: [{id:'A',text:'2³'}, {id:'B',text:'2⁴'}, {id:'C',text:'2⁵'}, {id:'D',text:'2¹⁴'}],
  source: 'Kübik demo için hazırlanmış pekiştirme sorusu · resmî sınav sorusu değildir',
  verified: false
};
const demoYks: Question = {
  id: 'demo-yks-function-01', track: 'YKS', topic: 'Fonksiyonlar',
  prompt: 'f(x) = 3x − 2 olduğuna göre f(4) kaçtır?',
  options: [{id:'A',text:'8'}, {id:'B',text:'10'}, {id:'C',text:'12'}, {id:'D',text:'14'}],
  source: 'Kübik demo için hazırlanmış örnek · resmî YKS sorusu değildir',
  verified: false
};
const localAnswer: Record<string, { key: string; explanation: string; misconception: Record<string,string> }> = {
  'demo-retry-uslu-01': {
    key:'B', explanation:'2⁵ ile çarpıldığında 2⁹ elde ediliyorsa, aynı tabanlı üsleri bölme işleminde çıkarırız: 2⁹ ÷ 2⁵ = 2⁴.',
    misconception:{A:'Üsleri çıkarırken 9 − 5 işlemini yeniden kontrol et. Sonuç 4 olmalı.',C:'2⁵ sayının kendisi değil, onu çarptığımız katsayı. Bilinmeyeni bulmak için bölmeliyiz.',D:'Çarpma kuralını kullanmış olabilirsin; bilinmeyeni yalnız bırakmak için bölme yap.'}
  },
  'demo-yks-function-01': {
    key:'B', explanation:'f(4) demek, x yerine 4 yazmak demektir: 3 × 4 − 2 = 12 − 2 = 10.',
    misconception:{A:'3 × 4 = 12 adımından sonra 2 çıkarma adımını da yapmalısın.',C:'12 yalnızca 3 × 4 işleminin sonucu. Sonra 2 çıkarılır.',D:'İşlemde +2 yok; verilen ifade 3x − 2.'}
  }
};

function App() {
  const [track, setTrack] = useState<Track>('LGS');
  const [role, setRole] = useState<Role>('student');
  const [view, setView] = useState<View>('today');
  const [officialQuestion, setOfficialQuestion] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [retryMode, setRetryMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatItem[]>([{role:'assistant',text:'Merhaba! Nerede takıldığını birlikte bulalım. İstersen sorudaki bir adımı yazabilir ya da aşağıdaki kısa sorulardan biriyle başlayabilirsin.'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState<{hasGeminiKey:boolean} | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const student = students[track];

  useEffect(() => {
    fetch('/api/health').then(r=>r.json()).then(setHealth).catch(()=>setHealth(null));
  }, []);

  useEffect(() => {
    let alive = true;
    setQuestionLoading(true);
    setQuestion(null);
    setSelected(null); setSubmitted(false); setAnswerResult(null); setRetryMode(false);
    setChat([{role:'assistant',text:track === 'LGS'
      ? 'Bu soruyu hemen çözmek zorunda değilsin. Önce hangi kuralın gerektiğini bulalım; sonra birlikte adım adım ilerleriz.'
      : 'Fonksiyon sorularında ilk küçük adım, x yerine verilen sayıyı yazmaktır. İstersen bunu bir örnek üzerinde deneyelim.'}]);
    const load = async () => {
      try {
        const response = await fetch('/api/content/verified-question?studentId=' + student.id);
        const data = await response.json();
        if (!alive) return;
        if (track === 'LGS' && data.available && data.question) {
          const q = data.question;
          const mapped: Question = {
            id:q.id, track:'LGS', topic:q.topic, prompt:q.questionText,
            options:q.options.map((o:Option)=>({id:o.id,text:o.text})),
            source:q.sourceDocument, sourceUrl:q.sourceUrl,
            verified:q.verificationStatus === 'verified_official_publication',
            hints:q.pedagogicalHints
          };
          setOfficialQuestion(mapped); setQuestion(mapped);
        } else {
          setOfficialQuestion(null);
          setQuestion(track === 'LGS' ? demoRetry : demoYks);
        }
      } catch {
        if (!alive) return;
        setQuestion(track === 'LGS' ? demoRetry : demoYks);
        setNotice('Sunucuya ulaşılamadı. Şu an yalnızca yerel demo örneği gösteriliyor.');
      } finally {
        if (alive) { setQuestionLoading(false); loadProgress(); }
      }
    };
    const loadProgress = async () => {
      try {
        const r = await fetch('/api/student/progress?studentId=' + student.id);
        const d = await r.json();
        if (alive && r.ok && typeof d.progress?.currentMastery === 'number') setProgress(d.progress.currentMastery);
        else if (alive) setProgress(null);
      } catch { if (alive) setProgress(null); }
    };
    void load();
    return () => { alive = false; };
  }, [track, student.id]);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth',block:'end'}); }, [chat,chatLoading]);

  const mastery = progress ?? (track === 'LGS' ? 52 : 38);
  const nav: {id:View; label:string; hint:string; icon:typeof House}[] = [
    {id:'today',label:'Bugünüm',hint:'Günlük rota',icon:House},
    {id:'practice',label:'Soru atölyesi',hint:'Çöz ve öğren',icon:NotebookPen},
    {id:'coach',label:'AI çalışma arkadaşı',hint:'Takıldığın yerde',icon:MessageCircle},
    {id:'progress',label:'Gelişimim',hint:'Neler değişiyor?',icon:Activity}
  ];
  const changeTrack = (next:Track) => { setTrack(next); setRole('student'); setView('today'); setNotice(''); };
  const chooseView = (next:View) => { setView(next); setNotice(''); };

  const submitAnswer = async () => {
    if (!question || !selected || submitted) return;
    setSubmitted(true);
    const local = localAnswer[question.id];
    let correct = false;
    let explanation = '';
    let misconception = '';
    let repeated = false;
    if (question.verified && track === 'LGS') {
      try {
        const r = await fetch('/api/student/answer', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            studentId:student.id, topicId:'top_lgs_uslu', questionId:question.id,
            chosenOptionId:selected, hintsUsedCount:0, aiTutorInteractionsCount:chat.filter(x=>x.role==='user').length
          })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Yanıt kaydedilemedi.');
        correct = Boolean(d.isCorrect); repeated = Boolean(d.isRepeatedAttempt);
        explanation = d.officialSolution?.summary || d.explanation || 'Yanıt değerlendirildi.';
        const selectedIndex = question.options.findIndex(o=>o.id===selected);
        const hintIndex = selectedIndex === 0 ? 0 : Math.max(0, selectedIndex - 1);
        misconception = correct ? '' : (question.hints?.[hintIndex] || 'Önce ifadeleri aynı tabana çevirip üs kurallarını adım adım uygulayalım.');
        if (typeof d.updatedMastery?.currentMastery === 'number') setProgress(d.updatedMastery.currentMastery);
      } catch {
        setAnswerResult({
          correct: false,
          unverified: true,
          explanation: 'Sunucuya ulaşılamadığı için bu yanıt doğrulanamadı. Cevap anahtarını tahmin etmeyeceğiz ve ilerleme kaydı oluşturulmadı.',
          misconception: ''
        });
        return;
      }
    } else if (local) {
      correct = selected === local.key;
      explanation = local.explanation;
      misconception = correct ? '' : (local.misconception[selected] || 'İşlem adımlarını birer birer kontrol edelim.');
    } else {
      explanation = 'Bu örnek için cevap anahtarı doğrulanmadı. Öğretmenle birlikte kontrol etmek üzere işaretlendi.';
    }
    setAnswerResult({correct, explanation, misconception, repeated});
    if (!correct) setNotice('Hata bir sonuç değil, nereden devam edeceğimizi gösteren ipucu.');
  };

  const startRetry = () => {
    setQuestion(track === 'LGS' ? demoRetry : demoYks);
    setRetryMode(true); setSelected(null); setSubmitted(false); setAnswerResult(null);
    setView('practice'); setRole('student');
    setNotice('Pekiştirme sorusu açıldı. Bu soru demo için hazırlandı; resmî sınav sorusu değildir.');
  };

  const sendChat = async (message?:string) => {
    const text = (message ?? chatInput).trim();
    if (!text || chatLoading) return;
    setChatInput('');
    setChatError('');
    const next = [...chat,{role:'user' as const,text}];
    setChat(next); setChatLoading(true);
    try {
      const response = await fetch('/api/tutor/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          studentId:student.id,
          userMessage:text,
          chatHistory:next.slice(-8).map(m=>({role:m.role,content:m.text}))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI yanıtı alınamadı.');
      setChat(old=>[...old,{role:'assistant',text:data.reply}]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Bağlantı kurulamadı.';
      setChatError(messageText);
      const safeFallback = track === 'LGS'
        ? 'Şu anda canlı AI yanıtı alamadım. Yine de şu ilk adımı birlikte yapabiliriz: 8⁴ ifadesini 2 tabanında yaz. Çünkü 8 = 2³. Sonra üslerin üssü kuralını uygula. Bu, otomatik AI yanıtı değil; demo içindeki sabit ipucudur.'
        : 'Canlı AI yanıtı alınamadı. Fonksiyonlarda x yerine verilen sayıyı koyup işlem sırasıyla ilerleriz. Bu parkurda resmî soru içeriği henüz doğrulanmadı; bu yüzden örneği resmî soru diye sunmayacağım.';
      setChat(old=>[...old,{role:'assistant',text:safeFallback}]);
    } finally { setChatLoading(false); }
  };

  const resetPractice = () => {
    if (track === 'LGS' && officialQuestion) { setQuestion(officialQuestion); setRetryMode(false); }
    else { setQuestion(track === 'LGS' ? demoRetry : demoYks); setRetryMode(true); }
    setSelected(null); setSubmitted(false); setAnswerResult(null); setNotice('');
  };

  const renderStudent = () => {
    if (view === 'coach') return Coach();
    if (view === 'progress') return ProgressView();
    if (view === 'practice') return PracticeView();
    return TodayView();
  };

  function TodayView() {
    return <div className="page-stack">
      <section className="welcome-band">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="live-dot" /> BUGÜNÜN ÖĞRENME ROTASI</div>
          <h1>Selam {student.name.split(' ')[0]},<br/><span>küçük adımlar büyütür.</span></h1>
          <p>Bugün her şeyi bitirmek zorunda değilsin. Bir konuyu gerçekten anlamak yeterli.</p>
          <button className="button button-light" onClick={()=>chooseView('practice')}>İlk çalışmaya başla <ArrowRight size={16}/></button>
        </div>
        <div className="route-art" aria-hidden="true">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="orbit-core"><BrainCircuit size={38}/></div>
          <div className="orbit-tag tag-one"><Target size={15}/> 1 konu</div>
          <div className="orbit-tag tag-two"><CheckCircle2 size={15}/> 1 adım</div>
        </div>
      </section>
      <div className="section-heading"><div><span className="eyebrow muted">BUGÜN SANA ÖZEL</span><h2>Çalışma planın</h2></div><span className="quiet-pill"><CalendarDays size={14}/> Bugün · 20 dk</span></div>
      <section className="plan-grid">
        <button className="plan-card plan-main" onClick={()=>chooseView('practice')}>
          <div className="plan-icon indigo"><NotebookPen size={20}/></div><div className="plan-meta"><span>01 · MATEMATİK</span><span className="duration"><Clock3 size={13}/> 10 dk</span></div>
          <h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3><p>{track==='LGS'?'Üs kurallarını bir problemde kullan.':'Fonksiyon değerini adım adım hesapla.'}</p>
          <div className="plan-bottom"><span>Çalışmaya geç</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('coach')}>
          <div className="plan-icon mint"><MessageCircle size={20}/></div><div className="plan-meta"><span>02 · ANLAMA</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Takıldığın yeri sor</h3><p>Bir adımı anlamadıysan AI çalışma arkadaşıyla birlikte aç.</p>
          <div className="plan-bottom"><span>Soru sor</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('progress')}>
          <div className="plan-icon amber"><Activity size={20}/></div><div className="plan-meta"><span>03 · GERİ BAKIŞ</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Ne öğrendin?</h3><p>Yanıtlarını ve sıradaki küçük adımını gözden geçir.</p>
          <div className="plan-bottom"><span>Gelişimi gör</span><ArrowRight size={16}/></div>
        </button>
      </section>
      <div className="lower-grid">
        <section className="surface focus-panel"><div className="surface-heading"><div><span className="eyebrow muted">BU HAFTAKİ ODAĞIN</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="round-icon"><Target size={18}/></span></div>
          <p className="body-copy">Amaç sadece doğru cevabı bulmak değil; hangi kuralı neden kullandığını anlatabilmek.</p>
          <div className="mastery-line"><div><span>Örnek ilerleme göstergesi</span><strong>{mastery}%</strong></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Bu gösterge başlangıç demo değeridir; gerçek öğrenci başarısı değildir.':'Bu demo oturumunda sunucuya kaydedilen konu ilerlemesi.'}</small></div>
        </section>
        <section className="surface note-panel"><div className="note-icon"><Lightbulb size={20}/></div><span className="eyebrow muted">KÜÇÜK HATIRLATMA</span><h3>Hata yapmak, öğrenmenin bir parçası.</h3><p>Yanlış cevapta sadece sonucu değil, düşünme adımını da inceliyoruz.</p><button className="text-button" onClick={()=>chooseView('practice')}>Bir soruda dene <ArrowRight size={15}/></button></section>
      </div>
    </div>;
  }

  function PracticeView() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME ATÖLYESİ / MATEMATİK</span><h1>Çöz. Anla. Bir daha dene.</h1><p>Yanıtından sonra sadece doğru/yanlış değil, düşünme adımına dair geri bildirim alırsın.</p></div><span className="quiet-pill"><ShieldCheck size={14}/>{question?.verified?'Kaynağı doğrulanmış':'Demo örneği'}</span></div>
      {questionLoading || !question ? <div className="surface loading-surface"><div className="spinner"/><p>Soru hazırlanıyor…</p></div> :
      <div className="practice-layout">
        <section className="surface question-panel">
          <div className="question-top"><div className="topic-chip"><BookOpen size={14}/>{question.topic}</div><span className="question-count">{retryMode?'PEKİŞTİRME':'SORU 01'} / MATEMATİK</span></div>
          <h2>{question.prompt}</h2>
          <div className="option-list">{question.options.map((option,index)=><button key={option.id} disabled={submitted} className={'answer-option '+(selected===option.id?'selected ':'')+(submitted && answerResult && !answerResult.unverified && option.id=== (question.verified?'B':localAnswer[question.id]?.key)?'answer-correct ':'')+(submitted && selected===option.id && answerResult && !answerResult.correct && !answerResult.unverified?'answer-wrong':'')} onClick={()=>setSelected(option.id)}><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option.text.replace(/^[A-D]\)\s*/,'')}</span>{selected===option.id&&<span className="option-check"><Check size={15}/></span>}</button>)}</div>
          {!submitted ? <div className="question-actions"><span className="helper-text"><CircleHelp size={14}/> Takılırsan AI çalışma arkadaşına sorabilirsin.</span><button className="button button-primary" disabled={!selected} onClick={submitAnswer}>Yanıtımı kontrol et <ArrowRight size={16}/></button></div> :
          <div className={'feedback-panel '+(answerResult?.correct?'feedback-good':'feedback-try')}><div className="feedback-title">{answerResult?.correct?<CheckCircle2 size={19}/>:<Lightbulb size={19}/>}<div><strong>{answerResult?.unverified?'Yanıt henüz doğrulanamadı.':answerResult?.correct?'Evet, doğru düşünüyorsun.':'Burada bir düşünme adımını yeniden inceleyelim.'}</strong><span>{answerResult?.unverified?'Bağlantı geri geldiğinde yeniden deneyebilirsin.':answerResult?.correct?'Kuralı doğru uyguladın.':'Yanlış cevap bir ipucu; birlikte nerede ayrıldığını bulalım.'}</span></div></div>
            <TutorMessage text={answerResult?.correct ? answerResult.explanation : (answerResult?.misconception || answerResult?.explanation || '')} />
            {answerResult?.repeated&&<small>Bu soru daha önce kaydedilmiş. Tekrar çözüm yeni ilerleme olarak sayılmadı.</small>}
            <div className="feedback-actions"><button className="button button-primary" onClick={()=>{setView('coach');setChatInput('Bu soruda '+(answerResult?.correct?'hangi kuralı kullandığımı':'hangi adımda hata yapmış olabileceğimi')+' adım adım anlatır mısın?')}}><MessageCircle size={15}/> Birlikte incele</button><button className="button button-secondary" onClick={startRetry}>Benzer soru çöz <ArrowRight size={15}/></button></div>
          </div>}
          <div className="source-strip"><ShieldCheck size={15}/><div><strong>{question.verified?'Resmî kaynak bilgisi':'Örnek içerik'}</strong><span>{question.source}</span></div>{question.sourceUrl&&<a href={question.sourceUrl} target="_blank" rel="noreferrer">Kaynağı aç <ArrowUpRight size={13}/></a>}</div>
        </section>
        <aside className="practice-aside">
          <section className="surface aside-card"><div className="aside-heading"><span className="plan-icon mint"><BrainCircuit size={18}/></span><span className="eyebrow muted">ÖĞRENME YÖNTEMİ</span></div><h3>Sonucu değil, düşünme yolunu bul.</h3><ol className="step-list"><li className={submitted?'complete':''}><span>1</span><div><strong>Önce kendin dene</strong><small>İlk düşünceni seç.</small></div></li><li className={answerResult?'complete':''}><span>2</span><div><strong>Geri bildirimi incele</strong><small>Hangi adımın önemli olduğunu gör.</small></div></li><li><span>3</span><div><strong>Benzer soruda uygula</strong><small>Öğrenmeyi tekrar dene.</small></div></li></ol></section>
          <section className="surface aside-card ai-nudge"><span className="eyebrow muted">YARDIMA MI İHTİYACIN VAR?</span><p>“Neden bu işlemi yaptık?” diye sorabilirsin.</p><button className="text-button" onClick={()=>chooseView('coach')}>AI çalışma arkadaşına git <ArrowRight size={15}/></button></section>
        </aside>
      </div>}
    </div>;
  }

  function Coach() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME DESTEĞİ</span><h1>AI çalışma arkadaşın.</h1><p>Sana cevabı hemen vermek yerine düşünme adımlarını açmana yardım eder.</p></div><span className={'connection-pill '+(health?.hasGeminiKey?'connected':'not-connected')}><span/>{health?.hasGeminiKey?'Gemini bağlantısı hazır':health===null?'Bağlantı durumu bilinmiyor':'API anahtarı algılanmadı'}</span></div>
      <div className="coach-layout">
        <section className="surface chat-panel">
          <div className="chat-head"><div className="coach-avatar"><Sparkles size={20}/></div><div><strong>Kübik Öğrenme Rehberi</strong><span><span className="live-dot"/> Matematik · {student.grade}</span></div><span className="chat-safe"><ShieldCheck size={14}/> Öğrenme odaklı</span></div>
          <div className="chat-messages">{chat.map((item,i)=><div key={i} className={'message-row '+(item.role==='user'?'message-user':'')}><div className="message-avatar">{item.role==='user'?student.initials:<Sparkles size={15}/>}</div><div className="message-bubble"><span className="message-author">{item.role==='user'?'Sen':'Öğrenme rehberi'}</span><TutorMessage text={item.text}/></div></div>)}{chatLoading&&<div className="message-row"><div className="message-avatar"><Sparkles size={15}/></div><div className="message-bubble typing"><span/><span/><span/></div></div>}<div ref={chatEnd}/></div>
          {chatError&&<div className="chat-error"><CircleHelp size={14}/>{chatError} <span>Gösterilen sabit ipucu canlı AI yanıtı değildir.</span></div>}
          <div className="suggestion-row"><button onClick={()=>void sendChat(track==='LGS'?'Üslerin üssü kuralını basit bir örnekle açıklar mısın?':'Fonksiyonlarda x yerine değer yazmak ne demek?')}>{track==='LGS'?'Üslerin üssü kuralı':'Fonksiyon nedir?'}</button><button onClick={()=>void sendChat('Bana cevabı söylemeden bir ipucu verir misin?')}>Bir ipucu ver</button><button onClick={()=>void sendChat('Küçük bir örnek üzerinden anlatır mısın?')}>Örnekle anlat</button></div>
          <form className="chat-composer" onSubmit={e=>{e.preventDefault();void sendChat();}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Takıldığın adımı buraya yaz…" aria-label="AI çalışma arkadaşına mesaj"/><button className="send-button" type="submit" disabled={!chatInput.trim()||chatLoading} aria-label="Mesajı gönder"><Send size={17}/></button></form>
          <p className="chat-disclaimer">AI yanıtları hata içerebilir. Önemli akademik kararlar için öğretmeninle kontrol et.</p>
        </section>
        <aside className="surface coach-context"><span className="eyebrow muted">ÇALIŞMA BAĞLAMI</span><h3>Bugünkü konun</h3><div className="context-topic"><div className="plan-icon indigo"><BookOpen size={18}/></div><div><strong>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</strong><span>Matematik · {student.grade}</span></div></div><div className="context-divider"/><span className="eyebrow muted">İSTERSEN ŞUNU SOR</span><button className="prompt-card" onClick={()=>setChatInput('Bu konuyu 3 kısa adımda anlatır mısın?')}>Bu konuyu 3 kısa adımda anlat <ArrowRight size={15}/></button><button className="prompt-card" onClick={()=>setChatInput('Yanlış cevabım hangi düşünce hatasından kaynaklanmış olabilir?')}>Yanlışım ne anlatıyor olabilir? <ArrowRight size={15}/></button><div className="teacher-note"><Lightbulb size={16}/><p>Bir soruda uzun süre takılırsan, öğretmeninden destek istemek de iyi bir öğrenme adımıdır.</p></div></aside>
      </div>
    </div>;
  }

  function ProgressView() {
    return <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KENDİ GELİŞİMİNİ İZLE</span><h1>Her doğru adım bir iz bırakır.</h1><p>Bu görünüm, demo oturumunda kaydedilen yanıtları ve sıradaki çalışma önerisini bir araya getirir.</p></div></div>
      <div className="progress-overview"><section className="surface mastery-card"><span className="eyebrow muted">KONU İLERLEMESİ</span><div className="mastery-number">{mastery}<small>%</small></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><p>{progress===null?'Başlangıç göstergesi · gerçek öğrenci verisi değildir.':'Sunucu tarafında kayıtlı demo konu ilerlemesi.'}</p></section><section className="surface next-step-card"><div className="plan-icon amber"><Target size={19}/></div><span className="eyebrow muted">ÖNERİLEN SONRAKİ ADIM</span><h3>{answerResult&&!answerResult.correct?'Bu adımı yeniden çalış':'Benzer bir soruda kuralı uygula'}</h3><p>{answerResult&&!answerResult.correct?'Yanlış seçeneğin hangi düşünceyi işaret ettiğini AI çalışma arkadaşıyla incele.':'Aynı kazanımı farklı bir örnekte kullanarak gerçekten anladığını kontrol et.'}</p><button className="button button-primary" onClick={startRetry}>Bir soru daha çöz <ArrowRight size={15}/></button></section></div>
      <section className="surface reflection-card"><div className="surface-heading"><div><span className="eyebrow muted">KISA ÖZ DEĞERLENDİRME</span><h3>Bugün kendine sor</h3></div><span className="round-icon"><Lightbulb size={18}/></span></div><div className="reflection-list"><div><span>01</span><p>Hangi kuralı kullandım, neden?</p><button onClick={()=>{setView('coach');setChatInput('Bugünkü soruda hangi kuralı neden kullandığımı anlamama yardım et.')}}>Birlikte düşün <ArrowRight size={14}/></button></div><div><span>02</span><p>Benzer bir soruda tek başıma deneyebilir miyim?</p><button onClick={startRetry}>Kendimi dene <ArrowRight size={14}/></button></div><div><span>03</span><p>Hangi adım için öğretmen desteğine ihtiyacım var?</p><button onClick={()=>setNotice('Öğretmen görünümünde bu konu için destek notu gösteriliyor.')}>Not al <ArrowRight size={14}/></button></div></div></section>
    </div>;
  }

  const renderTeacher = () => <div className="page-stack">
    <div className="page-intro"><div><span className="eyebrow muted">ÖĞRETMEN ÇALIŞMA ALANI</span><h1>Öğrencinin takıldığı yeri görün.</h1><p>Öğrenme verisini bir sonraki öğretmen müdahalesine dönüştüren sade görünüm.</p></div><span className="quiet-pill"><Users size={14}/> Demo öğrenci: {student.name}</span></div>
    <section className="teacher-student-banner"><div className="student-avatar large">{student.initials}</div><div className="teacher-student-copy"><span className="eyebrow">ÖĞRENCİ KARTI · DEMO</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><button className="button button-light" onClick={()=>{setRole('student');setView('practice')}}>Öğrenci akışını aç <ArrowRight size={15}/></button></section>
    <div className="teacher-grid"><section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">KONU DURUMU</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="topic-chip"><Activity size={14}/> {progress===null?'Demo': 'Kayıtlı'}</span></div><div className="teacher-mastery"><strong>{mastery}%</strong><div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Başlangıç örneği; henüz kayıtlı sonuç yok.':'Öğrenci oturumunda kaydedilen konu göstergesi.'}</small></div></div><div className="signal-row"><div className="signal-icon amber"><Lightbulb size={17}/></div><div><strong>Öğretmen için olası müdahale</strong><p>{answerResult&&!answerResult.correct?'Üs kurallarında aynı tabana çevirme adımını kısa bir örnekle tekrar edin.':'Öğrenciden kullandığı kuralı kendi cümleleriyle açıklamasını isteyin.'}</p></div></div></section>
    <section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">OTURUM ÖZETİ</span><h3>Bu çalışmada</h3></div><span className="round-icon"><NotebookPen size={17}/></span></div><div className="session-stat"><span>Yanıt durumu</span><strong>{submitted?(answerResult?.correct?'Doğru':'Tekrar gerekli'):'Henüz yanıtlanmadı'}</strong></div><div className="session-stat"><span>AI destek etkileşimi</span><strong>{chat.filter(x=>x.role==='user').length} mesaj</strong></div><div className="session-stat"><span>İçerik kaynağı</span><strong>{question?.verified?'MEB · doğrulanmış':'Demo örneği'}</strong></div><button className="button button-secondary full-button" onClick={()=>{setRole('student');setView('coach')}}>Öğrenciyle aynı konuyu incele <ArrowRight size={15}/></button></section></div>
    <section className="surface teacher-next"><div className="plan-icon mint"><MessageCircle size={18}/></div><div><span className="eyebrow muted">ÖNERİLEN ÖĞRETMEN NOTU</span><h3>“Sonucu nasıl bulduğunu anlatır mısın?”</h3><p>Öğrencinin yalnızca doğru cevabı değil, kullandığı düşünme yolunu da açıklamasını isteyin.</p></div><button className="text-button" onClick={()=>setNotice('Öğretmen notu bu demo oturumu için seçildi.')}>Notu seç <Check size={15}/></button></section>
  </div>;

  const renderParent = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">VELİ GÖRÜNÜMÜ</span><h1>Gelişimi anlaşılır şekilde takip edin.</h1><p>Notlardan çok, çalışma rutini ve bir sonraki destek adımına odaklanın.</p></div></div>
    <section className="parent-summary surface"><div className="student-avatar large">{student.initials}</div><div className="parent-child"><span className="eyebrow muted">ÖĞRENCİ</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><div className="parent-progress"><span>Konu ilerleme göstergesi</span><strong>{mastery}%</strong><div className="progress-track"><span style={{width:mastery+'%'}}/></div></div></section>
    <div className="parent-grid"><section className="surface"><span className="eyebrow muted">BU OTURUMDA</span><h3>{submitted?'Bir soru üzerinde çalıştı':'Çalışma sırasındaki adım'}</h3><p>{submitted?'Yanıt sonrası açıklama ve tekrar önerisi sunuldu.':'Bir soruyu kendi başına denemesi ve ardından açıklamayı incelemesi planlandı.'}</p><div className="parent-step"><CheckCircle2 size={17}/><span>Önce kendi başına deneme</span></div><div className="parent-step"><CheckCircle2 size={17}/><span>Yanlışın nedenini anlama</span></div><div className="parent-step"><Clock3 size={17}/><span>Benzer soruyla pekiştirme</span></div></section><section className="surface parent-advice"><div className="plan-icon amber"><Lightbulb size={18}/></div><span className="eyebrow muted">EVDE DESTEK İÇİN</span><h3>“Bugün neyi farklı anladın?”</h3><p>Doğru sayısını sormak yerine, öğrendiği kuralı kendi cümleleriyle anlatmasını isteyin.</p><button className="button button-secondary" onClick={()=>{setRole('student');setView('progress')}}>Gelişim görünümünü aç <ArrowRight size={15}/></button></section></div>
  </div>;

  const renderCenter = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KÜBİK · KURUM GÖRÜNÜMÜ</span><h1>Eğitim sürecini görünür kılın.</h1><p>Bu demo, bireysel öğrenme döngüsünün kurum içindeki karşılığını gösterir. Gerçek kurum verisi içermez.</p></div></div>
    <div className="center-metrics"><section className="surface"><span className="metric-label">AKTİF DEMO ÖĞRENCİ</span><strong>01</strong><small>Sunum senaryosu · gerçek kayıt sayısı değil</small></section><section className="surface"><span className="metric-label">ÖĞRENME DÖNGÜSÜ</span><strong>{submitted?'3 / 3':'1 / 3'}</strong><small>{submitted?'Yanıt ve geri bildirim gösterildi.':'Yanıt bekleniyor; akış canlı denenebilir.'}</small></section><section className="surface"><span className="metric-label">AI BAĞLANTISI</span><strong>{health?.hasGeminiKey?'Hazır':'Kontrol gerekli'}</strong><small>API anahtarı sunucu tarafından kontrol edilir.</small></section></div>
    <section className="surface center-flow"><div className="surface-heading"><div><span className="eyebrow muted">ÜRÜNÜN TEMEL DÖNGÜSÜ</span><h3>Tek akış, dört rol</h3></div><span className="round-icon"><Activity size={18}/></span></div><div className="flow-steps"><div><span>01</span><BookOpen size={20}/><strong>Öğrenci çalışır</strong><p>Soru ve yanıt</p></div><ArrowRight/><div><span>02</span><BrainCircuit size={20}/><strong>Geri bildirim</strong><p>Hata nedeni ve ipucu</p></div><ArrowRight/><div><span>03</span><Users size={20}/><strong>Öğretmen görür</strong><p>Müdahale önerisi</p></div><ArrowRight/><div><span>04</span><Activity size={20}/><strong>İlerleme izlenir</strong><p>Ortak kayıt</p></div></div></section>
    <section className="surface center-next"><div><span className="eyebrow muted">ÜRÜN KEŞFİ İÇİN SONRAKİ ADIM</span><h3>Önce Kubik’in gerçek sürecini tanımlayalım.</h3><p>Öğrenci grupları, öğretmen iş akışı, mevcut dijital araçlar ve veli iletişimi sahipleriyle birlikte doğrulanmalı. Bu demo üretim sistemi veya gelir tahmini değildir.</p></div><button className="button button-primary" onClick={()=>setNotice('Keşif gündemi: öğrenci akışı, öğretmen müdahalesi, veli iletişimi ve ölçülebilir kazanımlar.')}>Keşif gündemini göster <ArrowRight size={15}/></button></section>
  </div>;

  return <div className="product-shell">
    <header className="topbar"><button className="brand" onClick={()=>{setRole('student');setView('today')}} aria-label="Kübik ana sayfa"><span className="brand-symbol"><span/><span/><span/><span/></span><span className="brand-word">kübik<span>+</span><small>ÖĞRENME ATÖLYESİ</small></span></button>
      <div className="topbar-center"><span className="demo-status"/><span>ÜRÜN DENEYİMİ</span><span className="topbar-separator">/</span><span>{role==='student'?'ÖĞRENCİ ROTASI':role==='teacher'?'ÖĞRETMEN MASASI':role==='parent'?'VELİ ÖZETİ':'KURUM PERSPEKTİFİ'}</span></div>
      <div className="topbar-actions"><div className="track-switch"><button className={track==='LGS'?'active':''} onClick={()=>changeTrack('LGS')}>LGS</button><button className={track==='YKS'?'active':''} onClick={()=>changeTrack('YKS')}>YKS</button></div><div className="user-chip"><span className="student-avatar">{student.initials}</span><span><strong>{student.name}</strong><small>{student.grade}</small></span><ChevronDown size={14}/></div></div>
    </header>
    <div className="app-frame"><aside className="sidebar"><div className="sidebar-label">ÇALIŞMA ALANI</div><div className="nav-list">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={'nav-item '+(role==='student'&&view===item.id?'active':'')} onClick={()=>{setRole('student');chooseView(item.id)}}><span className="nav-icon"><Icon size={18}/></span><span className="nav-text"><strong>{item.label}</strong><small>{item.hint}</small></span>{role==='student'&&view===item.id&&<span className="nav-active-dot"/>}</button>})}</div><div className="sidebar-divider"/><div className="sidebar-label">AYNI ÖĞRENME, FARKLI BAKIŞ</div><div className="role-list">{roles.filter(r=>r.id!=='student').map(r=><button key={r.id} className={'role-item '+(role===r.id?'active':'')} onClick={()=>setRole(r.id)}><span className="role-avatar">{r.id==='teacher'?<GraduationCap size={17}/>:r.id==='parent'?<Users size={17}/>:<Activity size={17}/>}</span><span>{r.label}</span><ChevronRight size={15}/></button>)}</div><div className="sidebar-bottom"><div className="privacy-mark"><ShieldCheck size={16}/><span><strong>Güvenilir öğrenme</strong><small>Demo · gerçek öğrenci hesabı değil</small></span></div><button className="help-link" onClick={()=>setNotice('Bu demo, Kubik ile birlikte doğrulanacak bir ürün fikridir; üretim sistemi değildir.')}>Bu demo hakkında <CircleHelp size={14}/></button></div></aside>
      <main className="main-area"><div className="mobile-track-note"><span className="live-dot"/> {student.goal} <span>· Demo profili</span></div>{notice&&<div className="notice-bar"><Lightbulb size={16}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Bildirimi kapat"><X size={15}/></button></div>}
        {role==='student'?renderStudent():role==='teacher'?renderTeacher():role==='parent'?renderParent():renderCenter()}
        <footer className="app-footer"><span>kübik+ <i>·</i> Öğrenme atölyesi</span><span><ShieldCheck size={13}/> Demo içerikleri açıkça etiketlenmiştir</span></footer>
      </main>
    </div>
  </div>;
}

export default App;
)
    .replace(/\\\\\\)/g, () => '
type Role = 'student' | 'teacher' | 'parent' | 'center';
type View = 'today' | 'practice' | 'coach' | 'progress';
type ChatItem = { role: 'user' | 'assistant'; text: string };
type AnswerResult = { correct: boolean; explanation: string; misconception?: string; repeated?: boolean; unverified?: boolean };
type Option = { id: string; text: string };
type Question = {
  id: string; track: Track; topic: string; prompt: string; options: Option[];
  source: string; sourceUrl?: string; verified: boolean; hints?: string[];
};
const students: Record<Track, { id: string; name: string; grade: string; goal: string; initials: string }> = {
  LGS: { id: 'std_lgs_801', name: 'Kerem Demir', grade: '8. sınıf', goal: 'LGS · Matematik', initials: 'KD' },
  YKS: { id: 'std_yks_1101', name: 'Selin Yılmaz', grade: '11. sınıf', goal: 'YKS · Matematik', initials: 'SY' }
};
const roles: { id: Role; label: string }[] = [
  { id: 'student', label: 'Öğrenci' }, { id: 'teacher', label: 'Öğretmen' },
  { id: 'parent', label: 'Veli' }, { id: 'center', label: 'Kurum' }
];
const demoRetry: Question = {
  id: 'demo-retry-uslu-01', track: 'LGS', topic: 'Üslü ifadeler · pekiştirme',
  prompt: 'Bir sayının 2⁵ katı 2⁹ ise bu sayı kaçtır?',
  options: [{id:'A',text:'2³'}, {id:'B',text:'2⁴'}, {id:'C',text:'2⁵'}, {id:'D',text:'2¹⁴'}],
  source: 'Kübik demo için hazırlanmış pekiştirme sorusu · resmî sınav sorusu değildir',
  verified: false
};
const demoYks: Question = {
  id: 'demo-yks-function-01', track: 'YKS', topic: 'Fonksiyonlar',
  prompt: 'f(x) = 3x − 2 olduğuna göre f(4) kaçtır?',
  options: [{id:'A',text:'8'}, {id:'B',text:'10'}, {id:'C',text:'12'}, {id:'D',text:'14'}],
  source: 'Kübik demo için hazırlanmış örnek · resmî YKS sorusu değildir',
  verified: false
};
const localAnswer: Record<string, { key: string; explanation: string; misconception: Record<string,string> }> = {
  'demo-retry-uslu-01': {
    key:'B', explanation:'2⁵ ile çarpıldığında 2⁹ elde ediliyorsa, aynı tabanlı üsleri bölme işleminde çıkarırız: 2⁹ ÷ 2⁵ = 2⁴.',
    misconception:{A:'Üsleri çıkarırken 9 − 5 işlemini yeniden kontrol et. Sonuç 4 olmalı.',C:'2⁵ sayının kendisi değil, onu çarptığımız katsayı. Bilinmeyeni bulmak için bölmeliyiz.',D:'Çarpma kuralını kullanmış olabilirsin; bilinmeyeni yalnız bırakmak için bölme yap.'}
  },
  'demo-yks-function-01': {
    key:'B', explanation:'f(4) demek, x yerine 4 yazmak demektir: 3 × 4 − 2 = 12 − 2 = 10.',
    misconception:{A:'3 × 4 = 12 adımından sonra 2 çıkarma adımını da yapmalısın.',C:'12 yalnızca 3 × 4 işleminin sonucu. Sonra 2 çıkarılır.',D:'İşlemde +2 yok; verilen ifade 3x − 2.'}
  }
};

function App() {
  const [track, setTrack] = useState<Track>('LGS');
  const [role, setRole] = useState<Role>('student');
  const [view, setView] = useState<View>('today');
  const [officialQuestion, setOfficialQuestion] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [retryMode, setRetryMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatItem[]>([{role:'assistant',text:'Merhaba! Nerede takıldığını birlikte bulalım. İstersen sorudaki bir adımı yazabilir ya da aşağıdaki kısa sorulardan biriyle başlayabilirsin.'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState<{hasGeminiKey:boolean} | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const student = students[track];

  useEffect(() => {
    fetch('/api/health').then(r=>r.json()).then(setHealth).catch(()=>setHealth(null));
  }, []);

  useEffect(() => {
    let alive = true;
    setQuestionLoading(true);
    setQuestion(null);
    setSelected(null); setSubmitted(false); setAnswerResult(null); setRetryMode(false);
    setChat([{role:'assistant',text:track === 'LGS'
      ? 'Bu soruyu hemen çözmek zorunda değilsin. Önce hangi kuralın gerektiğini bulalım; sonra birlikte adım adım ilerleriz.'
      : 'Fonksiyon sorularında ilk küçük adım, x yerine verilen sayıyı yazmaktır. İstersen bunu bir örnek üzerinde deneyelim.'}]);
    const load = async () => {
      try {
        const response = await fetch('/api/content/verified-question?studentId=' + student.id);
        const data = await response.json();
        if (!alive) return;
        if (track === 'LGS' && data.available && data.question) {
          const q = data.question;
          const mapped: Question = {
            id:q.id, track:'LGS', topic:q.topic, prompt:q.questionText,
            options:q.options.map((o:Option)=>({id:o.id,text:o.text})),
            source:q.sourceDocument, sourceUrl:q.sourceUrl,
            verified:q.verificationStatus === 'verified_official_publication',
            hints:q.pedagogicalHints
          };
          setOfficialQuestion(mapped); setQuestion(mapped);
        } else {
          setOfficialQuestion(null);
          setQuestion(track === 'LGS' ? demoRetry : demoYks);
        }
      } catch {
        if (!alive) return;
        setQuestion(track === 'LGS' ? demoRetry : demoYks);
        setNotice('Sunucuya ulaşılamadı. Şu an yalnızca yerel demo örneği gösteriliyor.');
      } finally {
        if (alive) { setQuestionLoading(false); loadProgress(); }
      }
    };
    const loadProgress = async () => {
      try {
        const r = await fetch('/api/student/progress?studentId=' + student.id);
        const d = await r.json();
        if (alive && r.ok && typeof d.progress?.currentMastery === 'number') setProgress(d.progress.currentMastery);
        else if (alive) setProgress(null);
      } catch { if (alive) setProgress(null); }
    };
    void load();
    return () => { alive = false; };
  }, [track, student.id]);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth',block:'end'}); }, [chat,chatLoading]);

  const mastery = progress ?? (track === 'LGS' ? 52 : 38);
  const nav: {id:View; label:string; hint:string; icon:typeof House}[] = [
    {id:'today',label:'Bugünüm',hint:'Günlük rota',icon:House},
    {id:'practice',label:'Soru atölyesi',hint:'Çöz ve öğren',icon:NotebookPen},
    {id:'coach',label:'AI çalışma arkadaşı',hint:'Takıldığın yerde',icon:MessageCircle},
    {id:'progress',label:'Gelişimim',hint:'Neler değişiyor?',icon:Activity}
  ];
  const changeTrack = (next:Track) => { setTrack(next); setRole('student'); setView('today'); setNotice(''); };
  const chooseView = (next:View) => { setView(next); setNotice(''); };

  const submitAnswer = async () => {
    if (!question || !selected || submitted) return;
    setSubmitted(true);
    const local = localAnswer[question.id];
    let correct = false;
    let explanation = '';
    let misconception = '';
    let repeated = false;
    if (question.verified && track === 'LGS') {
      try {
        const r = await fetch('/api/student/answer', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            studentId:student.id, topicId:'top_lgs_uslu', questionId:question.id,
            chosenOptionId:selected, hintsUsedCount:0, aiTutorInteractionsCount:chat.filter(x=>x.role==='user').length
          })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Yanıt kaydedilemedi.');
        correct = Boolean(d.isCorrect); repeated = Boolean(d.isRepeatedAttempt);
        explanation = d.officialSolution?.summary || d.explanation || 'Yanıt değerlendirildi.';
        const selectedIndex = question.options.findIndex(o=>o.id===selected);
        const hintIndex = selectedIndex === 0 ? 0 : Math.max(0, selectedIndex - 1);
        misconception = correct ? '' : (question.hints?.[hintIndex] || 'Önce ifadeleri aynı tabana çevirip üs kurallarını adım adım uygulayalım.');
        if (typeof d.updatedMastery?.currentMastery === 'number') setProgress(d.updatedMastery.currentMastery);
      } catch {
        setAnswerResult({
          correct: false,
          unverified: true,
          explanation: 'Sunucuya ulaşılamadığı için bu yanıt doğrulanamadı. Cevap anahtarını tahmin etmeyeceğiz ve ilerleme kaydı oluşturulmadı.',
          misconception: ''
        });
        return;
      }
    } else if (local) {
      correct = selected === local.key;
      explanation = local.explanation;
      misconception = correct ? '' : (local.misconception[selected] || 'İşlem adımlarını birer birer kontrol edelim.');
    } else {
      explanation = 'Bu örnek için cevap anahtarı doğrulanmadı. Öğretmenle birlikte kontrol etmek üzere işaretlendi.';
    }
    setAnswerResult({correct, explanation, misconception, repeated});
    if (!correct) setNotice('Hata bir sonuç değil, nereden devam edeceğimizi gösteren ipucu.');
  };

  const startRetry = () => {
    setQuestion(track === 'LGS' ? demoRetry : demoYks);
    setRetryMode(true); setSelected(null); setSubmitted(false); setAnswerResult(null);
    setView('practice'); setRole('student');
    setNotice('Pekiştirme sorusu açıldı. Bu soru demo için hazırlandı; resmî sınav sorusu değildir.');
  };

  const sendChat = async (message?:string) => {
    const text = (message ?? chatInput).trim();
    if (!text || chatLoading) return;
    setChatInput('');
    setChatError('');
    const next = [...chat,{role:'user' as const,text}];
    setChat(next); setChatLoading(true);
    try {
      const response = await fetch('/api/tutor/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          studentId:student.id,
          userMessage:text,
          chatHistory:next.slice(-8).map(m=>({role:m.role,content:m.text}))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI yanıtı alınamadı.');
      setChat(old=>[...old,{role:'assistant',text:data.reply}]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Bağlantı kurulamadı.';
      setChatError(messageText);
      const safeFallback = track === 'LGS'
        ? 'Şu anda canlı AI yanıtı alamadım. Yine de şu ilk adımı birlikte yapabiliriz: 8⁴ ifadesini 2 tabanında yaz. Çünkü 8 = 2³. Sonra üslerin üssü kuralını uygula. Bu, otomatik AI yanıtı değil; demo içindeki sabit ipucudur.'
        : 'Canlı AI yanıtı alınamadı. Fonksiyonlarda x yerine verilen sayıyı koyup işlem sırasıyla ilerleriz. Bu parkurda resmî soru içeriği henüz doğrulanmadı; bu yüzden örneği resmî soru diye sunmayacağım.';
      setChat(old=>[...old,{role:'assistant',text:safeFallback}]);
    } finally { setChatLoading(false); }
  };

  const resetPractice = () => {
    if (track === 'LGS' && officialQuestion) { setQuestion(officialQuestion); setRetryMode(false); }
    else { setQuestion(track === 'LGS' ? demoRetry : demoYks); setRetryMode(true); }
    setSelected(null); setSubmitted(false); setAnswerResult(null); setNotice('');
  };

  const renderStudent = () => {
    if (view === 'coach') return Coach();
    if (view === 'progress') return ProgressView();
    if (view === 'practice') return PracticeView();
    return TodayView();
  };

  function TodayView() {
    return <div className="page-stack">
      <section className="welcome-band">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="live-dot" /> BUGÜNÜN ÖĞRENME ROTASI</div>
          <h1>Selam {student.name.split(' ')[0]},<br/><span>küçük adımlar büyütür.</span></h1>
          <p>Bugün her şeyi bitirmek zorunda değilsin. Bir konuyu gerçekten anlamak yeterli.</p>
          <button className="button button-light" onClick={()=>chooseView('practice')}>İlk çalışmaya başla <ArrowRight size={16}/></button>
        </div>
        <div className="route-art" aria-hidden="true">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="orbit-core"><BrainCircuit size={38}/></div>
          <div className="orbit-tag tag-one"><Target size={15}/> 1 konu</div>
          <div className="orbit-tag tag-two"><CheckCircle2 size={15}/> 1 adım</div>
        </div>
      </section>
      <div className="section-heading"><div><span className="eyebrow muted">BUGÜN SANA ÖZEL</span><h2>Çalışma planın</h2></div><span className="quiet-pill"><CalendarDays size={14}/> Bugün · 20 dk</span></div>
      <section className="plan-grid">
        <button className="plan-card plan-main" onClick={()=>chooseView('practice')}>
          <div className="plan-icon indigo"><NotebookPen size={20}/></div><div className="plan-meta"><span>01 · MATEMATİK</span><span className="duration"><Clock3 size={13}/> 10 dk</span></div>
          <h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3><p>{track==='LGS'?'Üs kurallarını bir problemde kullan.':'Fonksiyon değerini adım adım hesapla.'}</p>
          <div className="plan-bottom"><span>Çalışmaya geç</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('coach')}>
          <div className="plan-icon mint"><MessageCircle size={20}/></div><div className="plan-meta"><span>02 · ANLAMA</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Takıldığın yeri sor</h3><p>Bir adımı anlamadıysan AI çalışma arkadaşıyla birlikte aç.</p>
          <div className="plan-bottom"><span>Soru sor</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('progress')}>
          <div className="plan-icon amber"><Activity size={20}/></div><div className="plan-meta"><span>03 · GERİ BAKIŞ</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Ne öğrendin?</h3><p>Yanıtlarını ve sıradaki küçük adımını gözden geçir.</p>
          <div className="plan-bottom"><span>Gelişimi gör</span><ArrowRight size={16}/></div>
        </button>
      </section>
      <div className="lower-grid">
        <section className="surface focus-panel"><div className="surface-heading"><div><span className="eyebrow muted">BU HAFTAKİ ODAĞIN</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="round-icon"><Target size={18}/></span></div>
          <p className="body-copy">Amaç sadece doğru cevabı bulmak değil; hangi kuralı neden kullandığını anlatabilmek.</p>
          <div className="mastery-line"><div><span>Örnek ilerleme göstergesi</span><strong>{mastery}%</strong></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Bu gösterge başlangıç demo değeridir; gerçek öğrenci başarısı değildir.':'Bu demo oturumunda sunucuya kaydedilen konu ilerlemesi.'}</small></div>
        </section>
        <section className="surface note-panel"><div className="note-icon"><Lightbulb size={20}/></div><span className="eyebrow muted">KÜÇÜK HATIRLATMA</span><h3>Hata yapmak, öğrenmenin bir parçası.</h3><p>Yanlış cevapta sadece sonucu değil, düşünme adımını da inceliyoruz.</p><button className="text-button" onClick={()=>chooseView('practice')}>Bir soruda dene <ArrowRight size={15}/></button></section>
      </div>
    </div>;
  }

  function PracticeView() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME ATÖLYESİ / MATEMATİK</span><h1>Çöz. Anla. Bir daha dene.</h1><p>Yanıtından sonra sadece doğru/yanlış değil, düşünme adımına dair geri bildirim alırsın.</p></div><span className="quiet-pill"><ShieldCheck size={14}/>{question?.verified?'Kaynağı doğrulanmış':'Demo örneği'}</span></div>
      {questionLoading || !question ? <div className="surface loading-surface"><div className="spinner"/><p>Soru hazırlanıyor…</p></div> :
      <div className="practice-layout">
        <section className="surface question-panel">
          <div className="question-top"><div className="topic-chip"><BookOpen size={14}/>{question.topic}</div><span className="question-count">{retryMode?'PEKİŞTİRME':'SORU 01'} / MATEMATİK</span></div>
          <h2>{question.prompt}</h2>
          <div className="option-list">{question.options.map((option,index)=><button key={option.id} disabled={submitted} className={'answer-option '+(selected===option.id?'selected ':'')+(submitted && answerResult && !answerResult.unverified && option.id=== (question.verified?'B':localAnswer[question.id]?.key)?'answer-correct ':'')+(submitted && selected===option.id && answerResult && !answerResult.correct && !answerResult.unverified?'answer-wrong':'')} onClick={()=>setSelected(option.id)}><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option.text.replace(/^[A-D]\)\s*/,'')}</span>{selected===option.id&&<span className="option-check"><Check size={15}/></span>}</button>)}</div>
          {!submitted ? <div className="question-actions"><span className="helper-text"><CircleHelp size={14}/> Takılırsan AI çalışma arkadaşına sorabilirsin.</span><button className="button button-primary" disabled={!selected} onClick={submitAnswer}>Yanıtımı kontrol et <ArrowRight size={16}/></button></div> :
          <div className={'feedback-panel '+(answerResult?.correct?'feedback-good':'feedback-try')}><div className="feedback-title">{answerResult?.correct?<CheckCircle2 size={19}/>:<Lightbulb size={19}/>}<div><strong>{answerResult?.unverified?'Yanıt henüz doğrulanamadı.':answerResult?.correct?'Evet, doğru düşünüyorsun.':'Burada bir düşünme adımını yeniden inceleyelim.'}</strong><span>{answerResult?.unverified?'Bağlantı geri geldiğinde yeniden deneyebilirsin.':answerResult?.correct?'Kuralı doğru uyguladın.':'Yanlış cevap bir ipucu; birlikte nerede ayrıldığını bulalım.'}</span></div></div>
            <p>{answerResult?.correct?answerResult.explanation:(answerResult?.misconception||answerResult?.explanation)}</p>
            {answerResult?.repeated&&<small>Bu soru daha önce kaydedilmiş. Tekrar çözüm yeni ilerleme olarak sayılmadı.</small>}
            <div className="feedback-actions"><button className="button button-primary" onClick={()=>{setView('coach');setChatInput('Bu soruda '+(answerResult?.correct?'hangi kuralı kullandığımı':'hangi adımda hata yapmış olabileceğimi')+' adım adım anlatır mısın?')}}><MessageCircle size={15}/> Birlikte incele</button><button className="button button-secondary" onClick={startRetry}>Benzer soru çöz <ArrowRight size={15}/></button></div>
          </div>}
          <div className="source-strip"><ShieldCheck size={15}/><div><strong>{question.verified?'Resmî kaynak bilgisi':'Örnek içerik'}</strong><span>{question.source}</span></div>{question.sourceUrl&&<a href={question.sourceUrl} target="_blank" rel="noreferrer">Kaynağı aç <ArrowUpRight size={13}/></a>}</div>
        </section>
        <aside className="practice-aside">
          <section className="surface aside-card"><div className="aside-heading"><span className="plan-icon mint"><BrainCircuit size={18}/></span><span className="eyebrow muted">ÖĞRENME YÖNTEMİ</span></div><h3>Sonucu değil, düşünme yolunu bul.</h3><ol className="step-list"><li className={submitted?'complete':''}><span>1</span><div><strong>Önce kendin dene</strong><small>İlk düşünceni seç.</small></div></li><li className={answerResult?'complete':''}><span>2</span><div><strong>Geri bildirimi incele</strong><small>Hangi adımın önemli olduğunu gör.</small></div></li><li><span>3</span><div><strong>Benzer soruda uygula</strong><small>Öğrenmeyi tekrar dene.</small></div></li></ol></section>
          <section className="surface aside-card ai-nudge"><span className="eyebrow muted">YARDIMA MI İHTİYACIN VAR?</span><p>“Neden bu işlemi yaptık?” diye sorabilirsin.</p><button className="text-button" onClick={()=>chooseView('coach')}>AI çalışma arkadaşına git <ArrowRight size={15}/></button></section>
        </aside>
      </div>}
    </div>;
  }

  function Coach() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME DESTEĞİ</span><h1>AI çalışma arkadaşın.</h1><p>Sana cevabı hemen vermek yerine düşünme adımlarını açmana yardım eder.</p></div><span className={'connection-pill '+(health?.hasGeminiKey?'connected':'not-connected')}><span/>{health?.hasGeminiKey?'Gemini bağlantısı hazır':health===null?'Bağlantı durumu bilinmiyor':'API anahtarı algılanmadı'}</span></div>
      <div className="coach-layout">
        <section className="surface chat-panel">
          <div className="chat-head"><div className="coach-avatar"><Sparkles size={20}/></div><div><strong>Kübik Öğrenme Rehberi</strong><span><span className="live-dot"/> Matematik · {student.grade}</span></div><span className="chat-safe"><ShieldCheck size={14}/> Öğrenme odaklı</span></div>
          <div className="chat-messages">{chat.map((item,i)=><div key={i} className={'message-row '+(item.role==='user'?'message-user':'')}><div className="message-avatar">{item.role==='user'?student.initials:<Sparkles size={15}/>}</div><div className="message-bubble"><span className="message-author">{item.role==='user'?'Sen':'Öğrenme rehberi'}</span><p>{item.text}</p></div></div>)}{chatLoading&&<div className="message-row"><div className="message-avatar"><Sparkles size={15}/></div><div className="message-bubble typing"><span/><span/><span/></div></div>}<div ref={chatEnd}/></div>
          {chatError&&<div className="chat-error"><CircleHelp size={14}/>{chatError} <span>Gösterilen sabit ipucu canlı AI yanıtı değildir.</span></div>}
          <div className="suggestion-row"><button onClick={()=>void sendChat(track==='LGS'?'Üslerin üssü kuralını basit bir örnekle açıklar mısın?':'Fonksiyonlarda x yerine değer yazmak ne demek?')}>{track==='LGS'?'Üslerin üssü kuralı':'Fonksiyon nedir?'}</button><button onClick={()=>void sendChat('Bana cevabı söylemeden bir ipucu verir misin?')}>Bir ipucu ver</button><button onClick={()=>void sendChat('Küçük bir örnek üzerinden anlatır mısın?')}>Örnekle anlat</button></div>
          <form className="chat-composer" onSubmit={e=>{e.preventDefault();void sendChat();}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Takıldığın adımı buraya yaz…" aria-label="AI çalışma arkadaşına mesaj"/><button className="send-button" type="submit" disabled={!chatInput.trim()||chatLoading} aria-label="Mesajı gönder"><Send size={17}/></button></form>
          <p className="chat-disclaimer">AI yanıtları hata içerebilir. Önemli akademik kararlar için öğretmeninle kontrol et.</p>
        </section>
        <aside className="surface coach-context"><span className="eyebrow muted">ÇALIŞMA BAĞLAMI</span><h3>Bugünkü konun</h3><div className="context-topic"><div className="plan-icon indigo"><BookOpen size={18}/></div><div><strong>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</strong><span>Matematik · {student.grade}</span></div></div><div className="context-divider"/><span className="eyebrow muted">İSTERSEN ŞUNU SOR</span><button className="prompt-card" onClick={()=>setChatInput('Bu konuyu 3 kısa adımda anlatır mısın?')}>Bu konuyu 3 kısa adımda anlat <ArrowRight size={15}/></button><button className="prompt-card" onClick={()=>setChatInput('Yanlış cevabım hangi düşünce hatasından kaynaklanmış olabilir?')}>Yanlışım ne anlatıyor olabilir? <ArrowRight size={15}/></button><div className="teacher-note"><Lightbulb size={16}/><p>Bir soruda uzun süre takılırsan, öğretmeninden destek istemek de iyi bir öğrenme adımıdır.</p></div></aside>
      </div>
    </div>;
  }

  function ProgressView() {
    return <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KENDİ GELİŞİMİNİ İZLE</span><h1>Her doğru adım bir iz bırakır.</h1><p>Bu görünüm, demo oturumunda kaydedilen yanıtları ve sıradaki çalışma önerisini bir araya getirir.</p></div></div>
      <div className="progress-overview"><section className="surface mastery-card"><span className="eyebrow muted">KONU İLERLEMESİ</span><div className="mastery-number">{mastery}<small>%</small></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><p>{progress===null?'Başlangıç göstergesi · gerçek öğrenci verisi değildir.':'Sunucu tarafında kayıtlı demo konu ilerlemesi.'}</p></section><section className="surface next-step-card"><div className="plan-icon amber"><Target size={19}/></div><span className="eyebrow muted">ÖNERİLEN SONRAKİ ADIM</span><h3>{answerResult&&!answerResult.correct?'Bu adımı yeniden çalış':'Benzer bir soruda kuralı uygula'}</h3><p>{answerResult&&!answerResult.correct?'Yanlış seçeneğin hangi düşünceyi işaret ettiğini AI çalışma arkadaşıyla incele.':'Aynı kazanımı farklı bir örnekte kullanarak gerçekten anladığını kontrol et.'}</p><button className="button button-primary" onClick={startRetry}>Bir soru daha çöz <ArrowRight size={15}/></button></section></div>
      <section className="surface reflection-card"><div className="surface-heading"><div><span className="eyebrow muted">KISA ÖZ DEĞERLENDİRME</span><h3>Bugün kendine sor</h3></div><span className="round-icon"><Lightbulb size={18}/></span></div><div className="reflection-list"><div><span>01</span><p>Hangi kuralı kullandım, neden?</p><button onClick={()=>{setView('coach');setChatInput('Bugünkü soruda hangi kuralı neden kullandığımı anlamama yardım et.')}}>Birlikte düşün <ArrowRight size={14}/></button></div><div><span>02</span><p>Benzer bir soruda tek başıma deneyebilir miyim?</p><button onClick={startRetry}>Kendimi dene <ArrowRight size={14}/></button></div><div><span>03</span><p>Hangi adım için öğretmen desteğine ihtiyacım var?</p><button onClick={()=>setNotice('Öğretmen görünümünde bu konu için destek notu gösteriliyor.')}>Not al <ArrowRight size={14}/></button></div></div></section>
    </div>;
  }

  const renderTeacher = () => <div className="page-stack">
    <div className="page-intro"><div><span className="eyebrow muted">ÖĞRETMEN ÇALIŞMA ALANI</span><h1>Öğrencinin takıldığı yeri görün.</h1><p>Öğrenme verisini bir sonraki öğretmen müdahalesine dönüştüren sade görünüm.</p></div><span className="quiet-pill"><Users size={14}/> Demo öğrenci: {student.name}</span></div>
    <section className="teacher-student-banner"><div className="student-avatar large">{student.initials}</div><div className="teacher-student-copy"><span className="eyebrow">ÖĞRENCİ KARTI · DEMO</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><button className="button button-light" onClick={()=>{setRole('student');setView('practice')}}>Öğrenci akışını aç <ArrowRight size={15}/></button></section>
    <div className="teacher-grid"><section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">KONU DURUMU</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="topic-chip"><Activity size={14}/> {progress===null?'Demo': 'Kayıtlı'}</span></div><div className="teacher-mastery"><strong>{mastery}%</strong><div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Başlangıç örneği; henüz kayıtlı sonuç yok.':'Öğrenci oturumunda kaydedilen konu göstergesi.'}</small></div></div><div className="signal-row"><div className="signal-icon amber"><Lightbulb size={17}/></div><div><strong>Öğretmen için olası müdahale</strong><p>{answerResult&&!answerResult.correct?'Üs kurallarında aynı tabana çevirme adımını kısa bir örnekle tekrar edin.':'Öğrenciden kullandığı kuralı kendi cümleleriyle açıklamasını isteyin.'}</p></div></div></section>
    <section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">OTURUM ÖZETİ</span><h3>Bu çalışmada</h3></div><span className="round-icon"><NotebookPen size={17}/></span></div><div className="session-stat"><span>Yanıt durumu</span><strong>{submitted?(answerResult?.correct?'Doğru':'Tekrar gerekli'):'Henüz yanıtlanmadı'}</strong></div><div className="session-stat"><span>AI destek etkileşimi</span><strong>{chat.filter(x=>x.role==='user').length} mesaj</strong></div><div className="session-stat"><span>İçerik kaynağı</span><strong>{question?.verified?'MEB · doğrulanmış':'Demo örneği'}</strong></div><button className="button button-secondary full-button" onClick={()=>{setRole('student');setView('coach')}}>Öğrenciyle aynı konuyu incele <ArrowRight size={15}/></button></section></div>
    <section className="surface teacher-next"><div className="plan-icon mint"><MessageCircle size={18}/></div><div><span className="eyebrow muted">ÖNERİLEN ÖĞRETMEN NOTU</span><h3>“Sonucu nasıl bulduğunu anlatır mısın?”</h3><p>Öğrencinin yalnızca doğru cevabı değil, kullandığı düşünme yolunu da açıklamasını isteyin.</p></div><button className="text-button" onClick={()=>setNotice('Öğretmen notu bu demo oturumu için seçildi.')}>Notu seç <Check size={15}/></button></section>
  </div>;

  const renderParent = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">VELİ GÖRÜNÜMÜ</span><h1>Gelişimi anlaşılır şekilde takip edin.</h1><p>Notlardan çok, çalışma rutini ve bir sonraki destek adımına odaklanın.</p></div></div>
    <section className="parent-summary surface"><div className="student-avatar large">{student.initials}</div><div className="parent-child"><span className="eyebrow muted">ÖĞRENCİ</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><div className="parent-progress"><span>Konu ilerleme göstergesi</span><strong>{mastery}%</strong><div className="progress-track"><span style={{width:mastery+'%'}}/></div></div></section>
    <div className="parent-grid"><section className="surface"><span className="eyebrow muted">BU OTURUMDA</span><h3>{submitted?'Bir soru üzerinde çalıştı':'Çalışma sırasındaki adım'}</h3><p>{submitted?'Yanıt sonrası açıklama ve tekrar önerisi sunuldu.':'Bir soruyu kendi başına denemesi ve ardından açıklamayı incelemesi planlandı.'}</p><div className="parent-step"><CheckCircle2 size={17}/><span>Önce kendi başına deneme</span></div><div className="parent-step"><CheckCircle2 size={17}/><span>Yanlışın nedenini anlama</span></div><div className="parent-step"><Clock3 size={17}/><span>Benzer soruyla pekiştirme</span></div></section><section className="surface parent-advice"><div className="plan-icon amber"><Lightbulb size={18}/></div><span className="eyebrow muted">EVDE DESTEK İÇİN</span><h3>“Bugün neyi farklı anladın?”</h3><p>Doğru sayısını sormak yerine, öğrendiği kuralı kendi cümleleriyle anlatmasını isteyin.</p><button className="button button-secondary" onClick={()=>{setRole('student');setView('progress')}}>Gelişim görünümünü aç <ArrowRight size={15}/></button></section></div>
  </div>;

  const renderCenter = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KÜBİK · KURUM GÖRÜNÜMÜ</span><h1>Eğitim sürecini görünür kılın.</h1><p>Bu demo, bireysel öğrenme döngüsünün kurum içindeki karşılığını gösterir. Gerçek kurum verisi içermez.</p></div></div>
    <div className="center-metrics"><section className="surface"><span className="metric-label">AKTİF DEMO ÖĞRENCİ</span><strong>01</strong><small>Sunum senaryosu · gerçek kayıt sayısı değil</small></section><section className="surface"><span className="metric-label">ÖĞRENME DÖNGÜSÜ</span><strong>{submitted?'3 / 3':'1 / 3'}</strong><small>{submitted?'Yanıt ve geri bildirim gösterildi.':'Yanıt bekleniyor; akış canlı denenebilir.'}</small></section><section className="surface"><span className="metric-label">AI BAĞLANTISI</span><strong>{health?.hasGeminiKey?'Hazır':'Kontrol gerekli'}</strong><small>API anahtarı sunucu tarafından kontrol edilir.</small></section></div>
    <section className="surface center-flow"><div className="surface-heading"><div><span className="eyebrow muted">ÜRÜNÜN TEMEL DÖNGÜSÜ</span><h3>Tek akış, dört rol</h3></div><span className="round-icon"><Activity size={18}/></span></div><div className="flow-steps"><div><span>01</span><BookOpen size={20}/><strong>Öğrenci çalışır</strong><p>Soru ve yanıt</p></div><ArrowRight/><div><span>02</span><BrainCircuit size={20}/><strong>Geri bildirim</strong><p>Hata nedeni ve ipucu</p></div><ArrowRight/><div><span>03</span><Users size={20}/><strong>Öğretmen görür</strong><p>Müdahale önerisi</p></div><ArrowRight/><div><span>04</span><Activity size={20}/><strong>İlerleme izlenir</strong><p>Ortak kayıt</p></div></div></section>
    <section className="surface center-next"><div><span className="eyebrow muted">ÜRÜN KEŞFİ İÇİN SONRAKİ ADIM</span><h3>Önce Kubik’in gerçek sürecini tanımlayalım.</h3><p>Öğrenci grupları, öğretmen iş akışı, mevcut dijital araçlar ve veli iletişimi sahipleriyle birlikte doğrulanmalı. Bu demo üretim sistemi veya gelir tahmini değildir.</p></div><button className="button button-primary" onClick={()=>setNotice('Keşif gündemi: öğrenci akışı, öğretmen müdahalesi, veli iletişimi ve ölçülebilir kazanımlar.')}>Keşif gündemini göster <ArrowRight size={15}/></button></section>
  </div>;

  return <div className="product-shell">
    <header className="topbar"><button className="brand" onClick={()=>{setRole('student');setView('today')}} aria-label="Kübik ana sayfa"><span className="brand-symbol"><span/><span/><span/><span/></span><span className="brand-word">kübik<span>+</span><small>ÖĞRENME ATÖLYESİ</small></span></button>
      <div className="topbar-center"><span className="demo-status"/><span>ÜRÜN DENEYİMİ</span><span className="topbar-separator">/</span><span>{role==='student'?'ÖĞRENCİ ROTASI':role==='teacher'?'ÖĞRETMEN MASASI':role==='parent'?'VELİ ÖZETİ':'KURUM PERSPEKTİFİ'}</span></div>
      <div className="topbar-actions"><div className="track-switch"><button className={track==='LGS'?'active':''} onClick={()=>changeTrack('LGS')}>LGS</button><button className={track==='YKS'?'active':''} onClick={()=>changeTrack('YKS')}>YKS</button></div><div className="user-chip"><span className="student-avatar">{student.initials}</span><span><strong>{student.name}</strong><small>{student.grade}</small></span><ChevronDown size={14}/></div></div>
    </header>
    <div className="app-frame"><aside className="sidebar"><div className="sidebar-label">ÇALIŞMA ALANI</div><div className="nav-list">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={'nav-item '+(role==='student'&&view===item.id?'active':'')} onClick={()=>{setRole('student');chooseView(item.id)}}><span className="nav-icon"><Icon size={18}/></span><span className="nav-text"><strong>{item.label}</strong><small>{item.hint}</small></span>{role==='student'&&view===item.id&&<span className="nav-active-dot"/>}</button>})}</div><div className="sidebar-divider"/><div className="sidebar-label">AYNI ÖĞRENME, FARKLI BAKIŞ</div><div className="role-list">{roles.filter(r=>r.id!=='student').map(r=><button key={r.id} className={'role-item '+(role===r.id?'active':'')} onClick={()=>setRole(r.id)}><span className="role-avatar">{r.id==='teacher'?<GraduationCap size={17}/>:r.id==='parent'?<Users size={17}/>:<Activity size={17}/>}</span><span>{r.label}</span><ChevronRight size={15}/></button>)}</div><div className="sidebar-bottom"><div className="privacy-mark"><ShieldCheck size={16}/><span><strong>Güvenilir öğrenme</strong><small>Demo · gerçek öğrenci hesabı değil</small></span></div><button className="help-link" onClick={()=>setNotice('Bu demo, Kubik ile birlikte doğrulanacak bir ürün fikridir; üretim sistemi değildir.')}>Bu demo hakkında <CircleHelp size={14}/></button></div></aside>
      <main className="main-area"><div className="mobile-track-note"><span className="live-dot"/> {student.goal} <span>· Demo profili</span></div>{notice&&<div className="notice-bar"><Lightbulb size={16}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Bildirimi kapat"><X size={15}/></button></div>}
        {role==='student'?renderStudent():role==='teacher'?renderTeacher():role==='parent'?renderParent():renderCenter()}
        <footer className="app-footer"><span>kübik+ <i>·</i> Öğrenme atölyesi</span><span><ShieldCheck size={13}/> Demo içerikleri açıkça etiketlenmiştir</span></footer>
      </main>
    </div>
  </div>;
}

export default App;
)
    .replace(/\\\\\\[/g, () => '$')
    .replace(/\\\\\\]/g, () => '$');
  return <div className="tutor-rich-text"><ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{normalized}</ReactMarkdown></div>;
}

type Track = 'LGS' | 'YKS';
type Role = 'student' | 'teacher' | 'parent' | 'center';
type View = 'today' | 'practice' | 'coach' | 'progress';
type ChatItem = { role: 'user' | 'assistant'; text: string };
type AnswerResult = { correct: boolean; explanation: string; misconception?: string; repeated?: boolean; unverified?: boolean };
type Option = { id: string; text: string };
type Question = {
  id: string; track: Track; topic: string; prompt: string; options: Option[];
  source: string; sourceUrl?: string; verified: boolean; hints?: string[];
};
const students: Record<Track, { id: string; name: string; grade: string; goal: string; initials: string }> = {
  LGS: { id: 'std_lgs_801', name: 'Kerem Demir', grade: '8. sınıf', goal: 'LGS · Matematik', initials: 'KD' },
  YKS: { id: 'std_yks_1101', name: 'Selin Yılmaz', grade: '11. sınıf', goal: 'YKS · Matematik', initials: 'SY' }
};
const roles: { id: Role; label: string }[] = [
  { id: 'student', label: 'Öğrenci' }, { id: 'teacher', label: 'Öğretmen' },
  { id: 'parent', label: 'Veli' }, { id: 'center', label: 'Kurum' }
];
const demoRetry: Question = {
  id: 'demo-retry-uslu-01', track: 'LGS', topic: 'Üslü ifadeler · pekiştirme',
  prompt: 'Bir sayının 2⁵ katı 2⁹ ise bu sayı kaçtır?',
  options: [{id:'A',text:'2³'}, {id:'B',text:'2⁴'}, {id:'C',text:'2⁵'}, {id:'D',text:'2¹⁴'}],
  source: 'Kübik demo için hazırlanmış pekiştirme sorusu · resmî sınav sorusu değildir',
  verified: false
};
const demoYks: Question = {
  id: 'demo-yks-function-01', track: 'YKS', topic: 'Fonksiyonlar',
  prompt: 'f(x) = 3x − 2 olduğuna göre f(4) kaçtır?',
  options: [{id:'A',text:'8'}, {id:'B',text:'10'}, {id:'C',text:'12'}, {id:'D',text:'14'}],
  source: 'Kübik demo için hazırlanmış örnek · resmî YKS sorusu değildir',
  verified: false
};
const localAnswer: Record<string, { key: string; explanation: string; misconception: Record<string,string> }> = {
  'demo-retry-uslu-01': {
    key:'B', explanation:'2⁵ ile çarpıldığında 2⁹ elde ediliyorsa, aynı tabanlı üsleri bölme işleminde çıkarırız: 2⁹ ÷ 2⁵ = 2⁴.',
    misconception:{A:'Üsleri çıkarırken 9 − 5 işlemini yeniden kontrol et. Sonuç 4 olmalı.',C:'2⁵ sayının kendisi değil, onu çarptığımız katsayı. Bilinmeyeni bulmak için bölmeliyiz.',D:'Çarpma kuralını kullanmış olabilirsin; bilinmeyeni yalnız bırakmak için bölme yap.'}
  },
  'demo-yks-function-01': {
    key:'B', explanation:'f(4) demek, x yerine 4 yazmak demektir: 3 × 4 − 2 = 12 − 2 = 10.',
    misconception:{A:'3 × 4 = 12 adımından sonra 2 çıkarma adımını da yapmalısın.',C:'12 yalnızca 3 × 4 işleminin sonucu. Sonra 2 çıkarılır.',D:'İşlemde +2 yok; verilen ifade 3x − 2.'}
  }
};

function App() {
  const [track, setTrack] = useState<Track>('LGS');
  const [role, setRole] = useState<Role>('student');
  const [view, setView] = useState<View>('today');
  const [officialQuestion, setOfficialQuestion] = useState<Question | null>(null);
  const [questionLoading, setQuestionLoading] = useState(true);
  const [question, setQuestion] = useState<Question | null>(null);
  const [retryMode, setRetryMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatItem[]>([{role:'assistant',text:'Merhaba! Nerede takıldığını birlikte bulalım. İstersen sorudaki bir adımı yazabilir ya da aşağıdaki kısa sorulardan biriyle başlayabilirsin.'}]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState<{hasGeminiKey:boolean} | null>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const student = students[track];

  useEffect(() => {
    fetch('/api/health').then(r=>r.json()).then(setHealth).catch(()=>setHealth(null));
  }, []);

  useEffect(() => {
    let alive = true;
    setQuestionLoading(true);
    setQuestion(null);
    setSelected(null); setSubmitted(false); setAnswerResult(null); setRetryMode(false);
    setChat([{role:'assistant',text:track === 'LGS'
      ? 'Bu soruyu hemen çözmek zorunda değilsin. Önce hangi kuralın gerektiğini bulalım; sonra birlikte adım adım ilerleriz.'
      : 'Fonksiyon sorularında ilk küçük adım, x yerine verilen sayıyı yazmaktır. İstersen bunu bir örnek üzerinde deneyelim.'}]);
    const load = async () => {
      try {
        const response = await fetch('/api/content/verified-question?studentId=' + student.id);
        const data = await response.json();
        if (!alive) return;
        if (track === 'LGS' && data.available && data.question) {
          const q = data.question;
          const mapped: Question = {
            id:q.id, track:'LGS', topic:q.topic, prompt:q.questionText,
            options:q.options.map((o:Option)=>({id:o.id,text:o.text})),
            source:q.sourceDocument, sourceUrl:q.sourceUrl,
            verified:q.verificationStatus === 'verified_official_publication',
            hints:q.pedagogicalHints
          };
          setOfficialQuestion(mapped); setQuestion(mapped);
        } else {
          setOfficialQuestion(null);
          setQuestion(track === 'LGS' ? demoRetry : demoYks);
        }
      } catch {
        if (!alive) return;
        setQuestion(track === 'LGS' ? demoRetry : demoYks);
        setNotice('Sunucuya ulaşılamadı. Şu an yalnızca yerel demo örneği gösteriliyor.');
      } finally {
        if (alive) { setQuestionLoading(false); loadProgress(); }
      }
    };
    const loadProgress = async () => {
      try {
        const r = await fetch('/api/student/progress?studentId=' + student.id);
        const d = await r.json();
        if (alive && r.ok && typeof d.progress?.currentMastery === 'number') setProgress(d.progress.currentMastery);
        else if (alive) setProgress(null);
      } catch { if (alive) setProgress(null); }
    };
    void load();
    return () => { alive = false; };
  }, [track, student.id]);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth',block:'end'}); }, [chat,chatLoading]);

  const mastery = progress ?? (track === 'LGS' ? 52 : 38);
  const nav: {id:View; label:string; hint:string; icon:typeof House}[] = [
    {id:'today',label:'Bugünüm',hint:'Günlük rota',icon:House},
    {id:'practice',label:'Soru atölyesi',hint:'Çöz ve öğren',icon:NotebookPen},
    {id:'coach',label:'AI çalışma arkadaşı',hint:'Takıldığın yerde',icon:MessageCircle},
    {id:'progress',label:'Gelişimim',hint:'Neler değişiyor?',icon:Activity}
  ];
  const changeTrack = (next:Track) => { setTrack(next); setRole('student'); setView('today'); setNotice(''); };
  const chooseView = (next:View) => { setView(next); setNotice(''); };

  const submitAnswer = async () => {
    if (!question || !selected || submitted) return;
    setSubmitted(true);
    const local = localAnswer[question.id];
    let correct = false;
    let explanation = '';
    let misconception = '';
    let repeated = false;
    if (question.verified && track === 'LGS') {
      try {
        const r = await fetch('/api/student/answer', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body:JSON.stringify({
            studentId:student.id, topicId:'top_lgs_uslu', questionId:question.id,
            chosenOptionId:selected, hintsUsedCount:0, aiTutorInteractionsCount:chat.filter(x=>x.role==='user').length
          })
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Yanıt kaydedilemedi.');
        correct = Boolean(d.isCorrect); repeated = Boolean(d.isRepeatedAttempt);
        explanation = d.officialSolution?.summary || d.explanation || 'Yanıt değerlendirildi.';
        const selectedIndex = question.options.findIndex(o=>o.id===selected);
        const hintIndex = selectedIndex === 0 ? 0 : Math.max(0, selectedIndex - 1);
        misconception = correct ? '' : (question.hints?.[hintIndex] || 'Önce ifadeleri aynı tabana çevirip üs kurallarını adım adım uygulayalım.');
        if (typeof d.updatedMastery?.currentMastery === 'number') setProgress(d.updatedMastery.currentMastery);
      } catch {
        setAnswerResult({
          correct: false,
          unverified: true,
          explanation: 'Sunucuya ulaşılamadığı için bu yanıt doğrulanamadı. Cevap anahtarını tahmin etmeyeceğiz ve ilerleme kaydı oluşturulmadı.',
          misconception: ''
        });
        return;
      }
    } else if (local) {
      correct = selected === local.key;
      explanation = local.explanation;
      misconception = correct ? '' : (local.misconception[selected] || 'İşlem adımlarını birer birer kontrol edelim.');
    } else {
      explanation = 'Bu örnek için cevap anahtarı doğrulanmadı. Öğretmenle birlikte kontrol etmek üzere işaretlendi.';
    }
    setAnswerResult({correct, explanation, misconception, repeated});
    if (!correct) setNotice('Hata bir sonuç değil, nereden devam edeceğimizi gösteren ipucu.');
  };

  const startRetry = () => {
    setQuestion(track === 'LGS' ? demoRetry : demoYks);
    setRetryMode(true); setSelected(null); setSubmitted(false); setAnswerResult(null);
    setView('practice'); setRole('student');
    setNotice('Pekiştirme sorusu açıldı. Bu soru demo için hazırlandı; resmî sınav sorusu değildir.');
  };

  const sendChat = async (message?:string) => {
    const text = (message ?? chatInput).trim();
    if (!text || chatLoading) return;
    setChatInput('');
    setChatError('');
    const next = [...chat,{role:'user' as const,text}];
    setChat(next); setChatLoading(true);
    try {
      const response = await fetch('/api/tutor/chat', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          studentId:student.id,
          userMessage:text,
          chatHistory:next.slice(-8).map(m=>({role:m.role,content:m.text}))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'AI yanıtı alınamadı.');
      setChat(old=>[...old,{role:'assistant',text:data.reply}]);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Bağlantı kurulamadı.';
      setChatError(messageText);
      const safeFallback = track === 'LGS'
        ? 'Şu anda canlı AI yanıtı alamadım. Yine de şu ilk adımı birlikte yapabiliriz: 8⁴ ifadesini 2 tabanında yaz. Çünkü 8 = 2³. Sonra üslerin üssü kuralını uygula. Bu, otomatik AI yanıtı değil; demo içindeki sabit ipucudur.'
        : 'Canlı AI yanıtı alınamadı. Fonksiyonlarda x yerine verilen sayıyı koyup işlem sırasıyla ilerleriz. Bu parkurda resmî soru içeriği henüz doğrulanmadı; bu yüzden örneği resmî soru diye sunmayacağım.';
      setChat(old=>[...old,{role:'assistant',text:safeFallback}]);
    } finally { setChatLoading(false); }
  };

  const resetPractice = () => {
    if (track === 'LGS' && officialQuestion) { setQuestion(officialQuestion); setRetryMode(false); }
    else { setQuestion(track === 'LGS' ? demoRetry : demoYks); setRetryMode(true); }
    setSelected(null); setSubmitted(false); setAnswerResult(null); setNotice('');
  };

  const renderStudent = () => {
    if (view === 'coach') return Coach();
    if (view === 'progress') return ProgressView();
    if (view === 'practice') return PracticeView();
    return TodayView();
  };

  function TodayView() {
    return <div className="page-stack">
      <section className="welcome-band">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="live-dot" /> BUGÜNÜN ÖĞRENME ROTASI</div>
          <h1>Selam {student.name.split(' ')[0]},<br/><span>küçük adımlar büyütür.</span></h1>
          <p>Bugün her şeyi bitirmek zorunda değilsin. Bir konuyu gerçekten anlamak yeterli.</p>
          <button className="button button-light" onClick={()=>chooseView('practice')}>İlk çalışmaya başla <ArrowRight size={16}/></button>
        </div>
        <div className="route-art" aria-hidden="true">
          <div className="orbit orbit-one"></div><div className="orbit orbit-two"></div>
          <div className="orbit-core"><BrainCircuit size={38}/></div>
          <div className="orbit-tag tag-one"><Target size={15}/> 1 konu</div>
          <div className="orbit-tag tag-two"><CheckCircle2 size={15}/> 1 adım</div>
        </div>
      </section>
      <div className="section-heading"><div><span className="eyebrow muted">BUGÜN SANA ÖZEL</span><h2>Çalışma planın</h2></div><span className="quiet-pill"><CalendarDays size={14}/> Bugün · 20 dk</span></div>
      <section className="plan-grid">
        <button className="plan-card plan-main" onClick={()=>chooseView('practice')}>
          <div className="plan-icon indigo"><NotebookPen size={20}/></div><div className="plan-meta"><span>01 · MATEMATİK</span><span className="duration"><Clock3 size={13}/> 10 dk</span></div>
          <h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3><p>{track==='LGS'?'Üs kurallarını bir problemde kullan.':'Fonksiyon değerini adım adım hesapla.'}</p>
          <div className="plan-bottom"><span>Çalışmaya geç</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('coach')}>
          <div className="plan-icon mint"><MessageCircle size={20}/></div><div className="plan-meta"><span>02 · ANLAMA</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Takıldığın yeri sor</h3><p>Bir adımı anlamadıysan AI çalışma arkadaşıyla birlikte aç.</p>
          <div className="plan-bottom"><span>Soru sor</span><ArrowRight size={16}/></div>
        </button>
        <button className="plan-card" onClick={()=>chooseView('progress')}>
          <div className="plan-icon amber"><Activity size={20}/></div><div className="plan-meta"><span>03 · GERİ BAKIŞ</span><span className="duration"><Clock3 size={13}/> 5 dk</span></div>
          <h3>Ne öğrendin?</h3><p>Yanıtlarını ve sıradaki küçük adımını gözden geçir.</p>
          <div className="plan-bottom"><span>Gelişimi gör</span><ArrowRight size={16}/></div>
        </button>
      </section>
      <div className="lower-grid">
        <section className="surface focus-panel"><div className="surface-heading"><div><span className="eyebrow muted">BU HAFTAKİ ODAĞIN</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="round-icon"><Target size={18}/></span></div>
          <p className="body-copy">Amaç sadece doğru cevabı bulmak değil; hangi kuralı neden kullandığını anlatabilmek.</p>
          <div className="mastery-line"><div><span>Örnek ilerleme göstergesi</span><strong>{mastery}%</strong></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Bu gösterge başlangıç demo değeridir; gerçek öğrenci başarısı değildir.':'Bu demo oturumunda sunucuya kaydedilen konu ilerlemesi.'}</small></div>
        </section>
        <section className="surface note-panel"><div className="note-icon"><Lightbulb size={20}/></div><span className="eyebrow muted">KÜÇÜK HATIRLATMA</span><h3>Hata yapmak, öğrenmenin bir parçası.</h3><p>Yanlış cevapta sadece sonucu değil, düşünme adımını da inceliyoruz.</p><button className="text-button" onClick={()=>chooseView('practice')}>Bir soruda dene <ArrowRight size={15}/></button></section>
      </div>
    </div>;
  }

  function PracticeView() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME ATÖLYESİ / MATEMATİK</span><h1>Çöz. Anla. Bir daha dene.</h1><p>Yanıtından sonra sadece doğru/yanlış değil, düşünme adımına dair geri bildirim alırsın.</p></div><span className="quiet-pill"><ShieldCheck size={14}/>{question?.verified?'Kaynağı doğrulanmış':'Demo örneği'}</span></div>
      {questionLoading || !question ? <div className="surface loading-surface"><div className="spinner"/><p>Soru hazırlanıyor…</p></div> :
      <div className="practice-layout">
        <section className="surface question-panel">
          <div className="question-top"><div className="topic-chip"><BookOpen size={14}/>{question.topic}</div><span className="question-count">{retryMode?'PEKİŞTİRME':'SORU 01'} / MATEMATİK</span></div>
          <h2>{question.prompt}</h2>
          <div className="option-list">{question.options.map((option,index)=><button key={option.id} disabled={submitted} className={'answer-option '+(selected===option.id?'selected ':'')+(submitted && answerResult && !answerResult.unverified && option.id=== (question.verified?'B':localAnswer[question.id]?.key)?'answer-correct ':'')+(submitted && selected===option.id && answerResult && !answerResult.correct && !answerResult.unverified?'answer-wrong':'')} onClick={()=>setSelected(option.id)}><span className="option-letter">{String.fromCharCode(65+index)}</span><span>{option.text.replace(/^[A-D]\)\s*/,'')}</span>{selected===option.id&&<span className="option-check"><Check size={15}/></span>}</button>)}</div>
          {!submitted ? <div className="question-actions"><span className="helper-text"><CircleHelp size={14}/> Takılırsan AI çalışma arkadaşına sorabilirsin.</span><button className="button button-primary" disabled={!selected} onClick={submitAnswer}>Yanıtımı kontrol et <ArrowRight size={16}/></button></div> :
          <div className={'feedback-panel '+(answerResult?.correct?'feedback-good':'feedback-try')}><div className="feedback-title">{answerResult?.correct?<CheckCircle2 size={19}/>:<Lightbulb size={19}/>}<div><strong>{answerResult?.unverified?'Yanıt henüz doğrulanamadı.':answerResult?.correct?'Evet, doğru düşünüyorsun.':'Burada bir düşünme adımını yeniden inceleyelim.'}</strong><span>{answerResult?.unverified?'Bağlantı geri geldiğinde yeniden deneyebilirsin.':answerResult?.correct?'Kuralı doğru uyguladın.':'Yanlış cevap bir ipucu; birlikte nerede ayrıldığını bulalım.'}</span></div></div>
            <p>{answerResult?.correct?answerResult.explanation:(answerResult?.misconception||answerResult?.explanation)}</p>
            {answerResult?.repeated&&<small>Bu soru daha önce kaydedilmiş. Tekrar çözüm yeni ilerleme olarak sayılmadı.</small>}
            <div className="feedback-actions"><button className="button button-primary" onClick={()=>{setView('coach');setChatInput('Bu soruda '+(answerResult?.correct?'hangi kuralı kullandığımı':'hangi adımda hata yapmış olabileceğimi')+' adım adım anlatır mısın?')}}><MessageCircle size={15}/> Birlikte incele</button><button className="button button-secondary" onClick={startRetry}>Benzer soru çöz <ArrowRight size={15}/></button></div>
          </div>}
          <div className="source-strip"><ShieldCheck size={15}/><div><strong>{question.verified?'Resmî kaynak bilgisi':'Örnek içerik'}</strong><span>{question.source}</span></div>{question.sourceUrl&&<a href={question.sourceUrl} target="_blank" rel="noreferrer">Kaynağı aç <ArrowUpRight size={13}/></a>}</div>
        </section>
        <aside className="practice-aside">
          <section className="surface aside-card"><div className="aside-heading"><span className="plan-icon mint"><BrainCircuit size={18}/></span><span className="eyebrow muted">ÖĞRENME YÖNTEMİ</span></div><h3>Sonucu değil, düşünme yolunu bul.</h3><ol className="step-list"><li className={submitted?'complete':''}><span>1</span><div><strong>Önce kendin dene</strong><small>İlk düşünceni seç.</small></div></li><li className={answerResult?'complete':''}><span>2</span><div><strong>Geri bildirimi incele</strong><small>Hangi adımın önemli olduğunu gör.</small></div></li><li><span>3</span><div><strong>Benzer soruda uygula</strong><small>Öğrenmeyi tekrar dene.</small></div></li></ol></section>
          <section className="surface aside-card ai-nudge"><span className="eyebrow muted">YARDIMA MI İHTİYACIN VAR?</span><p>“Neden bu işlemi yaptık?” diye sorabilirsin.</p><button className="text-button" onClick={()=>chooseView('coach')}>AI çalışma arkadaşına git <ArrowRight size={15}/></button></section>
        </aside>
      </div>}
    </div>;
  }

  function Coach() {
    return <div className="page-stack">
      <div className="page-intro"><div><span className="eyebrow muted">ÖĞRENME DESTEĞİ</span><h1>AI çalışma arkadaşın.</h1><p>Sana cevabı hemen vermek yerine düşünme adımlarını açmana yardım eder.</p></div><span className={'connection-pill '+(health?.hasGeminiKey?'connected':'not-connected')}><span/>{health?.hasGeminiKey?'Gemini bağlantısı hazır':health===null?'Bağlantı durumu bilinmiyor':'API anahtarı algılanmadı'}</span></div>
      <div className="coach-layout">
        <section className="surface chat-panel">
          <div className="chat-head"><div className="coach-avatar"><Sparkles size={20}/></div><div><strong>Kübik Öğrenme Rehberi</strong><span><span className="live-dot"/> Matematik · {student.grade}</span></div><span className="chat-safe"><ShieldCheck size={14}/> Öğrenme odaklı</span></div>
          <div className="chat-messages">{chat.map((item,i)=><div key={i} className={'message-row '+(item.role==='user'?'message-user':'')}><div className="message-avatar">{item.role==='user'?student.initials:<Sparkles size={15}/>}</div><div className="message-bubble"><span className="message-author">{item.role==='user'?'Sen':'Öğrenme rehberi'}</span><p>{item.text}</p></div></div>)}{chatLoading&&<div className="message-row"><div className="message-avatar"><Sparkles size={15}/></div><div className="message-bubble typing"><span/><span/><span/></div></div>}<div ref={chatEnd}/></div>
          {chatError&&<div className="chat-error"><CircleHelp size={14}/>{chatError} <span>Gösterilen sabit ipucu canlı AI yanıtı değildir.</span></div>}
          <div className="suggestion-row"><button onClick={()=>void sendChat(track==='LGS'?'Üslerin üssü kuralını basit bir örnekle açıklar mısın?':'Fonksiyonlarda x yerine değer yazmak ne demek?')}>{track==='LGS'?'Üslerin üssü kuralı':'Fonksiyon nedir?'}</button><button onClick={()=>void sendChat('Bana cevabı söylemeden bir ipucu verir misin?')}>Bir ipucu ver</button><button onClick={()=>void sendChat('Küçük bir örnek üzerinden anlatır mısın?')}>Örnekle anlat</button></div>
          <form className="chat-composer" onSubmit={e=>{e.preventDefault();void sendChat();}}><input value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Takıldığın adımı buraya yaz…" aria-label="AI çalışma arkadaşına mesaj"/><button className="send-button" type="submit" disabled={!chatInput.trim()||chatLoading} aria-label="Mesajı gönder"><Send size={17}/></button></form>
          <p className="chat-disclaimer">AI yanıtları hata içerebilir. Önemli akademik kararlar için öğretmeninle kontrol et.</p>
        </section>
        <aside className="surface coach-context"><span className="eyebrow muted">ÇALIŞMA BAĞLAMI</span><h3>Bugünkü konun</h3><div className="context-topic"><div className="plan-icon indigo"><BookOpen size={18}/></div><div><strong>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</strong><span>Matematik · {student.grade}</span></div></div><div className="context-divider"/><span className="eyebrow muted">İSTERSEN ŞUNU SOR</span><button className="prompt-card" onClick={()=>setChatInput('Bu konuyu 3 kısa adımda anlatır mısın?')}>Bu konuyu 3 kısa adımda anlat <ArrowRight size={15}/></button><button className="prompt-card" onClick={()=>setChatInput('Yanlış cevabım hangi düşünce hatasından kaynaklanmış olabilir?')}>Yanlışım ne anlatıyor olabilir? <ArrowRight size={15}/></button><div className="teacher-note"><Lightbulb size={16}/><p>Bir soruda uzun süre takılırsan, öğretmeninden destek istemek de iyi bir öğrenme adımıdır.</p></div></aside>
      </div>
    </div>;
  }

  function ProgressView() {
    return <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KENDİ GELİŞİMİNİ İZLE</span><h1>Her doğru adım bir iz bırakır.</h1><p>Bu görünüm, demo oturumunda kaydedilen yanıtları ve sıradaki çalışma önerisini bir araya getirir.</p></div></div>
      <div className="progress-overview"><section className="surface mastery-card"><span className="eyebrow muted">KONU İLERLEMESİ</span><div className="mastery-number">{mastery}<small>%</small></div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><p>{progress===null?'Başlangıç göstergesi · gerçek öğrenci verisi değildir.':'Sunucu tarafında kayıtlı demo konu ilerlemesi.'}</p></section><section className="surface next-step-card"><div className="plan-icon amber"><Target size={19}/></div><span className="eyebrow muted">ÖNERİLEN SONRAKİ ADIM</span><h3>{answerResult&&!answerResult.correct?'Bu adımı yeniden çalış':'Benzer bir soruda kuralı uygula'}</h3><p>{answerResult&&!answerResult.correct?'Yanlış seçeneğin hangi düşünceyi işaret ettiğini AI çalışma arkadaşıyla incele.':'Aynı kazanımı farklı bir örnekte kullanarak gerçekten anladığını kontrol et.'}</p><button className="button button-primary" onClick={startRetry}>Bir soru daha çöz <ArrowRight size={15}/></button></section></div>
      <section className="surface reflection-card"><div className="surface-heading"><div><span className="eyebrow muted">KISA ÖZ DEĞERLENDİRME</span><h3>Bugün kendine sor</h3></div><span className="round-icon"><Lightbulb size={18}/></span></div><div className="reflection-list"><div><span>01</span><p>Hangi kuralı kullandım, neden?</p><button onClick={()=>{setView('coach');setChatInput('Bugünkü soruda hangi kuralı neden kullandığımı anlamama yardım et.')}}>Birlikte düşün <ArrowRight size={14}/></button></div><div><span>02</span><p>Benzer bir soruda tek başıma deneyebilir miyim?</p><button onClick={startRetry}>Kendimi dene <ArrowRight size={14}/></button></div><div><span>03</span><p>Hangi adım için öğretmen desteğine ihtiyacım var?</p><button onClick={()=>setNotice('Öğretmen görünümünde bu konu için destek notu gösteriliyor.')}>Not al <ArrowRight size={14}/></button></div></div></section>
    </div>;
  }

  const renderTeacher = () => <div className="page-stack">
    <div className="page-intro"><div><span className="eyebrow muted">ÖĞRETMEN ÇALIŞMA ALANI</span><h1>Öğrencinin takıldığı yeri görün.</h1><p>Öğrenme verisini bir sonraki öğretmen müdahalesine dönüştüren sade görünüm.</p></div><span className="quiet-pill"><Users size={14}/> Demo öğrenci: {student.name}</span></div>
    <section className="teacher-student-banner"><div className="student-avatar large">{student.initials}</div><div className="teacher-student-copy"><span className="eyebrow">ÖĞRENCİ KARTI · DEMO</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><button className="button button-light" onClick={()=>{setRole('student');setView('practice')}}>Öğrenci akışını aç <ArrowRight size={15}/></button></section>
    <div className="teacher-grid"><section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">KONU DURUMU</span><h3>{track==='LGS'?'Üslü ifadeler':'Fonksiyonlar'}</h3></div><span className="topic-chip"><Activity size={14}/> {progress===null?'Demo': 'Kayıtlı'}</span></div><div className="teacher-mastery"><strong>{mastery}%</strong><div><div className="progress-track"><span style={{width:mastery+'%'}}/></div><small>{progress===null?'Başlangıç örneği; henüz kayıtlı sonuç yok.':'Öğrenci oturumunda kaydedilen konu göstergesi.'}</small></div></div><div className="signal-row"><div className="signal-icon amber"><Lightbulb size={17}/></div><div><strong>Öğretmen için olası müdahale</strong><p>{answerResult&&!answerResult.correct?'Üs kurallarında aynı tabana çevirme adımını kısa bir örnekle tekrar edin.':'Öğrenciden kullandığı kuralı kendi cümleleriyle açıklamasını isteyin.'}</p></div></div></section>
    <section className="surface teacher-data"><div className="surface-heading"><div><span className="eyebrow muted">OTURUM ÖZETİ</span><h3>Bu çalışmada</h3></div><span className="round-icon"><NotebookPen size={17}/></span></div><div className="session-stat"><span>Yanıt durumu</span><strong>{submitted?(answerResult?.correct?'Doğru':'Tekrar gerekli'):'Henüz yanıtlanmadı'}</strong></div><div className="session-stat"><span>AI destek etkileşimi</span><strong>{chat.filter(x=>x.role==='user').length} mesaj</strong></div><div className="session-stat"><span>İçerik kaynağı</span><strong>{question?.verified?'MEB · doğrulanmış':'Demo örneği'}</strong></div><button className="button button-secondary full-button" onClick={()=>{setRole('student');setView('coach')}}>Öğrenciyle aynı konuyu incele <ArrowRight size={15}/></button></section></div>
    <section className="surface teacher-next"><div className="plan-icon mint"><MessageCircle size={18}/></div><div><span className="eyebrow muted">ÖNERİLEN ÖĞRETMEN NOTU</span><h3>“Sonucu nasıl bulduğunu anlatır mısın?”</h3><p>Öğrencinin yalnızca doğru cevabı değil, kullandığı düşünme yolunu da açıklamasını isteyin.</p></div><button className="text-button" onClick={()=>setNotice('Öğretmen notu bu demo oturumu için seçildi.')}>Notu seç <Check size={15}/></button></section>
  </div>;

  const renderParent = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">VELİ GÖRÜNÜMÜ</span><h1>Gelişimi anlaşılır şekilde takip edin.</h1><p>Notlardan çok, çalışma rutini ve bir sonraki destek adımına odaklanın.</p></div></div>
    <section className="parent-summary surface"><div className="student-avatar large">{student.initials}</div><div className="parent-child"><span className="eyebrow muted">ÖĞRENCİ</span><h2>{student.name}</h2><p>{student.grade} · {student.goal}</p></div><div className="parent-progress"><span>Konu ilerleme göstergesi</span><strong>{mastery}%</strong><div className="progress-track"><span style={{width:mastery+'%'}}/></div></div></section>
    <div className="parent-grid"><section className="surface"><span className="eyebrow muted">BU OTURUMDA</span><h3>{submitted?'Bir soru üzerinde çalıştı':'Çalışma sırasındaki adım'}</h3><p>{submitted?'Yanıt sonrası açıklama ve tekrar önerisi sunuldu.':'Bir soruyu kendi başına denemesi ve ardından açıklamayı incelemesi planlandı.'}</p><div className="parent-step"><CheckCircle2 size={17}/><span>Önce kendi başına deneme</span></div><div className="parent-step"><CheckCircle2 size={17}/><span>Yanlışın nedenini anlama</span></div><div className="parent-step"><Clock3 size={17}/><span>Benzer soruyla pekiştirme</span></div></section><section className="surface parent-advice"><div className="plan-icon amber"><Lightbulb size={18}/></div><span className="eyebrow muted">EVDE DESTEK İÇİN</span><h3>“Bugün neyi farklı anladın?”</h3><p>Doğru sayısını sormak yerine, öğrendiği kuralı kendi cümleleriyle anlatmasını isteyin.</p><button className="button button-secondary" onClick={()=>{setRole('student');setView('progress')}}>Gelişim görünümünü aç <ArrowRight size={15}/></button></section></div>
  </div>;

  const renderCenter = () => <div className="page-stack"><div className="page-intro"><div><span className="eyebrow muted">KÜBİK · KURUM GÖRÜNÜMÜ</span><h1>Eğitim sürecini görünür kılın.</h1><p>Bu demo, bireysel öğrenme döngüsünün kurum içindeki karşılığını gösterir. Gerçek kurum verisi içermez.</p></div></div>
    <div className="center-metrics"><section className="surface"><span className="metric-label">AKTİF DEMO ÖĞRENCİ</span><strong>01</strong><small>Sunum senaryosu · gerçek kayıt sayısı değil</small></section><section className="surface"><span className="metric-label">ÖĞRENME DÖNGÜSÜ</span><strong>{submitted?'3 / 3':'1 / 3'}</strong><small>{submitted?'Yanıt ve geri bildirim gösterildi.':'Yanıt bekleniyor; akış canlı denenebilir.'}</small></section><section className="surface"><span className="metric-label">AI BAĞLANTISI</span><strong>{health?.hasGeminiKey?'Hazır':'Kontrol gerekli'}</strong><small>API anahtarı sunucu tarafından kontrol edilir.</small></section></div>
    <section className="surface center-flow"><div className="surface-heading"><div><span className="eyebrow muted">ÜRÜNÜN TEMEL DÖNGÜSÜ</span><h3>Tek akış, dört rol</h3></div><span className="round-icon"><Activity size={18}/></span></div><div className="flow-steps"><div><span>01</span><BookOpen size={20}/><strong>Öğrenci çalışır</strong><p>Soru ve yanıt</p></div><ArrowRight/><div><span>02</span><BrainCircuit size={20}/><strong>Geri bildirim</strong><p>Hata nedeni ve ipucu</p></div><ArrowRight/><div><span>03</span><Users size={20}/><strong>Öğretmen görür</strong><p>Müdahale önerisi</p></div><ArrowRight/><div><span>04</span><Activity size={20}/><strong>İlerleme izlenir</strong><p>Ortak kayıt</p></div></div></section>
    <section className="surface center-next"><div><span className="eyebrow muted">ÜRÜN KEŞFİ İÇİN SONRAKİ ADIM</span><h3>Önce Kubik’in gerçek sürecini tanımlayalım.</h3><p>Öğrenci grupları, öğretmen iş akışı, mevcut dijital araçlar ve veli iletişimi sahipleriyle birlikte doğrulanmalı. Bu demo üretim sistemi veya gelir tahmini değildir.</p></div><button className="button button-primary" onClick={()=>setNotice('Keşif gündemi: öğrenci akışı, öğretmen müdahalesi, veli iletişimi ve ölçülebilir kazanımlar.')}>Keşif gündemini göster <ArrowRight size={15}/></button></section>
  </div>;

  return <div className="product-shell">
    <header className="topbar"><button className="brand" onClick={()=>{setRole('student');setView('today')}} aria-label="Kübik ana sayfa"><span className="brand-symbol"><span/><span/><span/><span/></span><span className="brand-word">kübik<span>+</span><small>ÖĞRENME ATÖLYESİ</small></span></button>
      <div className="topbar-center"><span className="demo-status"/><span>ÜRÜN DENEYİMİ</span><span className="topbar-separator">/</span><span>{role==='student'?'ÖĞRENCİ ROTASI':role==='teacher'?'ÖĞRETMEN MASASI':role==='parent'?'VELİ ÖZETİ':'KURUM PERSPEKTİFİ'}</span></div>
      <div className="topbar-actions"><div className="track-switch"><button className={track==='LGS'?'active':''} onClick={()=>changeTrack('LGS')}>LGS</button><button className={track==='YKS'?'active':''} onClick={()=>changeTrack('YKS')}>YKS</button></div><div className="user-chip"><span className="student-avatar">{student.initials}</span><span><strong>{student.name}</strong><small>{student.grade}</small></span><ChevronDown size={14}/></div></div>
    </header>
    <div className="app-frame"><aside className="sidebar"><div className="sidebar-label">ÇALIŞMA ALANI</div><div className="nav-list">{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={'nav-item '+(role==='student'&&view===item.id?'active':'')} onClick={()=>{setRole('student');chooseView(item.id)}}><span className="nav-icon"><Icon size={18}/></span><span className="nav-text"><strong>{item.label}</strong><small>{item.hint}</small></span>{role==='student'&&view===item.id&&<span className="nav-active-dot"/>}</button>})}</div><div className="sidebar-divider"/><div className="sidebar-label">AYNI ÖĞRENME, FARKLI BAKIŞ</div><div className="role-list">{roles.filter(r=>r.id!=='student').map(r=><button key={r.id} className={'role-item '+(role===r.id?'active':'')} onClick={()=>setRole(r.id)}><span className="role-avatar">{r.id==='teacher'?<GraduationCap size={17}/>:r.id==='parent'?<Users size={17}/>:<Activity size={17}/>}</span><span>{r.label}</span><ChevronRight size={15}/></button>)}</div><div className="sidebar-bottom"><div className="privacy-mark"><ShieldCheck size={16}/><span><strong>Güvenilir öğrenme</strong><small>Demo · gerçek öğrenci hesabı değil</small></span></div><button className="help-link" onClick={()=>setNotice('Bu demo, Kubik ile birlikte doğrulanacak bir ürün fikridir; üretim sistemi değildir.')}>Bu demo hakkında <CircleHelp size={14}/></button></div></aside>
      <main className="main-area"><div className="mobile-track-note"><span className="live-dot"/> {student.goal} <span>· Demo profili</span></div>{notice&&<div className="notice-bar"><Lightbulb size={16}/><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Bildirimi kapat"><X size={15}/></button></div>}
        {role==='student'?renderStudent():role==='teacher'?renderTeacher():role==='parent'?renderParent():renderCenter()}
        <footer className="app-footer"><span>kübik+ <i>·</i> Öğrenme atölyesi</span><span><ShieldCheck size={13}/> Demo içerikleri açıkça etiketlenmiştir</span></footer>
      </main>
    </div>
  </div>;
}

export default App;
