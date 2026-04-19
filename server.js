const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const app = express();

// ✅ FIX 1: Update CORS to allow requests from the Android App
// Native apps often send a 'null' or no origin at all.
app.use(cors({
    origin: "*", // Allows all origins, necessary for mobile apps to connect
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-custom-key"]
}));

app.use(express.json({ limit: '10mb' })); // Increased limit for attachments/PDFs

app.get("/", (req, res) => {
    res.send("🚀 Nexus Server is LIVE and ready for Mobile Link!");
});

// Feedback Route
app.post("/api/feedback", (req, res) => {
    const { feedback, timestamp } = req.body;
    const logEntry = `[${timestamp}] FEEDBACK: ${feedback}\n--------------------------\n`;
    console.log("📥 NEW INTEL:", feedback);
    fs.appendFile("feedback.log", logEntry, (err) => {
        if (err) console.error("Failed to save intel:", err);
    });
    res.status(200).json({ success: true, message: "Intel Transmitted" });
});

// Generate Route
app.post("/generate", async (req, res) => {
    try {
        const { prompt, customKey, attachment } = req.body;

        const apiKeyToUse = (customKey && customKey.trim() !== "") 
            ? customKey 
            : process.env.GEMINI_API_KEY;

        const genAI = new GoogleGenerativeAI(apiKeyToUse);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const contentItems = [prompt];
        if (attachment) {
            contentItems.push(attachment);
        }

        const result = await model.generateContent(contentItems);
        const response = await result.response;
        let text = response.text();

        // Clean up text in case Gemini adds markdown backticks
        const cleanJson = text.replace(/```json|```/g, "").trim();
        
        try {
            res.json({ 
                data: JSON.parse(cleanJson), 
                modelUsed: customKey ? "Personal Satellite Link" : "Nexus Shared Engine" 
            });
        } catch (parseError) {
            // If Gemini sends plain text instead of JSON, send it as a raw string
            res.json({ data: text, modelUsed: "Nexus Raw Link" });
        }

    } catch (error) {
        console.error("Neural Link Error:", error);
        res.status(500).json({ error: "API Failure: " + error.message });
    }
});

// ✅ FIX 2: Correct Binding for Render
const PORT = process.env.PORT || 5001; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});