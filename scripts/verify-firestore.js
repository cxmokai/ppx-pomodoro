#!/usr/bin/env node

/**
 * Firebase Admin SDK Verification Script
 *
 * Verifies Firestore connection and document operations using Firebase Admin SDK.
 * This script is used to verify backend Firestore operations during testing.
 *
 * Usage:
 *   node scripts/verify-firestore.js <userId>
 *
 * Example:
 *   node scripts/verify-firestore.js test-user-123
 *
 * Requirements:
 *   - Firebase Admin SDK credentials in GOOGLE_APPLICATION_CREDENTIALS env var
 *   - Or service account key file at ./serviceAccountKey.json
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
function initializeFirebase() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  // Try to load credentials from environment or file
  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const defaultPath = path.join(__dirname, '..', 'serviceAccountKey.json');

  let credential;

  if (credPath && fs.existsSync(credPath)) {
    credential = admin.credential.cert(credPath);
  } else if (fs.existsSync(defaultPath)) {
    credential = admin.credential.cert(defaultPath);
  } else {
    console.error('❌ No Firebase credentials found');
    console.error(
      '   Set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccountKey.json in project root'
    );
    process.exit(1);
  }

  return admin.initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID || 'ppx-pomodoro',
  });
}

// Verify Firestore document exists
async function verifyDocument(userId, collection = 'users') {
  const db = admin.firestore();

  try {
    const docRef = db.collection(collection).doc(userId);
    const doc = await docRef.get();

    if (doc.exists) {
      console.log(`✅ Document found in ${collection}/${userId}`);
      console.log('   Data:', JSON.stringify(doc.data(), null, 2));
      return { success: true, data: doc.data() };
    } else {
      console.log(`⚠️  Document not found: ${collection}/${userId}`);
      return { success: false, error: 'Document not found' };
    }
  } catch (error) {
    console.error(`❌ Error reading document: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Verify user's pomodoros subcollection
async function verifyPomodoros(userId, limit = 5) {
  const db = admin.firestore();

  try {
    const pomodorosRef = db
      .collection('users')
      .doc(userId)
      .collection('pomodoros');
    const snapshot = await pomodorosRef
      .orderBy('startTime', 'desc')
      .limit(limit)
      .get();

    if (snapshot.empty) {
      console.log(`ℹ️  No pomodoros found for user ${userId}`);
      return { success: true, count: 0, pomodoros: [] };
    }

    const pomodoros = [];
    snapshot.forEach((doc) => {
      pomodoros.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ Found ${snapshot.size} pomodoros for user ${userId}`);
    pomodoros.forEach((pom, idx) => {
      console.log(
        `   ${idx + 1}. ${pom.id}: ${pom.task || 'No task'} (${pom.duration}min)`
      );
    });

    return { success: true, count: snapshot.size, pomodoros };
  } catch (error) {
    console.error(`❌ Error reading pomodoros: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main verification function
async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('Usage: node scripts/verify-firestore.js <userId>');
    process.exit(1);
  }

  console.log(`🔍 Verifying Firestore for user: ${userId}\n`);

  initializeFirebase();

  // Verify user document
  console.log('1. Checking user document...');
  const userResult = await verifyDocument(userId, 'users');
  console.log();

  // Verify pomodoros
  console.log('2. Checking pomodoros...');
  const pomodorosResult = await verifyPomodoros(userId);
  console.log();

  // Summary
  console.log('═══════════════════════════════════════');
  console.log('VERIFICATION SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(
    `User Document: ${userResult.success ? '✅ Found' : '❌ Not found'}`
  );
  console.log(
    `Pomodoros: ${pomodorosResult.success ? `✅ ${pomodorosResult.count} found` : '❌ Error'}`
  );
  console.log('═══════════════════════════════════════\n');

  process.exit(userResult.success && pomodorosResult.success ? 0 : 1);
}

// Run main function
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { verifyDocument, verifyPomodoros };
