// ============================================================
//  result.controller.js — Quiz Result Submission & Retrieval
// ============================================================
//
//  This is the most important endpoint for the Unity VR app.
//  After a student finishes the quiz, Unity sends a POST
//  request here with the student's answers.
//
//  The controller:
//    1. Receives the submission
//    2. Looks up the quiz to get correct answers
//    3. Scores each answer (isCorrect: true/false)
//    4. Calculates total score
//    5. Saves the QuizResult document
//
//  Unity POST body format:
//    {
//      "studentName": "Alex Smith",
//      "subjectId": "<mongoId>",
//      "quizId": "<mongoId>",
//      "answers": [
//        { "questionId": "<mongoId>", "selectedIndex": 2 },
//        { "questionId": "<mongoId>", "selectedIndex": 0 },
//        ...
//      ]
//    }
//
//  Endpoints:
//    POST /api/v1/results            — submit quiz result (VR app)
//    GET  /api/v1/results            — all results (dashboard)
//    GET  /api/v1/results/subject/:id — results for one subject
// ============================================================

const QuizResult = require('../models/QuizResult.model');
const Quiz       = require('../models/Quiz.model');

// ── POST submit result (called by Unity VR app) ──────────────
const submitResult = async (req, res) => {
  try {
    const { studentName, subjectId, quizId, answers } = req.body;

    // Validate required fields
    if (!studentName || !subjectId || !quizId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'studentName, subjectId, quizId and answers are required',
      });
    }

    // Fetch the quiz to get correct answers for scoring
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Build a map of questionId → correctIndex for fast lookup
    const correctMap = {};
    quiz.questions.forEach((q) => {
      correctMap[q._id.toString()] = q.correctIndex;
    });

    // Score each answer
    let score = 0;
    const scoredAnswers = answers.map((ans) => {
      const correct = correctMap[ans.questionId];
      const isCorrect = correct !== undefined && ans.selectedIndex === correct;
      if (isCorrect) score++;
      return {
        questionId:    ans.questionId,
        selectedIndex: ans.selectedIndex,
        isCorrect,
      };
    });

    // Save result to database
    const result = await QuizResult.create({
      studentName,
      subject:        subjectId,
      quiz:           quizId,
      answers:        scoredAnswers,
      score,
      totalQuestions: quiz.questions.length,
    });

    res.status(201).json({
      success: true,
      message: 'Result submitted successfully',
      result: {
        id:             result._id,
        studentName:    result.studentName,
        score:          result.score,
        totalQuestions: result.totalQuestions,
        percentage:     Math.round((score / quiz.questions.length) * 100),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET all results (dashboard) ──────────────────────────────
const getResults = async (req, res) => {
  try {
    const results = await QuizResult.find()
      .populate('subject', 'name icon')
      .populate('quiz', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET results for a specific subject ───────────────────────
const getResultsBySubject = async (req, res) => {
  try {
    const results = await QuizResult.find({ subject: req.params.subjectId })
      .populate('subject', 'name icon')
      .populate('quiz', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: results.length, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET single result ─────────────────────────────────────────
const getResult = async (req, res) => {
  try {
    const result = await QuizResult.findById(req.params.id)
      .populate('subject', 'name icon')
      .populate({
        path:  'quiz',
        select: 'title questions',
      });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitResult, getResults, getResultsBySubject, getResult };
