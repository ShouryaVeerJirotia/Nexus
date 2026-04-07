const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs"); // ✅ Added for saving feedback

dotenv.config();
console.log("Key Loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");
const app = express();

app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500", "https://ainexusbeta.netlify.app"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-custom-key"]
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("🚀 Nexus Server is LIVE on Port 5001!");
});

// ✅ Feedback Route
app.post("/api/feedback", (req, res) => {
    const { feedback, timestamp } = req.body;
    
    const logEntry = `[${timestamp}] FEEDBACK: ${feedback}\n--------------------------\n`;
    
    // Log to console for real-time monitoring
    console.log("📥 NEW INTEL:", feedback);

    // Save to a local file
    fs.appendFile("feedback.log", logEntry, (err) => {
        if (err) console.error("Failed to save intel:", err);
    });

    res.status(200).json({ success: true, message: "Intel Transmitted" });
});

// ✅ The Generate Route (Keeping your existing logic)
app.post("/generate", async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                }),
            }
        );

        const data = await response.json();
        if (data.error) return res.status(400).json({ error: data.error.message });

        let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        const cleanText = jsonMatch ? jsonMatch[0] : "[]";

        res.json({ 
            data: JSON.parse(cleanText),
            modelUsed: "Gemini 2.5 Flash"
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ error: "Server Error", data: [] });
    }
});

const PORT = process.env.PORT || 5001; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});