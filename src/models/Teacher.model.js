// ============================================================
//  Teacher.model.js — Teacher (User) Schema
// ============================================================
//
//  A Mongoose "Schema" defines the shape of a document in
//  MongoDB. Think of it like a table definition in SQL.
//
//  The Teacher model represents a teacher account that can
//  log into the dashboard, create lessons and quizzes, and
//  view student results.
//
//  Fields:
//    name      — teacher's display name
//    email     — unique login identifier
//    password  — hashed password (we NEVER store plain text!)
//    createdAt — automatically set by Mongoose timestamps
// ============================================================

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const teacherSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: 6,
      // 'select: false' means the password field is NOT returned
      // in queries by default — extra safety layer.
      select:   false,
    },
  },
  {
    // Automatically adds `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);

// ── Pre-save hook: Hash the password before saving ───────────
//
//  Every time a teacher document is saved AND the password
//  field was modified, we hash it using bcrypt (cost factor 12).
//  Hashing is a one-way transformation — you can verify a
//  plaintext password against the hash, but you can't reverse it.
//
teacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Instance method: Compare entered password with hash ──────
//
//  Used during login to check if the provided password matches
//  the stored hash without ever decrypting it.
//
teacherSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Teacher', teacherSchema);
