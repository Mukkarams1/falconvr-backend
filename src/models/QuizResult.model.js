// ============================================================
//  QuizResult.model.js — Quiz Result Schema
// ============================================================
//
//  When a student finishes a quiz in VR, the Unity app sends
//  a POST request to /api/v1/results with their answers.
//  This model stores that submission.
//
//  The teacher dashboard then reads these results to see how
//  students performed per subject and per question.
//
//  Fields:
//    studentName  — typed by the student in VR (no account needed)
//    subject      — which subject they were quizzed on
//    quiz         — which quiz they took
//    answers      — array of their selected option indices
//    score        — number of correct answers
//    totalQ       — total number of questions (for % calculation)
//    submittedAt  — when they finished (auto-set)
//
//  Why no student account?
//    DHH students just type their name in VR. This keeps it
//    friction-free. The teacher knows their class, so a name
//    is enough to identify who submitted.
// ============================================================

const mongoose = require('mongoose');

// ── Sub-schema: one answer per question ──────────────────────
const answerSchema = new mongoose.Schema(
  {
    questionId:    { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedIndex: { type: Number, required: true, min: 0, max: 3 },
    isCorrect:     { type: Boolean, required: true },
  },
  { _id: false } // No separate ID needed for each answer row
);

// ── Main result schema ───────────────────────────────────────
const quizResultSchema = new mongoose.Schema(
  {
    studentName: {
      type:     String,
      required: [true, 'Student name is required'],
      trim:     true,
    },
    subject: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Subject',
      required: true,
    },
    quiz: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Quiz',
      required: true,
    },
    answers: {
      type: [answerSchema],
    },
    score: {
      type:     Number,
      required: true,
      min:      0,
    },
    totalQuestions: {
      type:     Number,
      required: true,
      min:      1,
    },
  },
  {
    timestamps: true, // createdAt becomes "submittedAt" conceptually
  }
);

module.exports = mongoose.model('QuizResult', quizResultSchema);
