import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { VERIFIED_MATHEMATICS_QUESTION_MEB_LGS, getVerifiedQuestionForTrack } from './server/verifiedContent.js';
import { studentStore, ALLOWLISTED_STUDENTS } from './server/studentStore.js';
import { geminiTutorService } from './server/geminiTutorService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Health check & configuration status (Never exposes the raw API key)
app.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );
  res.json({
    status: 'ok',
    hasGeminiKey,
    environment: process.env.NODE_ENV || 'development'
  });
});

// 2. Trusted Student Context
// Server controls the identity; client cannot change grade or permissions
app.get('/api/student/context', (req, res) => {
  const requestedId = (req.query.studentId as string) || 'std_lgs_801';
  const trustedStudent = studentStore.getTrustedStudent(requestedId);

  if (!trustedStudent) {
    return res.status(404).json({
      error: 'Geçersiz veya yetkilendirilmemiş demo öğrenci kimliği.',
      isRecoverable: false
    });
  }

  res.json({
    student: trustedStudent,
    isDemoIdentity: true,
    serverVerified: true,
    securityNotice: 'DEMO UYARISI: studentId parametresi istemci kontrollü bir demo seçimidir. Bu aşamada gerçek JWT/oturum yetkilendirmesi uygulanmamıştır; yalnızca izinli listedeki profiller kabul edilmektedir.'
  });
});

// 3. Verified Mathematics Question Content
// Returns question text, options and official attribution; answer key is kept on the server
// Strictly verifies track: YKS students receive unsupported track status instead of mismatched LGS content!
app.get('/api/content/verified-question', (req, res) => {
  const studentId = req.query.studentId as string;
  let track: 'LGS' | 'YKS' = (req.query.track as 'LGS' | 'YKS') || 'LGS';

  if (studentId) {
    const student = studentStore.getTrustedStudent(studentId);
    if (student) {
      track = student.track;
    }
  }

  const q = getVerifiedQuestionForTrack(track);

  if (!q) {
    return res.json({
      available: false,
      question: null,
      track,
      grade: track === 'YKS' ? 11 : 8,
      reason: 'unsupported_track',
      message: `${track === 'YKS' ? '11. Sınıf YKS' : '8. Sınıf LGS'} parkuru için resmî kaynakça doğrulaması tamamlanmış soru kaydı bu aşamada bulunmamaktadır. LGS içeriği YKS öğrencisine sunulmaz.`
    });
  }

  res.json({
    available: true,
    question: {
      id: q.id,
      grade: q.grade,
      track: q.track,
      subject: q.subject,
      topic: q.topic,
      learningObjectiveCode: q.learningObjectiveCode,
      learningObjectiveDescription: q.learningObjectiveDescription,
      sourceAttribution: q.sourceAttribution,
      sourceDocument: q.sourceDocument,
      sourceUrl: q.sourceUrl,
      verificationStatus: q.verificationStatus,
      provenanceNotes: q.provenanceNotes,
      questionText: q.questionText,
      options: q.options,
      pedagogicalHintsCount: q.pedagogicalHints.length,
      pedagogicalHints: q.pedagogicalHints
    }
  });
});

// 4. Topic Mastery & Progress (Persisted across reloads)
app.get('/api/student/progress', (req, res) => {
  const studentId = (req.query.studentId as string) || 'std_lgs_801';
  const trustedStudent = studentStore.getTrustedStudent(studentId);
  if (!trustedStudent) {
    return res.status(404).json({ error: 'Öğrenci bulunamadı.' });
  }

  // Default to student's relevant topic
  const defaultTopic = trustedStudent.track === 'LGS' ? 'top_lgs_uslu' : 'top_yks_fonk';
  const topicId = (req.query.topicId as string) || defaultTopic;

  const masteryRecord = studentStore.getTopicMastery(studentId, topicId);
  res.json({ progress: masteryRecord });
});

// 5. Answer Evaluation and Deterministic Mastery Update
app.post('/api/student/answer', (req, res) => {
  const {
    studentId = 'std_lgs_801',
    topicId = 'top_lgs_uslu',
    questionId = 'meb-lgs-8-mat-uslu-01',
    chosenOptionId,
    hintsUsedCount = 0,
    aiTutorInteractionsCount = 0
  } = req.body;

  const trustedStudent = studentStore.getTrustedStudent(studentId);
  if (!trustedStudent) {
    return res.status(403).json({ error: 'Yetkisiz öğrenci kimliği.' });
  }

  // Check track consistency: verify question belongs to student's track
  const verifiedQ = getVerifiedQuestionForTrack(trustedStudent.track);
  if (!verifiedQ || questionId !== verifiedQ.id) {
    return res.status(400).json({ 
      error: `Soru (${questionId}) öğrencinin parkuru (${trustedStudent.track}) için geçerli veya doğrulanmış değil.` 
    });
  }

  const isCorrect = chosenOptionId === verifiedQ.verifiedAnswerKey;

  const evaluation = studentStore.recordAnswerSubmission(
    studentId,
    topicId,
    questionId,
    chosenOptionId,
    isCorrect,
    hintsUsedCount,
    aiTutorInteractionsCount
  );

  res.json({
    isCorrect,
    verifiedAnswerKey: verifiedQ.verifiedAnswerKey,
    officialSolution: verifiedQ.verifiedOfficialSolution,
    delta: evaluation.delta,
    explanation: evaluation.explanation,
    isRepeatedAttempt: evaluation.isRepeatedAttempt,
    updatedMastery: evaluation.updatedRecord
  });
});

// 6. Gemini Mathematics Tutor Bridge
app.post('/api/tutor/chat', async (req, res) => {
  const {
    studentId = 'std_lgs_801',
    userMessage,
    chatHistory = []
  } = req.body;

  if (!userMessage || typeof userMessage !== 'string' || !userMessage.trim()) {
    return res.status(400).json({ error: 'Mesaj metni boş olamaz.' });
  }

  // Trusted student lookup (grade and subject cannot be overridden by request body)
  const trustedStudent = studentStore.getTrustedStudent(studentId);
  if (!trustedStudent) {
    return res.status(403).json({ error: 'Yetkisiz öğrenci kimliği.' });
  }

  const question = getVerifiedQuestionForTrack(trustedStudent.track);
  const response = question
    ? await geminiTutorService.getTutorReply(
        trustedStudent,
        question,
        chatHistory,
        userMessage.trim()
      )
    : trustedStudent.track === 'YKS'
      ? await geminiTutorService.getGeneralTutorReply(
          trustedStudent,
          chatHistory,
          userMessage.trim()
        )
      : {
          message: '',
          error: 'Bu öğrenci parkuru için doğrulanmış soru içeriği henüz bulunmuyor.',
          isRecoverable: false
        };

  if (response.error) {
    return res.status(503).json({
      error: response.error,
      isRecoverable: response.isRecoverable
    });
  }

  res.json({
    reply: response.message
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Kübik Digital Academy server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
