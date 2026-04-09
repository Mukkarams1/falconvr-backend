// ============================================================
//  quiz.controller.js — Quiz CRUD
// ============================================================
//
//  Teachers build quizzes from the dashboard.
//  The VR app fetches the quiz for a subject and runs it.
//
//  IMPORTANT for Unity integration:
//    The VR app calls GET /api/v1/quizzes/subject/:subjectId
//    to get the quiz. The response includes all questions and
//    their options, but NOT the correctIndex — so students
//    can't cheat by inspecting the response. The correctIndex
//    is only used server-side when scoring results.
//
//    Actually for MVP simplicity, we do include correctIndex
//    since VR apps don't expose network tabs easily. You can
//    strip it later if needed.
//
//  Endpoints:
//    GET    /api/v1/quizzes                  — all quizzes (dashboard)
//    GET    /api/v1/quizzes/subject/:id      — quiz for subject (VR)
//    POST   /api/v1/quizzes                  — create quiz
//    PUT    /api/v1/quizzes/:id              — update quiz
//    DELETE /api/v1/quizzes/:id              — delete quiz
// ============================================================

const Quiz = require('../models/Quiz.model');

// ── GET all quizzes ──────────────────────────────────────────
const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('subject', 'name icon')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: quizzes.length, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET quiz by subject (used by VR app) ─────────────────────
const getQuizBySubject = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ subject: req.params.subjectId })
      .populate('subject', 'name icon');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'No quiz found for this subject' });
    }
    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST create quiz ─────────────────────────────────────────
const createQuiz = async (req, res) => {
  try {
    const { subject, title, questions } = req.body;

    // One quiz per subject rule
    const existing = await Quiz.findOne({ subject });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A quiz already exists for this subject. Use PUT to update it.',
      });
    }

    const quiz = await Quiz.create({
      subject,
      title,
      questions,
      createdBy: req.teacher._id,
    });

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT update quiz ──────────────────────────────────────────
const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject', 'name');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.status(200).json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE quiz ──────────────────────────────────────────────
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.status(200).json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getQuizzes, getQuizBySubject, createQuiz, updateQuiz, deleteQuiz };
