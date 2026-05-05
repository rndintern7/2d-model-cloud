const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path'); // Add this
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());

// This tells the server to look for index.html in the same folder as server.js
app.use(express.static(__dirname)); 

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI("AIzaSyCPp6SYIYdj1ZXz-OWw8sWPGuUmJDxUJNI");

// MANUALLY SEND THE FILE IF THE ABOVE FAILS
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/analyze', upload.single('image'), async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const prompt = "Analyze this industrial sketch. Return ONLY a JSON array of components with name, x, y, and specs. Scale for 800x500 area.";
        const imagePart = { inlineData: { data: req.file.buffer.toString("base64"), mimeType: req.file.mimetype } };
        const result = await model.generateContent([prompt, imagePart]);
        res.json(JSON.parse(result.response.text().replace(/```json|```/g, "").trim()));
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(3000, () => console.log("🚀 Server is live!"));
