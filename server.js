const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs"); // ✅ Added for saving feedback
const { GoogleGenerativeAI } = require("@google/generative-ai");

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
        const { prompt, customKey } = req.body;

        // 🛡️ Priority Logic
        const apiKeyToUse = (customKey && customKey.trim() !== "") 
            ? customKey 
            : process.env.GEMINI_API_KEY;

        if (!apiKeyToUse) {
            throw new Error("No API Key detected. Engine Offline.");
        }

        // Initialize inside the route to ensure scope is fresh
        const genAI = new GoogleGenerativeAI(apiKeyToUse);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean & Parse
        const cleanJson = text.replace(/```json|```/g, "").trim();
        const parsedData = JSON.parse(cleanJson);
        
        res.json({ 
            data: parsedData, 
            modelUsed: customKey ? "Personal Satellite Link" : "Nexus Shared Engine" 
        });

    } catch (error) {
        console.error("Neural Link Error:", error.message);
        // This will tell you EXACTLY what's wrong in the Render logs
        res.status(500).json({ error: "API Failure: " + error.message });
    }
});

const PORT = process.env.PORT || 5001; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});