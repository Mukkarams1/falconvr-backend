// ============================================================
//  Subject.model.js — Subject Schema
// ============================================================
//
//  A Subject is a top-level category like "Maths", "Science",
//  or "History". In the VR app, students pick a subject first,
//  which then shows them the available lesson and quiz for it.
//
//  Fields:
//    name        — e.g. "Mathematics", "Science", "History"
//    description — short text shown to the student in VR
//    icon        — emoji or icon identifier for UI (e.g. "📐")
//    environment — VR scene to load for this subject (see config/environments.js)
//    createdBy   — reference to the Teacher who created it
//    isActive    — if false, hidden from students in VR
// ============================================================

const mongoose = require('mongoose');
const { ENVIRONMENTS } = require('../config/environments');

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Subject name is required'],
      trim:     true,
      // No unique index here — uniqueness among active subjects is enforced
      // in the controller so that deactivated names can be reused.
    },
    description: {
      type:    String,
      default: '',
      trim:    true,
    },
    icon: {
      type:    String,
      default: '📚',
    },
    environment: {
      type:     String,
      enum:     { values: ENVIRONMENTS, message: 'Invalid environment: {VALUE}' },
      required: [true, 'Environment is required'],
    },
    createdBy: {
      // This stores a reference to a Teacher document's _id.
      // Mongoose can "populate" this to replace the ID with the
      // full Teacher object when needed.
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Teacher',
      required: true,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subject', subjectSchema);
