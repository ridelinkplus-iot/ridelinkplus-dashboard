import cors from "cors";
import express from "express";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, update } from "firebase/database"; // ✅ Realtime DB
import http from "http";
import { Server } from "socket.io";

// -------------------- Firebase Config --------------------
const firebaseConfig = {
  apiKey: "AIzaSyARWCfQFeHb-4OKjJIoeP6oeMajx1nHhkE",
  authDomain: "ridelink-26c32.firebaseapp.com",
  databaseURL: "https://ridelink-26c32-default-rtdb.firebaseio.com",
  projectId: "ridelink-26c32",
  storageBucket: "ridelink-26c32.appspot.com",
  messagingSenderId: "296583693513",
  appId: "1:296583693513:web:3dcf1a741cab1dc22af918",
  measurementId: "G-5STSMT9RWJ",
};

// ✅ Initialize Firebase App
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// -------------------- Express + Socket.IO --------------------
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

let busData = {}; // local cache { busId: { lat, lon, passengers, lastUpdate } }

// ✅ API endpoint for GPS device updates
app.post("/api/update-bus", async (req, res) => {
  try {
    const { busId, lat, lon, passengers } = req.body;

    if (!busId || typeof lat !== "number" || typeof lon !== "number") {
      return res
        .status(400)
        .json({ error: "Missing or invalid busId, lat, or lon" });
    }

    // ✅ Always define passengers as a number (even if 0)
    const passengerCount =
      passengers !== undefined && passengers !== null
        ? Number(passengers)
        : 0;

    // ✅ Update local memory first
    busData[busId] = {
      lat,
      lon,
      passengers: passengerCount,
      lastUpdate: new Date().toISOString(),
    };

    // ✅ Emit update to React clients immediately
    io.emit("busLocationUpdate", {
      busId,
      lat,
      lon,
      passengers: passengerCount,
    });

    // ✅ Then update Firebase atomically
    const busRef = ref(db, `buses/${busId}`);
    await update(busRef, {
      lat,
      lon,
      passengers: passengerCount,
      lastUpdated: Date.now(),
    });

    console.log(
      `✅ Bus ${busId} updated in Firebase: lat=${lat}, lon=${lon}, passengers=${passengerCount}`
    );

    return res.json({
      success: true,
      message: `Bus ${busId} location & passengers updated successfully`,
    });
  } catch (error) {
    console.error("❌ Error updating Firebase:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// ✅ GET endpoint for debugging
app.get("/api/buses", (req, res) => res.json(busData));

// ✅ WebSocket setup
io.on("connection", (socket) => {
  console.log("Frontend connected via Socket.IO");
  socket.emit("initialData", busData);
});

server.listen(4000, () =>
  console.log("🚀 Live API running on http://localhost:4000")
);
