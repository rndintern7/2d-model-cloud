const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());

// This handles serving your index.html automatically
app.use(express.static(__dirname));

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI("AIzaSyCPp6SYIYdj1ZXz-OWw8sWPGuUmJDxUJNI");

// Explicitly send index.html when someone visits the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = "Analyze this industrial sketch. Return ONLY a JSON array of components with 'name', 'x', 'y', and 'specs'. Scale for 800x500.";
        
        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text().replace(/```json|```/g, "").trim();
        res.json(JSON.parse(text));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(3000, () => console.log("🚀 AI Engine Online on Port 3000"));
