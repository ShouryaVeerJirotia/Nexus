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

        // 🛡️ Priority Logic: Use Custom Key if provided, else Global Env Key
        const apiKeyToUse = (customKey && customKey.trim() !== "") 
            ? customKey 
            : process.env.GEMINI_API_KEY;

        // Initialize Google AI with the selected key
        const genAI = new GoogleGenerativeAI(apiKeyToUse);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Clean JSON formatting from AI response
        const cleanJson = text.replace(/```json|```/g, "").trim();
        
        // Send back the data and a label for the UI
        res.json({ 
            data: JSON.parse(cleanJson), 
            modelUsed: customKey ? "Personal Satellite Link" : "Nexus Shared Engine" 
        });

    } catch (error) {
        console.error("Neural Link Error:", error);
        res.status(500).json({ error: "API Failure: " + error.message });
    }
});

const PORT = process.env.PORT || 5001; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
});