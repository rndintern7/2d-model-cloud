const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); 

const upload = multer({ storage: multer.memoryStorage() });

// ⚠️ PASTE YOUR BRAND NEW API KEY BELOW
const genAI = new GoogleGenerativeAI("PASTE_NEW_KEY_HERE");

// This ensures the website loads when you open the URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        console.log("AI is processing the sketch...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        
        const prompt = `Act as an industrial engineer. Identify components in this sketch.
        Return ONLY a valid JSON array of objects with: 
        "name" (component name), "x" (0-700), "y" (0-400), "specs" (technical info).`;

        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString("base64"),
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const text = result.response.text().replace(/```json|```/g, "").trim();
        
        console.log("AI Result received successfully!");
        res.json(JSON.parse(text));
    } catch (error) {
        console.error("Server Error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AI Server live on Port ${PORT}`);
});
