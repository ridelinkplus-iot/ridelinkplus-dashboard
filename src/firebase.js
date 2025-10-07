import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // ✅ This is Realtime DB

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyARWCfQFeHb-4OKjJIoeP6oeMajx1nHhkE",
  authDomain: "ridelink-26c32.firebaseapp.com",
  databaseURL: "https://ridelink-26c32-default-rtdb.firebaseio.com", // ✅ Make sure this is correct
  projectId: "ridelink-26c32",
  storageBucket: "ridelink-26c32.appspot.com",
  messagingSenderId: "296583693513",
  appId: "1:296583693513:web:3dcf1a741cab1dc22af918",
  measurementId: "G-5STSMT9RWJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // ✅ Use Realtime DB, not Firestore
const analytics = getAnalytics(app);

export { analytics, db };

