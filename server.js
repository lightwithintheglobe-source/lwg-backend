const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "./orders.json";

// ==========================
// 📦 HELPER FUNCTIONS
// ==========================

// Generate Tracking ID
function generateTrackingId() {
    return "LWG" + Math.floor(100000 + Math.random() * 900000);
}

// Read orders safely
function readOrders() {
    try {
        if (!fs.existsSync(FILE)) return [];
        const data = fs.readFileSync(FILE);
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Save orders safely
function saveOrders(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// ==========================
// 📦 BOOKING API
// ==========================
app.post("/api/book", (req, res) => {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            error: "No booking data received"
        });
    }

    const trackingId = generateTrackingId();

    const newOrder = {
        ...data,
        trackingId,
        status: "Pending",
        location: "Freetown",
        createdAt: new Date().toISOString()
    };

    const orders = readOrders();
    orders.push(newOrder);
    saveOrders(orders);

    res.json({
        success: true,
        trackingId
    });
});

// ==========================
// 📍 TRACKING API
// ==========================
app.get("/api/track/:id", (req, res) => {
    const id = req.params.id;

    const orders = readOrders();
    const order = orders.find(o => o.trackingId === id);

    if (!order) {
        return res.status(404).json({
            error: "Tracking ID not found"
        });
    }

    res.json({
        success: true,
        data: order
    });
});

// ==========================
// ROOT
// ==========================
app.get("/", (req, res) => {
    res.send("🚀 LWG Logistics Backend is Running");
});

// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
