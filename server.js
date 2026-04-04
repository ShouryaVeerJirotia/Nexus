const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
console.log("Key Loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");
const app = express();

// ✅ 1. Updated CORS
app.use(cors({
    origin: ["http://127.0.0.1:5500", "http://localhost:5500", "https://ainexusbeta.netlify.app"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-custom-key"]
}));

app.use(express.json());

// ✅ 2. TEST ROUTE (Open http://127.0.0.1:5001 in your browser to check this)
app.get("/", (req, res) => {
    res.send("🚀 Nexus Server is LIVE on Port 5001!");
});

// ✅ 3. The Generate Route
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

        if (data.error) {
            return res.status(400).json({ error: data.error.message });
        }

        let rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        const cleanText = jsonMatch ? jsonMatch[0] : "[]";

        res.json({ 
            data: JSON.parse(cleanText),
            modelUsed: "Gemini 2.0 Flash"
        });

    } catch (error) {
        console.error("SERVER ERROR:", error);
        res.status(500).json({ error: "Server Error", data: [] });
    }
});

// ... all your app.get, app.post, and middleware are above this ...

// ✅ Place this at the very end of server.js
const PORT = process.env.PORT || 5001; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live on port ${PORT}`);
    console.log(`📡 Accepting requests from Netlify and local dev`);
});