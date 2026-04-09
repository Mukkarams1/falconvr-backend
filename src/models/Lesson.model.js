// ============================================================
//  Lesson.model.js — Lesson Schema
// ============================================================
//
//  A Lesson is a block of text content that a student reads
//  on a virtual screen in VR before attempting the quiz.
//
//  Each lesson belongs to ONE subject. If a teacher updates
//  a lesson for Maths, the new content shows in VR next time.
//
//  Fields:
//    subject    — which subject this lesson belongs to
//    title      — e.g. "Introduction to Fractions"
//    content    — the lesson body (paragraphs of text)
//    createdBy  — the teacher who wrote it
// ============================================================

const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    subject: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Subject',
      required: [true, 'Subject is required'],
    },
    title: {
      type:     String,
      required: [true, 'Lesson title is required'],
      trim:     true,
    },
    content: {
      // The body of the lesson — plain text paragraphs.
      // The VR app will display this on a large readable screen.
      type:     String,
      required: [true, 'Lesson content is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Teacher',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lesson', lessonSchema);
