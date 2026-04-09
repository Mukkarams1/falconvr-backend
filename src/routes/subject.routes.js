// ============================================================
//  subject.routes.js — Subject Routes
//  Mounted at: /api/v1/subjects
// ============================================================

const express = require('express');
const {
  getSubjects, createSubject, getSubject,
  updateSubject, deleteSubject,
} = require('../controllers/subject.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// GET all / POST new — both need protect so only teachers can write
// GET all is also used by VR app — for VR, remove protect from GET if needed
router
  .route('/')
  .get(getSubjects)          // VR app + dashboard can read without auth
  .post(protect, createSubject); // only teachers can create

router
  .route('/:id')
  .get(getSubject)
  .put(protect, updateSubject)
  .delete(protect, deleteSubject);

module.exports = router;
