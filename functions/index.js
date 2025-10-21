const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.listUsers = functions.https.onCall(async (data, context) => {
  try {
    // Security check: only allow admin user (optional)
    if (!context.auth || context.auth.token.email !== "ridelinkplus@gmail.com") {
      throw new functions.https.HttpsError("permission-denied", "Unauthorized access.");
    }

    const listUsersResult = await admin.auth().listUsers(1000); // Up to 1000 users
    const users = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      disabled: userRecord.disabled,
    }));

    return { users };
  } catch (error) {
    console.error("Error listing users:", error);
    throw new functions.https.HttpsError("unknown", error.message);
  }
});

exports.deleteUser = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth || context.auth.token.email !== "ridelinkplus@gmail.com") {
      throw new functions.https.HttpsError("permission-denied", "Unauthorized access.");
    }

    const { uid } = data;
    await admin.auth().deleteUser(uid);
    return { success: true, message: `User ${uid} deleted successfully.` };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new functions.https.HttpsError("unknown", error.message);
  }
});
