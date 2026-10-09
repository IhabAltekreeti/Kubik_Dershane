import assert from 'node:assert';
import test from 'node:test';
import { studentStore, ALLOWLISTED_STUDENTS } from '../server/studentStore.js';
import { getVerifiedQuestionForTrack, VERIFIED_MATHEMATICS_QUESTION_MEB_LGS } from '../server/verifiedContent.js';

test('1. Demo Student Identity Allowlist & Isolation', () => {
  // Test allowlist entries
  const kerem = studentStore.getTrustedStudent('std_lgs_801');
  assert.ok(kerem, 'Kerem Demir must exist in trusted student store');
  assert.strictEqual(kerem.grade, 8, 'Kerem must be 8th grade');
  assert.strictEqual(kerem.track, 'LGS', 'Kerem must be LGS track');

  const selin = studentStore.getTrustedStudent('std_yks_1101');
  assert.ok(selin, 'Selin Yılmaz must exist in trusted student store');
  assert.strictEqual(selin.grade, 11, 'Selin must be 11th grade');
  assert.strictEqual(selin.track, 'YKS', 'Selin must be YKS track');

  // Test untrusted / spoofed ID rejection
  const spoofed = studentStore.getTrustedStudent('std_admin_999');
  assert.strictEqual(spoofed, null, 'Untrusted ID must return null');
});

test('2. Track Content Integrity & YKS/LGS Segregation', () => {
  // LGS track has verified question
  const lgsQuestion = getVerifiedQuestionForTrack('LGS');
  assert.ok(lgsQuestion, 'LGS question must be available');
  assert.strictEqual(lgsQuestion.track, 'LGS');
  assert.strictEqual(lgsQuestion.grade, 8);
  assert.strictEqual(lgsQuestion.verificationStatus, 'verified_official_publication');
  assert.strictEqual(lgsQuestion.verifiedAnswerKey, 'B');
  assert.ok(
    lgsQuestion.sourceAttribution.includes('Millî Eğitim Bakanlığı') || lgsQuestion.sourceAttribution.includes('ÖDSGM'),
    'Attribution must reference Millî Eğitim Bakanlığı or ÖDSGM'
  );
  assert.ok(lgsQuestion.sourceDocument.includes('2018-2019'), 'Document reference must cite publication year');

  // YKS track does NOT have fabricated content or mismatched LGS content
  const yksQuestion = getVerifiedQuestionForTrack('YKS');
  assert.strictEqual(yksQuestion, null, 'YKS question must be null when official content is not yet verified');
});

test('3. Question Submission & Anti-Inflation / Unique Question Tracking', () => {
  const testStudentId = 'std_test_isolated_' + Date.now();
  const testTopicId = 'top_test_math';
  const questionId = 'meb-lgs-8-mat-uslu-01';

  // 1. Initial state
  const initialRecord = studentStore.getTopicMastery(testStudentId, testTopicId);
  const initialMastery = initialRecord.currentMastery;
  assert.strictEqual(initialRecord.uniqueQuestionsSolved, 0);

  // 2. First correct submission
  const firstSubmission = studentStore.recordAnswerSubmission(
    testStudentId,
    testTopicId,
    questionId,
    'B',
    true, // isCorrect
    0,    // 0 hints
    1
  );

  assert.strictEqual(firstSubmission.delta, 6, 'First correct submission should grant +6%');
  assert.strictEqual(firstSubmission.isRepeatedAttempt, false, 'First submission is not a repeat');
  assert.strictEqual(firstSubmission.updatedRecord.uniqueQuestionsSolved, 1, 'Unique questions solved must be 1');
  assert.strictEqual(firstSubmission.updatedRecord.currentMastery, initialMastery + 6);
  assert.deepStrictEqual(firstSubmission.updatedRecord.solvedQuestionIds, [questionId]);

  // 3. Repeated submission of the SAME question (Anti-inflation check)
  const repeatSubmission = studentStore.recordAnswerSubmission(
    testStudentId,
    testTopicId,
    questionId,
    'B',
    true, // isCorrect
    0,
    2
  );

  assert.strictEqual(repeatSubmission.delta, 0, 'Repeated submission must NOT increase mastery (+0%)');
  assert.strictEqual(repeatSubmission.isRepeatedAttempt, true, 'Repeat submission flag must be true');
  assert.strictEqual(repeatSubmission.updatedRecord.uniqueQuestionsSolved, 1, 'Unique questions solved must stay at 1');
  assert.strictEqual(
    repeatSubmission.updatedRecord.currentMastery,
    initialMastery + 6,
    'Mastery must not inflate upon repeat submission'
  );

  // 4. Incorrect submission
  const incorrectSubmission = studentStore.recordAnswerSubmission(
    testStudentId,
    testTopicId,
    'meb-another-test-q',
    'C',
    false, // incorrect
    1,
    0
  );

  assert.strictEqual(incorrectSubmission.delta, 0, 'Incorrect answer must give delta 0');
  assert.strictEqual(incorrectSubmission.updatedRecord.uniqueQuestionsSolved, 1, 'Unique questions must not increase on incorrect answer');
});

test('4. Cross-Student Progress Isolation', () => {
  const studentA = 'std_test_a_' + Date.now();
  const studentB = 'std_test_b_' + Date.now();
  const topicId = 'top_isolation_check';

  // Record submission for student A
  studentStore.recordAnswerSubmission(
    studentA,
    topicId,
    'q_iso_1',
    'B',
    true,
    0,
    0
  );

  const recA = studentStore.getTopicMastery(studentA, topicId);
  const recB = studentStore.getTopicMastery(studentB, topicId);

  assert.strictEqual(recA.uniqueQuestionsSolved, 1, 'Student A must have 1 unique question');
  assert.strictEqual(recB.uniqueQuestionsSolved, 0, 'Student B must have 0 unique questions');
  assert.notStrictEqual(recA.currentMastery, recB.currentMastery, 'Student A progress must not leak to Student B');
});
