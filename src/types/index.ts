export type EducationalTrack = 'LGS' | 'YKS';

export type UserRole = 'public' | 'student' | 'teacher' | 'parent' | 'management';

export type TopicStatus = 'needs_practice' | 'in_progress' | 'mastered' | 'review_needed';

export interface TopicProgress {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  masteryLevel: number; // 0 - 100
  status: TopicStatus;
  questionCount: number;
  correctCount: number;
  accuracyRate: number;
  lastPracticedDate: string;
  diagnosedWeakness?: string;
  evidenceNotes: string;
}

export interface SubjectOverview {
  id: string;
  name: string;
  code: string;
  track: EducationalTrack;
  color: string;
  totalTopics: number;
  masteredTopics: number;
  averageMastery: number;
  weeklyGoalHours: number;
  completedHours: number;
  netScore: number;
  targetNetScore: number;
  topics: TopicProgress[];
}

export interface DailyTask {
  id: string;
  title: string;
  subjectName: string;
  track: EducationalTrack;
  type: 'diagnostic' | 'guided_concept' | 'practice_quiz' | 'review';
  durationMinutes: number;
  questionCount?: number;
  completed: boolean;
  priority: 'high' | 'normal';
  topicId: string;
  description: string;
}

export interface PracticeExamResult {
  id: string;
  date: string;
  title: string;
  track: EducationalTrack;
  totalQuestions: number;
  correct: number;
  incorrect: number;
  empty: number;
  net: number;
  score: number; // LGS out of 500 or YKS TYT/AYT score
  timeSpentMinutes: number;
  subjectNets: Record<string, number>;
  rankInClass?: string;
  analysisSummary: string;
}

export interface TeacherIntervention {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  subject: string;
  topicName: string;
  triggerType: 'low_mastery' | 'repeated_errors' | 'drop_in_pace' | 'routine_check';
  observedEvidence: string;
  aiSuggestedAction: string;
  teacherStatus: 'pending' | 'approved' | 'modified' | 'dismissed';
  teacherNote?: string;
  assignedPracticeTitle?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: 8 | 11;
  track: EducationalTrack;
  avatarUrl: string;
  targetGoal: string;
  currentScoreEstimate: string;
  overallMastery: number; // 0 - 100
  studyStreakDays: number;
  weeklyStudyHours: number;
  totalQuestionsSolved: number;
  overallAccuracyRate: number;
  subjects: SubjectOverview[];
  dailyTasks: DailyTask[];
  recentExams: PracticeExamResult[];
  activeWeaknessTopics: TopicProgress[];
  parentName: string;
  parentPhoneMasked: string;
  assignedAdvisor: string;
}

// Kübik Learning Loop 6-Step Engine Types
export interface LearningLoopStepContent {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  stepName: string;
  title: string;
  subtitle: string;
}

export interface LearningLoopSession {
  id: string;
  track: EducationalTrack;
  studentId: string;
  topicId: string;
  topicName: string;
  subjectName: string;
  // Step 1: Diagnosis
  diagnosis: {
    evidenceSummary: string;
    identifiedMisconception: string;
    priorAccuracy: number;
    sampleErrorDescription: string;
  };
  // Step 2: Concept Explanation
  conceptExplanation: {
    corePrinciple: string;
    keyFormulaOrRule: string;
    teachingNotes: string[];
    visualModelTitle?: string;
    visualModelSteps?: string[];
  };
  // Step 3: Guided Practice
  guidedPractice: {
    questionText: string;
    questionContext?: string;
    hints: string[];
    workedSolution: string[];
    options: { id: string; text: string; isCorrect: boolean }[];
  };
  // Step 4: Verification Assessment
  verificationAssessment: {
    questionText: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    explanation: string;
  };
  // Step 5: Mastery Update (dynamically applied)
  masteryUpdate: {
    previousMastery: number;
    newMastery: number;
    delta: number;
    auditLog: string;
  };
  // Step 6: Next Step Recommendation
  recommendation: {
    actionType: 'advance' | 'practice_more' | 'teacher_review';
    title: string;
    description: string;
    suggestedTaskTitle: string;
  };
}

export interface ManagementMetrics {
  totalStudentsPhysical: number;
  totalStudentsDigital: number;
  hybridCapacityUtilization: number;
  activeOnlineRetention: number;
  monthlyRecurringRevenueTL: number;
  newEnrollmentsThisMonth: number;
  averageWeeklyStudyMinutesPerStudent: number;
  diagnosticAssessmentFunnel: {
    stage: string;
    count: number;
    conversionRate: string;
  }[];
  subjectAverages: {
    subject: string;
    track: EducationalTrack;
    averageNet: number;
    targetNet: number;
    masteryRate: number;
  }[];
}
