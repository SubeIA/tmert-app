import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Set admin role for a user by email
 * Usage: npm run set-admin your-email@example.com
 */
async function setAdminClaim(email: string) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);

    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      role: 'admin',
    });

    // Update Firestore user document
    await admin.firestore().collection('users').doc(user.uid).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`✅ Successfully set admin role for user: ${email}`);
    console.log(`   User ID: ${user.uid}`);
    console.log(
      '\n⚠️  The user needs to sign out and sign in again for the changes to take effect.'
    );

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting admin claim:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: npm run set-admin your-email@example.com');
  process.exit(1);
}

setAdminClaim(email);
