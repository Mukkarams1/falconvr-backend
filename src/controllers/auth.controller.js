// ============================================================
//  auth.controller.js — Register & Login Logic
// ============================================================
//
//  Controllers contain the actual business logic for each
//  route. They receive (req, res) from Express and return
//  a JSON response.
//
//  This file handles:
//    POST /api/v1/auth/register  — create a new teacher account
//    POST /api/v1/auth/login     — log in and receive a JWT
//    GET  /api/v1/auth/me        — get current logged-in teacher
// ============================================================

const jwt     = require('jsonwebtoken');
const Teacher = require('../models/Teacher.model');

// ── Helper: create and sign a JWT ───────────────────────────
const signToken = (id) => {
  return jwt.sign(
    { id },                        // payload: just the teacher's DB id
    process.env.JWT_SECRET,        // secret key from .env
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// ── Helper: send token in response ──────────────────────────
const sendTokenResponse = (teacher, statusCode, res) => {
  const token = signToken(teacher._id);
  res.status(statusCode).json({
    success: true,
    token,
    teacher: {
      id:    teacher._id,
      name:  teacher.name,
      email: teacher.email,
    },
  });
};

// ── POST /api/v1/auth/register ───────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already in use
    const existing = await Teacher.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create teacher — password is hashed automatically via pre-save hook
    const teacher = await Teacher.create({ name, email, password });
    sendTokenResponse(teacher, 201, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── POST /api/v1/auth/login ──────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // We need the password field — it's hidden by default (select: false)
    const teacher = await Teacher.findOne({ email }).select('+password');
    if (!teacher) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await teacher.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendTokenResponse(teacher, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/v1/auth/me ──────────────────────────────────────
const getMe = async (req, res) => {
  // req.teacher is set by the protect middleware
  res.status(200).json({
    success: true,
    teacher: {
      id:    req.teacher._id,
      name:  req.teacher.name,
      email: req.teacher.email,
    },
  });
};

module.exports = { register, login, getMe };
