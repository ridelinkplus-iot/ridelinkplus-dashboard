const admin = require("firebase-admin");

// IMPORTANT: Replace with the path to your service account key file.
// You can download this from your Firebase project settings.
// Go to Project settings > Service accounts > Generate new private key.
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const userEmail = process.argv[2];

if (!userEmail) {
  console.error("Please provide the user's email as an argument.");
  process.exit(1);
}

async function setAdminClaim(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`Successfully set admin claim for user: ${email}`);
  } catch (error) {
    console.error("Error setting admin claim:", error);
    process.exit(1);
  }
}

setAdminClaim(userEmail);
