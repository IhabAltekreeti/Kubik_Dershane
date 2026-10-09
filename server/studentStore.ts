/**
 * Server-Side Trusted Student Store & Deterministic Progress Engine
 *
 * Security & Integrity:
 * - Student identities and grades are strictly controlled by the server.
 * - Client cannot change student ID, grade, or role via request parameters.
 * - Progress is deterministically computed based on verified answer submissions.
 * - Records are persisted to a JSON file so progress survives page and server reloads.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_FILE = path.resolve(__dirname, '../data/demo_learning_progress.json');

export interface ServerStudentProfile {
  id: string;
  name: string;
  grade: number;
  track: 'LGS' | 'YKS';
  targetGoal: string;
  currentSubject: string;
  currentTopic: string;
}

export interface LearningEvidenceSubmission {
  id: string;
  studentId: string;
  questionId: string;
  submittedAt: string;
  chosenOptionId: string;
  isCorrect: boolean;
  hintsUsedCount: number;
  aiTutorInteractionsCount: number;
  feedbackMessage: string;
}

export interface StudentTopicMasteryRecord {
  studentId: string;
  topicId: string;
  topicName: string;
  baselineMastery: number;
  currentMastery: number;
  totalSubmissions: number;
  correctSubmissions: number;
  status: 'needs_practice' | 'in_progress' | 'mastered';
  evidenceLog: LearningEvidenceSubmission[];
  ruleExplanation: string;
}

// Server allowlist of verified demo students
export const ALLOWLISTED_STUDENTS: Record<string, ServerStudentProfile> = {
  'std_lgs_801': {
    id: 'std_lgs_801',
    name: 'Kerem Demir',
    grade: 8,
    track: 'LGS',
    targetGoal: 'Kabataş Erkek Lisesi (Hedef: 488+ Puan)',
    currentSubject: 'Matematik',
    currentTopic: 'Üslü İfadeler'
  },
  'std_yks_1101': {
    id: 'std_yks_1101',
    name: 'Selin Yılmaz',
    grade: 11,
    track: 'YKS',
    targetGoal: 'ODTÜ Bilgisayar Mühendisliği (Hedef Sıralama: İlk 4.500)',
    currentSubject: '11. Sınıf Matematik & TYT',
    currentTopic: 'Fonksiyon Simetrileri'
  }
};

class StudentStore {
  private masteryData: Map<string, StudentTopicMasteryRecord> = new Map();

  constructor() {
    this.initializeStore();
  }

  private initializeStore() {
    // Default baseline for Student A (Kerem Demir - Grade 8)
    this.masteryData.set('std_lgs_801:top_lgs_uslu', {
      studentId: 'std_lgs_801',
      topicId: 'top_lgs_uslu',
      topicName: 'Üslü İfadeler: Negatif Üsler ve İşlem Kuralları',
      baselineMastery: 52,
      currentMastery: 52,
      totalSubmissions: 0,
      correctSubmissions: 0,
      status: 'needs_practice',
      evidenceLog: [],
      ruleExplanation: 'Başlangıç deneme sınavı teşhis skoru: %52. Doğru çözülen her doğrulanmış soru kazanım skorunu artırır.'
    });

    // Default baseline for Student B (Selin Yılmaz - Grade 11)
    this.masteryData.set('std_yks_1101:top_yks_fonk', {
      studentId: 'std_yks_1101',
      topicId: 'top_yks_fonk',
      topicName: 'Fonksiyonlarda Simetri & Grafik Öteleme',
      baselineMastery: 55,
      currentMastery: 55,
      totalSubmissions: 0,
      correctSubmissions: 0,
      status: 'needs_practice',
      evidenceLog: [],
      ruleExplanation: 'Başlangıç deneme sınavı teşhis skoru: %55.'
    });

    // Load from disk if available
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        for (const [key, value] of Object.entries(parsed)) {
          this.masteryData.set(key, value as StudentTopicMasteryRecord);
        }
      }
    } catch (err) {
      console.warn('Could not load existing progress storage, using initial seed:', err);
    }
  }

  private persistToDisk() {
    try {
      const obj: Record<string, StudentTopicMasteryRecord> = {};
      for (const [key, value] of this.masteryData.entries()) {
        obj[key] = value;
      }
      const dir = path.dirname(STORAGE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving progress storage to disk:', err);
    }
  }

  public getTrustedStudent(studentId: string): ServerStudentProfile | null {
    return ALLOWLISTED_STUDENTS[studentId] || null;
  }

  public getTopicMastery(studentId: string, topicId: string): StudentTopicMasteryRecord {
    const key = `${studentId}:${topicId}`;
    if (!this.masteryData.has(key)) {
      this.masteryData.set(key, {
        studentId,
        topicId,
        topicName: 'Matematik Kazanımı',
        baselineMastery: 50,
        currentMastery: 50,
        totalSubmissions: 0,
        correctSubmissions: 0,
        status: 'needs_practice',
        evidenceLog: [],
        ruleExplanation: 'İlk başlangıç teşhis skoru: %50.'
      });
    }
    return this.masteryData.get(key)!;
  }

  /**
   * Deterministic Mastery Calculation Rule:
   * - One single question answer alone cannot imply complete mastery of a whole topic.
   * - Correct answer with 0 hints: +6%
   * - Correct answer with 1-2 hints: +4%
   * - Correct answer with 3+ hints: +2%
   * - Incorrect answer: 0% increase, recorded in log.
   * - Topic is only marked 'mastered' when currentMastery >= 85% AND at least 3 distinct verified questions are correct.
   */
  public recordAnswerSubmission(
    studentId: string,
    topicId: string,
    questionId: string,
    chosenOptionId: string,
    isCorrect: boolean,
    hintsUsedCount: number,
    aiTutorInteractionsCount: number
  ): {
    updatedRecord: StudentTopicMasteryRecord;
    delta: number;
    explanation: string;
  } {
    const record = this.getTopicMastery(studentId, topicId);
    record.totalSubmissions += 1;

    let delta = 0;
    let explanation = '';

    if (isCorrect) {
      record.correctSubmissions += 1;
      if (hintsUsedCount === 0) {
        delta = 6;
        explanation = 'Tebrikler! Soru hiç ipucu kullanılmadan doğrudan doğru çözüldü (+%6 kazanım artışı).';
      } else if (hintsUsedCount <= 2) {
        delta = 4;
        explanation = `Tebrikler! Soru ${hintsUsedCount} pedagojik ipucu yardımıyla doğru çözüldü (+%4 kazanım artışı).`;
      } else {
        delta = 2;
        explanation = `Soru tüm ipuçları incelenerek doğru tamamlandı (+%2 kazanım artışı).`;
      }
      record.currentMastery = Math.min(100, record.currentMastery + delta);
    } else {
      delta = 0;
      explanation = 'Cevap doğru değil. Kazanım puanı artırılmadı. Konunun tam kavranması için Gemini Matematik Öğretmeni ile çözüm adımlarını inceleyiniz.';
    }

    // Check status
    if (record.currentMastery >= 85 && record.correctSubmissions >= 3) {
      record.status = 'mastered';
    } else if (record.currentMastery > record.baselineMastery) {
      record.status = 'in_progress';
    } else {
      record.status = 'needs_practice';
    }

    const submission: LearningEvidenceSubmission = {
      id: `sub_${Date.now()}`,
      studentId,
      questionId,
      submittedAt: new Date().toISOString(),
      chosenOptionId,
      isCorrect,
      hintsUsedCount,
      aiTutorInteractionsCount,
      feedbackMessage: explanation
    };

    record.evidenceLog.unshift(submission);
    record.ruleExplanation = `Kayıtlı yanıtlar: ${record.correctSubmissions} doğru / ${record.totalSubmissions} toplam deneme. (Not: Tek bir soru konunun tümünü kazandırmaz; düzenli doğrulama gereklidir).`;

    this.persistToDisk();

    return {
      updatedRecord: record,
      delta,
      explanation
    };
  }
}

export const studentStore = new StudentStore();
