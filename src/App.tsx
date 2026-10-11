import { useMemo, useState } from 'react';
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Award, BookOpen, BrainCircuit,
  Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, ClipboardCheck,
  Clock3, Compass, GraduationCap, LayoutDashboard, Lightbulb, MessageCircle,
  Search, Send, ShieldCheck, Sparkles, Target, TrendingUp, Users, X, Zap
} from 'lucide-react';

type Role = 'student' | 'teacher' | 'parent' | 'management';
type Track = 'LGS' | 'YKS';
type ChatMessage = { role: 'assistant' | 'user'; text: string };

const questionBank = {
  LGS: [
    {
      title: 'Üslü ifadeler',
      prompt: 'Bir sayının kendisiyle 4 kez çarpımı aşağıdakilerden hangisiyle gösterilir?',
      options: ['4 × a', 'a⁴', 'a + 4', 'a ÷ 4'],
      answer: 1,
      explanation: 'Bir sayının kendisiyle çarpımı üslü ifade ile gösterilir. a sayısı 4 kez çarpılıyorsa a × a × a × a = a⁴ olur.',
      source: 'Demo için hazırlanmış örnek soru · Resmî sınav sorusu değildir'
    },
    {
      title: 'Üslü ifadeler · tekrar',
      prompt: '3² + 2 işleminin sonucu kaçtır?',
      options: ['8', '9', '11', '18'],
      answer: 2,
      explanation: 'Önce üslü işlem yapılır: 3² = 3 × 3 = 9. Ardından 2 eklenir ve sonuç 11 olur.',
      source: 'Demo için hazırlanmış tekrar sorusu · Resmî sınav sorusu değildir'
    }
  ],
  YKS: [
    {
      title: 'Fonksiyonlar',
      prompt: 'f(x) = 2x + 1 olduğuna göre f(3) kaçtır?',
      options: ['5', '6', '7', '8'],
      answer: 2,
      explanation: 'f(3) değerini bulmak için x yerine 3 yazarız: f(3) = 2 × 3 + 1 = 7.',
      source: 'Demo için hazırlanmış örnek soru · Resmî sınav sorusu değildir'
    },
    {
      title: 'Fonksiyonlar · tekrar',
      prompt: 'g(x) = x² − 1 ise g(2) kaçtır?',
      options: ['2', '3', '4', '5'],
      answer: 1,
      explanation: 'x yerine 2 yazılır: g(2) = 2² − 1 = 4 − 1 = 3.',
      source: 'Demo için hazırlanmış tekrar sorusu · Resmî sınav sorusu değildir'
    }
  ]
};

const roleNames: Record<Role, string> = {
  student: 'Öğrenci alanı',
  teacher: 'Öğretmen çalışma alanı',
  parent: 'Veli görünümü',
  management: 'Kurum görünümü'
};

