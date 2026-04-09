// ============================================================
//  quiz.routes.js — Quiz Routes
//  Mounted at: /api/v1/quizzes
// ============================================================

const express = require('express');
const {
  getQuizzes, getQuizBySubject,
  createQuiz, updateQuiz, deleteQuiz,
} = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public — VR app fetches quiz for selected subject
router.get('/subject/:subjectId', getQuizBySubject);

router
  .route('/')
  .get(protect, getQuizzes)
  .post(protect, createQuiz);

router
  .route('/:id')
  .put(protect, updateQuiz)
  .delete(protect, deleteQuiz);

module.exports = router;
