// ============================================================
//  subject.controller.js — Subject CRUD
// ============================================================
//
//  Subjects are the top-level categories students choose in VR.
//  The teacher manages these from the dashboard.
//
//  Endpoints:
//    GET    /api/v1/subjects          — list all active subjects
//    POST   /api/v1/subjects          — create a new subject
//    GET    /api/v1/subjects/:id      — get one subject
//    PUT    /api/v1/subjects/:id      — update a subject
//    DELETE /api/v1/subjects/:id      — deactivate a subject
//
//  The VR app (Unity) also calls GET /api/v1/subjects to show
//  the subject selection screen to students.
// ============================================================

const Subject = require('../models/Subject.model');

// ── GET all subjects ─────────────────────────────────────────
const getSubjects = async (req, res) => {
  try {
    // populate('createdBy', 'name') replaces the ObjectId with
    // the teacher's name field from the Teacher collection
    const subjects = await Subject.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: subjects.length, subjects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST create subject ──────────────────────────────────────
const createSubject = async (req, res) => {
  try {
    const { name, description, icon, environment } = req.body;

    // Only block if an *active* subject with this name already exists.
    // Deactivated subjects don't count, so their names can be reused.
    const duplicate = await Subject.findOne({ name: name?.trim(), isActive: true });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'A subject with this name already exists',
      });
    }

    const subject = await Subject.create({
      name,
      description,
      icon,
      environment,
      createdBy: req.teacher._id,
    });

    res.status(201).json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET single subject ───────────────────────────────────────
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('createdBy', 'name');
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.status(200).json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PUT update subject ───────────────────────────────────────
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.status(200).json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── DELETE (soft-delete) subject ─────────────────────────────
//  We set isActive: false rather than hard-deleting, so we
//  don't lose historical quiz results for that subject.
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }
    res.status(200).json({ success: true, message: 'Subject deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSubjects, createSubject, getSubject, updateSubject, deleteSubject };