export default function App() {
  const [role, setRole] = useState<Role>('student');
  const [track, setTrack] = useState<Track>('LGS');
  const [page, setPage] = useState<'overview' | 'practice' | 'tutor' | 'progress'>('overview');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [retryDone, setRetryDone] = useState(false);\n  const [retryMode, setRetryMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Merhaba! Bugün birlikte üslü ifadeleri çalışabiliriz. Takıldığın yeri anlatırsan adım adım ilerleyelim.' }
  ]);
  const [notice, setNotice] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const question = questionBank[track][retryMode ? 1 : 0];
  const equation = track === 'LGS' ? (retryMode ? '3² + 2' : 'a × a × a × a') : (retryMode ? 'g(2) = 2² − 1' : 'f(3) = 2 × 3 + 1');

  const student = track === 'LGS'
    ? { name: 'Kerem Yılmaz', grade: '8. sınıf', exam: 'LGS hazırlık', initials: 'KY', goal: 'Üslü ifadeleri pekiştirmek' }
    : { name: 'Selin Demir', grade: '11. sınıf', exam: 'YKS hazırlık', initials: 'SD', goal: 'Fonksiyonlarda temel kavramlar' };

  const progress = useMemo(() => {
    const base = track === 'LGS' ? 68 : 54;
    return Math.min(100, base + (submitted && selectedAnswer === question.answer ? 4 : 0) + (retryDone ? 8 : 0));
  }, [track, submitted, selectedAnswer, retryDone, question.answer]);

  const resetPractice = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
    setRetryDone(false);
    setRetryMode(false);
    setPage('practice');
  };

  const switchRole = (next: Role) => {
    setRole(next);
    setNotice('');
    setShowRoleMenu(false);
    if (next === 'student') setPage('overview');
  };

  const submitAnswer = () => {
    if (selectedAnswer === null) return;
    setSubmitted(true);\n    if (retryMode && selectedAnswer === question.answer) setRetryDone(true);
  };

  const sendTutorMessage = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    setChat((items) => [...items, { role: 'user', text }]);
    setChatInput('');
    setChatLoading(true);
    try {
      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: track === 'LGS' ? 'std_lgs_801' : 'std_yks_1101',
          userMessage: text,
          chatHistory: chat.map((item) => ({ role: item.role, text: item.text }))
        })
      });
      const data = await response.json();
      if (!response.ok || !data.reply) throw new Error(data.error || 'AI servisine ulaşılamadı.');
      setChat((items) => [...items, { role: 'assistant', text: data.reply }]);
    } catch {
      setChat((items) => [...items, {
        role: 'assistant',
        text: 'Şu anda canlı AI yanıtı alınamadı. Güvenilir ilerlemek için birlikte sorunun temel fikrinden başlayalım: üslü ifadelerde üs, aynı çarpanın kaç kez kullanıldığını gösterir. İstersen sorudaki adımı birlikte inceleyebiliriz.'
      }]);
      setNotice('Canlı AI şu anda erişilebilir değil; kontrollü örnek yanıt gösterildi.');
    } finally {
      setChatLoading(false);
    }
  };

  const Header = () => (
    <header className="topbar">
      <button className="brand" onClick={() => { setRole('student'); setPage('overview'); }} aria-label="Ana sayfaya dön">
        <span className="brand-mark"><span /><span /><span /><span /></span>
        <span className="brand-copy"><strong>öğren<span>+</span></strong><small>KUBİK İÇİN ÜRÜN DENEYİ</small></span>
      </button>
      <div className="topbar-center"><span className="demo-dot" /> ÜRÜN DEMOSU <span className="topbar-divider">/</span> {roleNames[role]}</div>
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Yardım" onClick={() => setNotice('Bu deneyim, Kubik için hazırlanan bağımsız ürün demosudur.')}><CircleHelp size={18} /></button>
        <div className="role-menu-wrap">
          <button className="profile-switch" onClick={() => setShowRoleMenu(!showRoleMenu)}>
            <span className="avatar">{role === 'student' ? student.initials : role === 'teacher' ? 'EA' : role === 'parent' ? 'AY' : 'K'}</span>
            <span className="profile-switch-text"><strong>{role === 'student' ? student.name : role === 'teacher' ? 'Ece Öğretmen' : role === 'parent' ? 'Ayşe Yılmaz' : 'Kurum yönetimi'}</strong><small>Demo görünümü</small></span>
            <ChevronDown size={15} />
          </button>
          {showRoleMenu && <div className="role-dropdown">{(['student', 'teacher', 'parent', 'management'] as Role[]).map((r) => <button key={r} onClick={() => switchRole(r)}>{roleNames[r]}{role === r && <Check size={15} />}</button>)}</div>}
        </div>
      </div>
    </header>
  );

  const Sidebar = () => (
    <aside className="sidebar">
      <div className="workspace-label">ÇALIŞMA ALANI</div>
      {role === 'student' ? <>
        <button className={page === 'overview' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('overview')}><LayoutDashboard size={18} /> Genel bakış</button>
        <button className={page === 'practice' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('practice')}><ClipboardCheck size={18} /> Soru çöz</button>
        <button className={page === 'tutor' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('tutor')}><MessageCircle size={18} /> AI öğretmen <span className="nav-new">AI</span></button>
        <button className={page === 'progress' ? 'nav-item active' : 'nav-item'} onClick={() => setPage('progress')}><TrendingUp size={18} /> Gelişimim</button>
      </> : role === 'teacher' ? <>
        <button className="nav-item active" onClick={() => setNotice('Öğrenci gelişimi görünümü açık.')}><LayoutDashboard size={18} /> Sınıf özeti</button>
        <button className="nav-item" onClick={() => setNotice('Bu demo için örnek konu analizi gösteriliyor.')}><Target size={18} /> Konu analizleri</button>
        <button className="nav-item" onClick={() => setNotice('Ödev atama iş akışı sonraki sürümde detaylandırılacak.')}><BookOpen size={18} /> Çalışma atamaları</button>
      </> : role === 'parent' ? <>
        <button className="nav-item active" onClick={() => setNotice('Haftalık gelişim özeti açık.')}><LayoutDashboard size={18} /> Haftalık özet</button>
        <button className="nav-item" onClick={() => setNotice('Deneme sonuçları örnek verilerle gösteriliyor.')}><ClipboardCheck size={18} /> Deneme sonuçları</button>
      </> : <>
        <button className="nav-item active" onClick={() => setNotice('Kurum görünümü açık.')}><LayoutDashboard size={18} /> Genel görünüm</button>
        <button className="nav-item" onClick={() => setNotice('Online program modeli ürün keşfi aşamasında.')}><TrendingUp size={18} /> Dijital büyüme</button>
      </>}
      <div className="sidebar-bottom">
        <div className="sidebar-help"><div className="help-icon"><Sparkles size={17} /></div><strong>Her adım bir gelişim.</strong><p>Hedefini küçük adımlara böl, ilerlemeni takip et.</p><button onClick={() => { setRole('student'); setPage('practice'); }}>Çalışmaya başla <ArrowRight size={14} /></button></div>
        <div className="demo-label"><ShieldCheck size={14} /> Örnek öğrenci verileri</div>
      </div>
    </aside>
  );

  const StudentOverview = () => (
    <>
      <div className="welcome-row"><div><div className="eyebrow">11 EKİM PAZAR · BUGÜNÜN PLANI</div><h1>Merhaba, {student.name.split(' ')[0]} <span className="wave">✳</span></h1><p className="muted">Küçük bir adım, büyük bir ilerlemenin başlangıcı.</p></div><div className="track-toggle"><button className={track === 'LGS' ? 'selected' : ''} onClick={() => { setTrack('LGS'); setRetryMode(false); setSelectedAnswer(null); setSubmitted(false); setNotice('LGS demo öğrencisine geçildi.'); }}>LGS</button><button className={track === 'YKS' ? 'selected' : ''} onClick={() => { setTrack('YKS'); setRetryMode(false); setSelectedAnswer(null); setSubmitted(false); setNotice('YKS demo öğrencisine geçildi.'); }}>YKS</button></div></div>
      <section className="hero-card">
        <div className="hero-copy"><span className="pill pill-light"><Sparkles size={13} /> BUGÜNÜN ODAĞI</span><h2>{student.goal}</h2><p>Önce neyi bildiğini görelim. Sonra sana en çok yardımcı olacak adıma birlikte karar verelim.</p><button className="button button-white" onClick={resetPractice}>Çalışmaya devam et <ArrowRight size={16} /></button><div className="hero-meta"><span><Clock3 size={14} /> 12 dk</span><span><Target size={14} /> 3 küçük adım</span></div></div>
        <div className="hero-art"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="art-center"><BrainCircuit size={42} strokeWidth={1.5} /></div><div className="float-card float-top"><span className="float-icon"><CheckCircle2 size={16} /></span><span><strong>Öğrenme planı</strong><small>Sana göre şekillenir</small></span></div><div className="float-card float-bottom"><span className="mini-bars"><i /><i /><i /><i /><i /></span><span><strong>İlerleme</strong><small>{progress}% konu hâkimiyeti</small></span></div></div>
      </section>
      <div className="section-heading"><div><h2>Bugünkü çalışma planın</h2><p>İhtiyacına göre sıralanmış üç küçük adım.</p></div><button className="text-button" onClick={() => setPage('progress')}>Gelişimimi gör <ArrowRight size={15} /></button></div>
      <div className="plan-list">
        <button className="plan-row" onClick={resetPractice}><span className="plan-number active-number">01</span><span className="plan-main"><strong>Kısa bir soruyla başla</strong><small>{question.title} · 3 dakika</small></span><span className="plan-status status-next">Şimdi başla</span><ChevronRight size={17} /></button>
        <button className="plan-row" onClick={() => setPage('tutor')}><span className="plan-number">02</span><span className="plan-main"><strong>Anlamadığın adımı sor</strong><small>AI öğretmenle birlikte incele · 4 dakika</small></span><span className="plan-status">Önerilen</span><ChevronRight size={17} /></button>
        <button className="plan-row" onClick={() => setPage('progress')}><span className="plan-number">03</span><span className="plan-main"><strong>Gelişimini kontrol et</strong><small>Konularını ve sonraki hedefini gör · 2 dakika</small></span><span className="plan-status">Son adım</span><ChevronRight size={17} /></button>
      </div>
      <div className="bottom-grid"><section className="panel mastery-panel"><div className="panel-head"><div><h3>Konu durumun</h3><p>Örnek öğrenme göstergeleri</p></div><button className="quiet-icon" onClick={() => setPage('progress')}><ArrowUpRight size={17} /></button></div><div className="mastery-item"><div className="mastery-top"><span>Üslü ifadeler</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: progress + '%' }} /></div><small>Bir sonraki adım: benzer bir soruyla tekrar</small></div><div className="mastery-item"><div className="mastery-top"><span>Çarpanlar ve katlar</span><strong>72%</strong></div><div className="progress-track"><span style={{ width: '72%' }} /></div><small>Örnek kayıt · Henüz canlı ölçüm değil</small></div></section><section className="panel tutor-promo"><div className="promo-symbol"><MessageCircle size={22} /></div><span className="eyebrow">YANINDA BİR REHBER</span><h3>Takıldığın yerde yalnız değilsin.</h3><p>Bir soruyu neden yanlış yaptığını anlamak için AI öğretmenle konuş.</p><button className="button button-dark" onClick={() => setPage('tutor')}>Bir soru sor <ArrowRight size={15} /></button></section></div>
    </>
  );

  const Practice = () => (
    <div className="practice-wrap">
      <button className="back-link" onClick={() => setPage('overview')}><ArrowRight className="back-arrow" size={15} /> Genel bakışa dön</button>
      <div className="practice-title"><div><div className="eyebrow">KISA KONU KONTROLÜ · {track}</div><h1>Birlikte düşünelim.</h1><p className="muted">Bu sorunun amacı sadece doğru cevabı bulmak değil, düşünme adımını anlamak.</p></div><div className="question-counter"><span>01</span><small>/ 03</small></div></div>
      <div className="question-layout"><section className="panel question-panel"><div className="question-meta"><span className="subject-tag"><BookOpen size={14} /> Matematik</span><span className="difficulty">Temel seviye</span></div><h2>{question.title}</h2><p className="question-prompt">{question.prompt}</p><div className="math-example">{equation} <span>= ?</span></div><div className="options-list">{question.options.map((option, index) => <button key={option} disabled={submitted} className={'option-row ' + (selectedAnswer === index ? 'chosen ' : '') + (submitted && index === question.answer ? 'correct ' : '') + (submitted && selectedAnswer === index && index !== question.answer ? 'incorrect ' : '')} onClick={() => setSelectedAnswer(index)}><span className="option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{submitted && index === question.answer && <CheckCircle2 size={18} />}{submitted && selectedAnswer === index && index !== question.answer && <X size={18} />}</button>)}</div>
      {!submitted ? <button className="button button-dark button-full" disabled={selectedAnswer === null} onClick={submitAnswer}>Cevabımı kontrol et <ArrowRight size={16} /></button> : <div className={'answer-feedback ' + (selectedAnswer === question.answer ? 'feedback-correct' : 'feedback-wrong')}><div className="feedback-title">{selectedAnswer === question.answer ? <CheckCircle2 size={19} /> : <Lightbulb size={19} />}{selectedAnswer === question.answer ? 'Doğru cevap!' : 'Buradan birlikte öğrenebiliriz.'}</div><p>{question.explanation}</p><div className="source-note"><ShieldCheck size={14} /> {question.source}</div><button className="button button-dark button-full" onClick={() => { if (!retryMode) { setRetryMode(true); setSelectedAnswer(null); setSubmitted(false); setPage('practice'); } else { setPage('tutor'); } }}>{retryMode ? 'AI öğretmenle devam et' : 'Benzer soruyla tekrar dene'} <ArrowRight size={16} /></button><button className="text-button" onClick={() => setPage('tutor')}>AI öğretmene sor <ArrowRight size={14} /></button></div>}
      </section><aside className="panel question-side"><div className="side-icon"><Target size={20} /></div><h3>Bu çalışmada neyi keşfediyoruz?</h3><p>Bir işlemi ezberlemek yerine, üslü ifadenin ne anlattığını kavramayı.</p><div className="side-divider" /><div className="side-mini-row"><span className="side-mini-icon"><Clock3 size={16} /></span><span><strong>3–5 dakika</strong><small>Kısa konu kontrolü</small></span></div><div className="side-mini-row"><span className="side-mini-icon"><BrainCircuit size={16} /></span><span><strong>Sonraki adım kişiselleşir</strong><small>Cevabına göre yönlendirme</small></span></div></aside></div>
    </div>
  );

  const Tutor = () => (
    <div className="tutor-page"><button className="back-link" onClick={() => setPage('overview')}><ArrowRight className="back-arrow" size={15} /> Genel bakışa dön</button><div className="tutor-intro"><div className="tutor-big-icon"><Sparkles size={25} /></div><div><div className="eyebrow">AI DESTEKLİ ÇALIŞMA</div><h1>Birlikte anlayalım.</h1><p className="muted">Sana doğrudan cevabı vermek yerine, düşünmene yardımcı olacağım.</p></div></div><div className="chat-panel"><div className="chat-header"><div className="chat-avatar"><BrainCircuit size={19} /></div><div><strong>Öğrenme rehberin</strong><small><span className="online-dot" /> Konu odaklı destek</small></div><span className="chat-mode">DEMO</span></div><div className="chat-messages">{chat.map((message, index) => <div key={index} className={'chat-message ' + message.role}><div className="message-avatar">{message.role === 'assistant' ? <Sparkles size={14} /> : student.initials.slice(0, 1)}</div><div className="message-bubble">{message.text}</div></div>)}{chatLoading && <div className="chat-message assistant"><div className="message-avatar"><Sparkles size={14} /></div><div className="message-bubble typing"><i /><i /><i /></div></div>}</div><form className="chat-composer" onSubmit={(e) => { e.preventDefault(); void sendTutorMessage(); }}><input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Takıldığın yeri buraya yaz..." aria-label="AI öğretmene mesaj" /><button className="send-button" type="submit" disabled={!chatInput.trim() || chatLoading} aria-label="Mesaj gönder"><Send size={17} /></button></form><div className="chat-footnote"><ShieldCheck size={13} /> Eğitim amaçlı demo. Yanıtlar doğrulanmış ders materyalinin yerini tutmaz.</div></div><div className="suggested-prompts"><span>Şunları sorabilirsin:</span><button onClick={() => setChatInput('Üslü ifadede üs ne anlama gelir?')}>Üs ne anlama gelir?</button><button onClick={() => setChatInput('Bu soruda neden a⁴ kullanıyoruz?')}>Neden a⁴ kullanıyoruz?</button></div></div>
  );

  const Progress = () => (
    <div className="progress-page"><button className="back-link" onClick={() => setPage('overview')}><ArrowRight className="back-arrow" size={15} /> Genel bakışa dön</button><div className="welcome-row"><div><div className="eyebrow">GELİŞİM RAPORU</div><h1>İlerlemeni fark et.</h1><p className="muted">Örnek öğrenci verisi · Gerçek sınav sonucu değildir.</p></div><span className="report-period">Bu haftanın özeti</span></div><div className="stat-grid"><div className="stat-card"><span className="stat-icon blue"><Target size={18} /></span><small>Konu hâkimiyeti</small><strong>{progress}%</strong><span className="stat-caption">Örnek gösterge</span></div><div className="stat-card"><span className="stat-icon green"><CheckCircle2 size={18} /></span><small>Tamamlanan hedef</small><strong>{submitted ? '2 / 3' : '1 / 3'}</strong><span className="stat-caption">Bugünkü çalışma</span></div><div className="stat-card"><span className="stat-icon amber"><Clock3 size={18} /></span><small>Çalışma süresi</small><strong>{submitted ? '8' : '5'} dk</strong><span className="stat-caption">Bu demo oturumu</span></div></div><section className="panel report-panel"><div className="panel-head"><div><h3>Konu bazlı görünüm</h3><p>Bir sonraki çalışmayı seçmene yardımcı olur.</p></div><span className="sample-chip">ÖRNEK VERİ</span></div><div className="report-topic"><div><strong>Üslü ifadeler</strong><small>{submitted ? 'Soru denendi · Açıklama görüldü' : 'Kısa konu kontrolü bekliyor'}</small></div><div className="report-bar"><span style={{ width: progress + '%' }} /></div><strong>{progress}%</strong></div><div className="report-topic"><div><strong>Çarpanlar ve katlar</strong><small>Önceki örnek kayıt</small></div><div className="report-bar"><span style={{ width: '72%' }} /></div><strong>72%</strong></div><div className="next-step-box"><div className="next-step-icon"><Lightbulb size={20} /></div><div><strong>Önerilen sonraki adım</strong><p>{submitted && selectedAnswer !== question.answer ? 'Üslü ifadelerin mantığını açıklamayla tekrar et ve benzer bir soruyu yeniden dene.' : 'Üslü ifadelerde temel kavramı pekiştirmek için bir benzer soru daha çöz.'}</p></div><button className="quiet-icon" onClick={resetPractice}><ArrowRight size={17} /></button></div></section></div>
  );

  const Teacher = () => (
    <div className="role-page"><div className="welcome-row"><div><div className="eyebrow">ÖĞRETMEN ÇALIŞMA ALANI</div><h1>Öğrenciyi tanı, doğru adımı seç.</h1><p className="muted">Sınıfın durumundan bireysel desteğe geçiş.</p></div><span className="role-tag"><GraduationCap size={15} /> Örnek sınıf</span></div><div className="stat-grid"><div className="stat-card"><span className="stat-icon blue"><Users size={18} /></span><small>Örnek öğrenci</small><strong>24</strong><span className="stat-caption">Demo sınıf kaydı</span></div><div className="stat-card"><span className="stat-icon amber"><Target size={18} /></span><small>Öncelikli konu</small><strong>3</strong><span className="stat-caption">Örnek konu grubu</span></div><div className="stat-card"><span className="stat-icon green"><ClipboardCheck size={18} /></span><small>Çalışma tamamlayan</small><strong>18</strong><span className="stat-caption">Örnek sınıf verisi</span></div></div><section className="panel"><div className="panel-head"><div><h3>Takip önerileri</h3><p>Öğretmenin inceleyebileceği örnek durumlar.</p></div><span className="sample-chip">SİMÜLASYON</span></div><div className="student-table"><div className="student-table-head"><span>Öğrenci</span><span>Konu</span><span>Önerilen adım</span><span>Durum</span></div><div className="student-table-row"><span className="student-name"><span className="avatar small-avatar">KY</span><span><strong>Kerem Yılmaz</strong><small>8. sınıf · LGS</small></span></span><span>Üslü ifadeler</span><span>Benzer soruyla pekiştir</span><span className="status-badge needs">İncele</span></div><div className="student-table-row"><span className="student-name"><span className="avatar small-avatar purple">SD</span><span><strong>Selin Demir</strong><small>11. sınıf · YKS</small></span></span><span>Fonksiyonlar</span><span>Kavram tekrarını öner</span><span className="status-badge follow">Takip et</span></div></div><div className="teacher-insight"><Lightbulb size={19} /><div><strong>Öğretmen için içgörü</strong><p>Analiz, öğretmenin kararının yerine geçmez; hangi öğrenciyle ve hangi konudan başlamanın faydalı olabileceğini görünür kılar.</p></div></div></section></div>
  );

  const Parent = () => (
    <div className="role-page"><div className="welcome-row"><div><div className="eyebrow">VELİ GÖRÜNÜMÜ</div><h1>Bu hafta neler öğrendi?</h1><p className="muted">Anlaşılır, sade ve hedeflere odaklanan bir özet.</p></div><span className="role-tag"><Users size={15} /> {student.name}</span></div><section className="parent-summary"><div className="parent-summary-top"><span className="stat-icon green"><CheckCircle2 size={20} /></span><div><span className="eyebrow">HAFTALIK ÖZET · ÖRNEK</span><h2>İlerlemek için net bir sonraki adım var.</h2></div></div><p>Bu örnek rapor, öğrencinin çalışma hedeflerini ve hangi konular üzerinde durduğunu anlaşılır biçimde gösterir. Gerçek öğrenci kaydı değildir.</p><div className="parent-metrics"><div><strong>{submitted ? '2' : '1'} / 3</strong><span>Tamamlanan hedef</span></div><div><strong>{progress}%</strong><span>Örnek konu göstergesi</span></div><div><strong>{submitted ? '8' : '5'} dk</strong><span>Demo oturumu</span></div></div></section><section className="panel parent-recommendation"><div className="next-step-icon"><Lightbulb size={20} /></div><div><h3>Önerilen destek</h3><p>Çalışılan konuyu kısa tekrar ve benzer sorularla pekiştirmek; ihtiyaç devam ederse öğretmenle birlikte değerlendirmek.</p></div><button className="text-button" onClick={() => switchRole('teacher')}>Öğretmen görünümü <ArrowRight size={15} /></button></section></div>
  );

  const Management = () => (
    <div className="role-page"><div className="welcome-row"><div><div className="eyebrow">KURUMSAL ÜRÜN VİZYONU</div><h1>Eğitimi birbirine bağlayan sistem.</h1><p className="muted">Öğrenci deneyiminden öğretmen içgörüsüne, oradan veli iletişimine.</p></div><span className="role-tag"><ShieldCheck size={15} /> Ürün konsepti</span></div><section className="management-hero"><div><span className="pill pill-light"><Sparkles size={13} /> KUBİK İÇİN ÜRÜN FİKRİ</span><h2>Yalnızca ders sunmak değil, öğrenme sürecini görünür kılmak.</h2><p>Öğrencinin çalışma verisi, öğretmenin yönlendirmesi ve velinin anlayabildiği ilerleme aynı sistemin parçaları olabilir.</p></div><div className="management-graphic"><div className="mg-node"><GraduationCap size={19} /><span>Öğrenci</span></div><div className="mg-line" /><div className="mg-node center-node"><BrainCircuit size={22} /><span>Öğrenme döngüsü</span></div><div className="mg-line" /><div className="mg-node"><Users size={19} /><span>Öğretmen + veli</span></div></div></section><div className="section-heading"><div><h2>Değer nerede oluşabilir?</h2><p>Henüz doğrulanmamış ürün fırsatları.</p></div></div><div className="opportunity-grid"><div className="panel opportunity-card"><span className="stat-icon blue"><Target size={18} /></span><h3>Öğrenme görünürlüğü</h3><p>Öğrencinin hangi konuda desteğe ihtiyaç duyduğunu somutlaştırma.</p></div><div className="panel opportunity-card"><span className="stat-icon green"><Users size={18} /></span><h3>Öğretmen desteği</h3><p>Tekrarlayan analiz işlerini azaltmaya ve doğru müdahaleye odaklanma.</p></div><div className="panel opportunity-card"><span className="stat-icon amber"><TrendingUp size={18} /></span><h3>Dijital hizmet potansiyeli</h3><p>Yüz yüze eğitimi tamamlayabilecek çevrim içi çalışma deneyimleri.</p></div></div><div className="honesty-note"><ShieldCheck size={17} /><p><strong>Şeffaflık:</strong> Bu ekran ürün konseptini gösterir. Öğrenci sayısı, gelir, başarı artışı veya operasyonel tasarruf hakkında gerçek işletme verisi iddia etmez.</p></div></div>
  );

  return (
    <div className="app-shell">
      <Header />
      <div className="app-body"><Sidebar /><main className="main-content">
        {notice && <div className="notice-banner"><span>{notice}</span><button onClick={() => setNotice('')} aria-label="Bildirimi kapat"><X size={15} /></button></div>}
        {role === 'student' && page === 'overview' && <StudentOverview />}
        {role === 'student' && page === 'practice' && <Practice />}
        {role === 'student' && page === 'tutor' && <Tutor />}
        {role === 'student' && page === 'progress' && <Progress />}
        {role === 'teacher' && <Teacher />}
        {role === 'parent' && <Parent />}
        {role === 'management' && <Management />}
        <footer className="app-footer"><span>öğren+ <i>·</i> Ürün deneyimi</span><span><ShieldCheck size={13} /> Örnek verilerle hazırlanmıştır</span></footer>
      </main></div>
    </div>
  );
}
