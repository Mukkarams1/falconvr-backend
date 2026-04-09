// ============================================================
//  lesson.controller.js — Lesson CRUD
// ============================================================
//
//  Teachers create lesson text content per subject.
//  The VR app fetches the lesson for the selected subject and
//  displays it on a virtual screen before the quiz begins.
//
//  Key design choice: one lesson per subject (we upsert).
//  If a teacher wants to update Maths lesson, it replaces
//  the existing one.
//
//  Endpoints:
//    GET  /api/v1/lessons              — all lessons (dashboard)
//    GET  /api/v1/lessons/subject/:id  — lesson for a subject (VR app)
//    POST /api/v1/lessons              — create a lesson
//    PUT  /api/v1/lessons/:id          — update a lesson
//    DELETE /api/v1/lessons/:id        — delete a lesson
// ============================================================

const Lesson = require('../models/Lesson.model');

// ── GET all lessons ──────────────────────────────────────────
const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find()
      .populate('subject', 'name icon')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: lessons.length, lessons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET lesson by subject ID (used by VR app) ────────────────
const getLessonBySubject = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ subject: req.params.subjectId })
      .populate('subject', 'name icon');
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'No lesson found for this subject' });
    }
    res.status(200).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST create lesson ───────────────────────────────────────
const createLesson = async (req, res) => {
  try {
    const { subject, title, content } = req.body;

    // Check if a lesson already exists for this subject
    const existing = await Lesson.findOne({ subject });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A lesson already exists for this subject. Use PUT to update it.',
      });
    }

    const lesson = await Lesson.create({
      subject,
      title,
      content,
      createdBy: req.teacher._id,
    });

    res.status(201).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT update lesson ────────────────────────────────────────
const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('subject', 'name');

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, lesson });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE lesson ────────────────────────────────────────────
const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndDelete(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }
    res.status(200).json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLessons, getLessonBySubject, createLesson, updateLesson, deleteLesson };
