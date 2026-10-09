/**
 * Client-Side API Bridge to Server-Side Gemini Tutor & Learning Progress
 *
 * NOTE: The client NEVER imports @google/genai and NEVER has access to GEMINI_API_KEY.
 * All requests are routed through the secure server API layer.
 */

export interface VerifiedQuestionData {
  id: string;
  grade: number;
  track: 'LGS' | 'YKS';
  subject: string;
  topic: string;
  learningObjectiveCode: string;
  learningObjectiveDescription: string;
  sourceAttribution: string;
  sourceDocument: string;
  sourceUrl: string;
  verificationStatus: 'verified_official_publication' | 'unverified_illustrative';
  provenanceNotes: string;
  questionText: string;
  options: { id: string; text: string }[];
  pedagogicalHintsCount: number;
  pedagogicalHints: string[];
}

export interface VerifiedQuestionResponse {
  available: boolean;
  question: VerifiedQuestionData | null;
  track: 'LGS' | 'YKS';
  grade?: number;
  message?: string;
  reason?: string;
}

export interface LearningEvidenceItem {
  id: string;
  studentId: string;
  questionId: string;
  submittedAt: string;
  chosenOptionId: string;
  isCorrect: boolean;
  hintsUsedCount: number;
  aiTutorInteractionsCount: number;
  feedbackMessage: string;
  isRepeatedAttempt?: boolean;
}

export interface TopicProgressResponse {
  studentId: string;
  topicId: string;
  topicName: string;
  baselineMastery: number;
  currentMastery: number;
  totalSubmissions: number;
  correctSubmissions: number;
  uniqueQuestionsSolved: number;
  solvedQuestionIds: string[];
  status: 'needs_practice' | 'in_progress' | 'mastered';
  evidenceLog: LearningEvidenceItem[];
  ruleExplanation: string;
}

export interface AnswerSubmissionResult {
  isCorrect: boolean;
  verifiedAnswerKey: string;
  officialSolution: {
    steps: string[];
    summary: string;
  };
  delta: number;
  explanation: string;
  isRepeatedAttempt?: boolean;
  updatedMastery: TopicProgressResponse;
}

export async function fetchHealth(): Promise<{ status: string; hasGeminiKey: boolean }> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Sunucu sağlık kontrolü başarısız.');
    return await res.json();
  } catch (err: any) {
    return { status: 'error', hasGeminiKey: false };
  }
}

export async function fetchVerifiedQuestion(studentId?: string, track?: 'LGS' | 'YKS'): Promise<VerifiedQuestionResponse> {
  const params = new URLSearchParams();
  if (studentId) params.set('studentId', studentId);
  if (track) params.set('track', track);

  const res = await fetch(`/api/content/verified-question?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Doğrulanmış MEB soru kaydı alınamadı.');
  }
  return await res.json();
}

export async function fetchStudentProgress(studentId: string, topicId: string): Promise<TopicProgressResponse> {
  const res = await fetch(`/api/student/progress?studentId=${encodeURIComponent(studentId)}&topicId=${encodeURIComponent(topicId)}`);
  if (!res.ok) {
    throw new Error('Öğrenci kazanım verisi alınamadı.');
  }
  const data = await res.json();
  return data.progress;
}

export async function submitAnswer(params: {
  studentId: string;
  topicId: string;
  questionId: string;
  chosenOptionId: string;
  hintsUsedCount: number;
  aiTutorInteractionsCount: number;
}): Promise<AnswerSubmissionResult> {
  const res = await fetch('/api/student/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Cevap değerlendirilemedi.');
  }

  return await res.json();
}

export async function sendTutorChatMessage(params: {
  studentId: string;
  userMessage: string;
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<{ reply: string }> {
  const res = await fetch('/api/tutor/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.error || 'Gemini Öğretmen köprüsünden yanıt alınamadı.';
    throw new Error(message);
  }

  return data;
}
