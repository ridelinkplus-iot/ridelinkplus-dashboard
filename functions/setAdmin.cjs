exports.setAdminClaim = functions.https.onCall(async (data, context) => {
  // Only allow this if called by an existing admin or use Firebase Console
  const { uid } = data;
  
  await admin.auth().setCustomUserClaims(uid, { admin: true });
  return { message: `Success! ${uid} is now an admin.` };
});