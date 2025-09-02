const express = require("express");
const mqtt = require("mqtt");
const mysql = require("mysql2/promise");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const port = 7000;
const httpServer = createServer(app);

// -------------------- Socket.IO --------------------
const io = new Server(httpServer, {
  cors: {
    origin: "*", // ปรับตามที่ frontend เรียกใช้
  },
});

// -------------------- JWT --------------------
const JWT_SECRET = "123456"; // ⚠️ ควรเปลี่ยนในระบบจริง

// Middleware
app.use(cors());
app.use(express.json());

// -------------------- MySQL --------------------
const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "123456",
  database: "iot",
});

// -------------------- MQTT --------------------
const MQTT_SERVER = "mqtt://broker.hivemq.com";
const mqtt_id = "kruoak_new1_" + Math.random().toString(16).substr(2, 8);
console.log(`กำลังเชื่อมต่อไปยัง MQTT Broker ที่: ${MQTT_SERVER}`);

const client = mqtt.connect(MQTT_SERVER, { clientId: mqtt_id });

client.on("connect", () => {
  console.log("เชื่อมต่อกับ MQTT Broker สำเร็จแล้ว!");
  // subscribe topic ที่ใช้ส่งสถานะสวิตช์กลับมา
  client.subscribe("NutgzTv/sw1", (err) => {
    if (!err) {
      console.log("📡 กำลังฟังหัวข้อ NutgzTv/sw1");
    }
  });
});

client.on("message", (topic, message) => {
  const msg = message.toString();
  console.log("📩 ได้รับจาก MQTT:", topic, "=", msg);

  if (topic === "NutgzTv/sw1") {
    // ส่งค่ากลับไปหา frontend
    io.emit("สวิตไฟ", msg);
    console.log("📤 ส่งค่าไปยัง frontend (socket.io):", msg);
  }
});

client.on("error", (err) => {
  console.error("เกิดข้อผิดพลาดกับ MQTT:", err);
});

// -------------------- SOCKET.IO Events --------------------
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  // รับค่าจาก frontend แล้วส่งไป MQTT
  socket.on("update_light", (value) => {
    console.log("💡 ได้รับสถานะหลอดไฟ:", value);
    client.publish("NutgzTv/sw1", String(value));
  });

  socket.on("update_power", (value) => {
    console.log("🔌 ได้รับสถานะระบบ:", value);
    client.publish("NutgzTv/sw1", String(value));
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// -------------------- API --------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      });
    }

    const user = rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: "ok",
      data: user,
      token,
      message: "เข้าสู่ระบบสำเร็จ",
    });
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ",
    });
  }
});

// root
app.get("/", (req, res) => {
  res.send("🚀 Server ทำงานปกติ");
});

// -------------------- Start Server --------------------
httpServer.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
