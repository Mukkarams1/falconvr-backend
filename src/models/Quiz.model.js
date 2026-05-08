// ============================================================
//  Quiz.model.js — Quiz Schema
// ============================================================
//
//  A Quiz belongs to a Subject and contains multiple questions.
//  Each question has exactly 4 answer options and one correct
//  answer index (0-3).
//
//  The VR app will:
//    1. Fetch the quiz for the selected subject
//    2. Display questions one by one on a virtual screen
//    3. Let the student point at answer A / B / C / D
//    4. Track their answers
//    5. Submit results to the /results endpoint
//
//  Schema overview:
//    subject    → which subject this quiz is for
//    title      → e.g. "Fractions Quiz"
//    questions  → array of question objects (see sub-schema)
//    createdBy  → the teacher who built it
//
//  Question sub-schema:
//    questionText   → the question string
//    options        → array of exactly 4 strings [A, B, C, D]
//    correctIndex   → 0, 1, 2, or 3 (index into options[])
//    environment    → optional override; if set, the VR app loads this
//                     environment for this question instead of the
//                     subject-level environment (see config/environments.js)
// ============================================================

const mongoose = require('mongoose');
const { ENVIRONMENTS } = require('../config/environments');

// ── Sub-schema for a single question ────────────────────────
const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type:     String,
      required: [true, 'Question text is required'],
      trim:     true,
    },
    options: {
      // Exactly 4 answer choices
      type:     [String],
      validate: {
        validator: (arr) => arr.length === 4,
        message:   'Each question must have exactly 4 options',
      },
      required: true,
    },
    correctIndex: {
      // 0 = option A, 1 = option B, 2 = option C, 3 = option D
      type:     Number,
      required: [true, 'Correct answer index is required'],
      min:      0,
      max:      3,
    },
    environment: {
      // Optional per-question override. When empty/absent the VR app
      // falls back to the parent subject's environment.
      type:    String,
      enum:    { values: ['', ...ENVIRONMENTS], message: 'Invalid environment: {VALUE}' },
      default: '',
    },
  },
  { _id: true } // Each question gets its own _id (useful for result tracking)
);

// ── Main quiz schema ─────────────────────────────────────────
const quizSchema = new mongoose.Schema(
  {
    subject: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Subject',
      required: [true, 'Subject is required'],
    },
    title: {
      type:     String,
      required: [true, 'Quiz title is required'],
      trim:     true,
    },
    questions: {
      type:     [questionSchema],
      validate: {
        validator: (arr) => arr.length >= 1,
        message:   'Quiz must have at least 1 question',
      },
    },
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Teacher',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
