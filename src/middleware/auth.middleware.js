// ============================================================
//  auth.middleware.js — JWT Authentication Guard
// ============================================================
//
//  This middleware protects routes that require a logged-in
//  teacher. It works like a bouncer at a door.
//
//  How JWT authentication works:
//    1. Teacher logs in → server creates a JWT (JSON Web Token)
//       and sends it to the client.
//    2. Client stores the JWT (in memory / localStorage).
//    3. On every protected request, the client sends the JWT
//       in the Authorization header:
//         Authorization: Bearer <token>
//    4. This middleware intercepts the request, extracts the
//       token, and verifies it using the JWT_SECRET.
//    5. If valid → attaches teacher info to req.teacher and
//       calls next() to proceed to the route handler.
//    6. If invalid / missing → returns 401 Unauthorized.
//
//  Important: The JWT does NOT store the password. It only
//  stores the teacher's ID and expiry time. It's cryptographically
//  signed, so tampering breaks the signature.
// ============================================================

const jwt     = require('jsonwebtoken');
const Teacher = require('../models/Teacher.model');

const protect = async (req, res, next) => {
  let token;

  // Check for Authorization header in format: "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorised — please log in',
    });
  }

  try {
    // Verify the token signature and decode its payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the teacher document to req so routes can use it
    // (e.g. req.teacher._id to know who is making the request)
    req.teacher = await Teacher.findById(decoded.id);

    if (!req.teacher) {
      return res.status(401).json({
        success: false,
        message: 'Teacher account no longer exists',
      });
    }

    next(); // ✅ Token valid — proceed to the route
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token is invalid or expired — please log in again',
    });
  }
};

module.exports = { protect };
