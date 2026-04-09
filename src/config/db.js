// ============================================================
//  db.js — MongoDB Connection
// ============================================================
//
//  This file handles connecting to MongoDB using Mongoose.
//  Mongoose is an ODM (Object Data Modelling) library that
//  lets us define "schemas" (blueprints) for our data and
//  interact with MongoDB using clean JavaScript objects.
//
//  We export a single function `connectDB` that is called
//  once when the server starts up.
// ============================================================

const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use IPv4 for DNS lookups.
// On Windows, the default DNS resolver sometimes can't handle MongoDB Atlas
// SRV records (mongodb+srv://), causing "querySrv ECONNREFUSED" errors.
// Setting the result order to IPv4 first fixes this.
dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // family: 4 forces IPv4 — additional guard for Windows DNS resolution
      family: 4,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Exit the process with failure code — no point running without DB
    process.exit(1);
  }
};

module.exports = connectDB;
