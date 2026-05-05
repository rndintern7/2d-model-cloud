const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.static('public')); // This serves your HTML file

const upload = multer({ storage: multer.memoryStorage() });

// 1. REPLACE WITH YOUR ACTUAL API KEY
const genAI = new GoogleGenerativeAI("AIzaSyCPp6SYIYdj1ZXz-OWw8sWPGuUmJDxUJNI");

app.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        console.log("AI is analyzing the sketch...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        const prompt = `Act as an industrial engineer. I am providing a rough sketch. 
        Identify all components (pumps, valves, tanks, pipes). 
        Return ONLY a JSON array with:
        {"name": "Part Name", "x": horizontal_position, "y": vertical_position, "specs": "brief tech specs"}
        Scale the coordinates for an 800x500 area.`;

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text().replace(/```json|```/g, "").trim();
        
        console.log("AI found:", responseText);
        res.json(JSON.parse(responseText));
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 AI Server running on http://localhost:${PORT}`);
});
