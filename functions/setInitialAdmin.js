const admin = require("firebase-admin");

// Initialize the Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json"); // You'll need to create this file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = "ridelinkplus@gmail.com"; // Replace with the email of the user you want to make an admin

admin
  .auth()
  .getUserByEmail(email)
  .then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log(`Successfully made ${email} an admin.`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error setting admin claim:", error);
    process.exit(1);
  });
