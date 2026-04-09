// ============================================================
//  lesson.routes.js — Lesson Routes
//  Mounted at: /api/v1/lessons
// ============================================================

const express = require('express');
const {
  getLessons, getLessonBySubject,
  createLesson, updateLesson, deleteLesson,
} = require('../controllers/lesson.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// VR app uses this to fetch the lesson for a selected subject
router.get('/subject/:subjectId', getLessonBySubject);

router
  .route('/')
  .get(protect, getLessons)
  .post(protect, createLesson);

router
  .route('/:id')
  .put(protect, updateLesson)
  .delete(protect, deleteLesson);

module.exports = router;
