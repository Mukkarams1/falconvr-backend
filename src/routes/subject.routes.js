// ============================================================
//  subject.routes.js — Subject Routes
//  Mounted at: /api/v1/subjects
// ============================================================

const express = require('express');
const {
  getSubjects, createSubject, getSubject,
  getSubjectEnvironment, updateSubject, deleteSubject,
} = require('../controllers/subject.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router
  .route('/')
  .get(getSubjects)
  .post(protect, createSubject);

// Must be declared before /:id so Express doesn't treat "environment" as an id
router.get('/:id/environment', getSubjectEnvironment);

router
  .route('/:id')
  .get(getSubject)
  .put(protect, updateSubject)
  .delete(protect, deleteSubject);

module.exports = router;
