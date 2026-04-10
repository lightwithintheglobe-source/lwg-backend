const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "./orders.json";

// Generate Tracking ID
function generateTrackingId() {
    return "LWG" + Math.floor(100000 + Math.random() * 900000);
}

// Booking API
app.post("/api/book", (req, res) => {
    const data = req.body;

    const trackingId = generateTrackingId();
    data.trackingId = trackingId;
    data.status = "Pending";
    data.location = "Freetown";

    let orders = [];

    if (fs.existsSync(FILE)) {
        orders = JSON.parse(fs.readFileSync(FILE));
    }

    orders.push(data);
    fs.writeFileSync(FILE, JSON.stringify(orders, null, 2));

    res.json({
        message: "Booking saved",
        trackingId: trackingId
    });
});

// Tracking API
app.get("/api/track/:id", (req, res) => {
    const id = req.params.id;

    if (!fs.existsSync(FILE)) {
        return res.json({ error: "No orders found" });
    }

    const orders = JSON.parse(fs.readFileSync(FILE));

    const order = orders.find(o => o.trackingId === id);

    if (!order) {
        return res.json({ error: "Tracking ID not found" });
    }

    res.json(order);
});

// PORT FIX FOR RENDER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});