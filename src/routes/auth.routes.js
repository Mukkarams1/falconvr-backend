// ============================================================
//  auth.routes.js — Authentication Routes
// ============================================================
//
//  Express Router groups related routes together.
//  These routes are mounted at /api/v1/auth in server.js.
//
//  Public routes (no auth needed):
//    POST /api/v1/auth/register
//    POST /api/v1/auth/login
//
//  Protected routes (JWT required):
//    GET  /api/v1/auth/me
// ============================================================

const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);

module.exports = router;
