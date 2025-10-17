// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer'); // For handling file uploads
const pdfParse = require('pdf-parse'); // For PDF processing (optional, if you need to extract images from PDF)
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // To parse JSON request bodies (though multer handles file parts)
// Serve static files from the 'public' directory
app.use(express.static('public'));

// Configure Multer for file uploads
// 'memoryStorage' stores the file in memory as a Buffer, suitable for small files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in the .env file!");
    process.exit(1); // Exit if API key is missing
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Use the vision model

// Define the system prompt for Gemini AI
const SYSTEM_PROMPT = `As a skilled medical practitioner specializing in image analysis, you are tasked with examining medical images for a renowned hospital. Your expertise is crucial in identifying any anomalies, diseases, or health issues that may be present in the images.

Your Responsibilities include:

Detailed Analysis: Thoroughly analyze each image, focusing on identifying any abnormal findings.

Findings Report: Document all observed anomalies or signs of disease. Clearly articulate these findings in a structured format.

Recommendation and Next steps: Based on your analysis, suggest potential next steps, including further tests or treatments as applicable.

Treatment Suggestion: If appropriate, recommend possible treatment options or interventions.

Important Notes:

Scope of Response: Only respond if the image pertains to human health issues.

Clarity of Image: In cases where the image quality impedes clear analysis, note that certain aspects are 'Unable to be determined based on the provided images.'

Disclaimer: Accompany your analysis with the disclaimer: "Consult with a doctor before making any decisions."

Your insights are invaluable in guiding clinical decisions. Please proceed with the analysis, adhering to the structured approach outlined above. Do not use asterisks in the response.`;

// Helper function to convert a buffer to a GoogleGenerativeAI.Part object
function fileToGenerativePart(buffer, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(buffer).toString("base64"),
            mimeType
        },
    };
}

// Route to handle image analysis requests
app.post('/analyze', upload.single('image'), async (req, res) => {
    console.log(`[${new Date().toLocaleString('en-IN')}] Received request to /analyze`);

    if (!req.file) {
        console.log(`[${new Date().toLocaleString('en-IN')}] Error: No image file uploaded.`);
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const file = req.file;
    console.log(`[${new Date().toLocaleString('en-IN')}] File received: ${file.originalname}, MimeType: ${file.mimetype}, Size: ${file.size} bytes`);

    try {
        let imagePart;

        if (file.mimetype === 'application/pdf') {
            console.log(`[${new Date().toLocaleString('en-IN')}] Processing PDF file directly with Gemini.`);
            imagePart = fileToGenerativePart(file.buffer, 'application/pdf');
        } else if (file.mimetype.startsWith('image/')) {
            imagePart = fileToGenerativePart(file.buffer, file.mimetype);
        } else {
            console.log(`[${new Date().toLocaleString('en-IN')}] Error: Unsupported file type '${file.mimetype}'.`);
            return res.status(400).json({ error: 'Unsupported file type. Please upload JPG, PNG, or PDF.' });
        }

        console.log(`[${new Date().toLocaleString('en-IN')}] Sending content to Gemini AI...`);
        // Log the parts being sent to Gemini (be careful not to print large binary data)
        // console.log("Content parts sent to Gemini:", [SYSTEM_PROMPT, imagePart]); // Uncomment cautiously, this might print too much data

        const result = await model.generateContent([SYSTEM_PROMPT, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log(`[${new Date().toLocaleString('en-IN')}] Gemini AI Analysis Received:`);
        console.log("--- START GEMINI RESPONSE ---");
        console.log(text); // <-- This will print the full AI response
        console.log("--- END GEMINI RESPONSE ---");


        const now = new Date();
        const analysisDateTime = now.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        res.json({
            analysis: text,
            analysisDateTime: analysisDateTime
        });
        console.log(`[${new Date().toLocaleString('en-IN')}] Response sent to frontend.`);

    } catch (error) {
        console.error(`[${new Date().toLocaleString('en-IN')}] Error analyzing image with Gemini AI:`, error);
        if (error.response && error.response.status === 429) {
            res.status(429).json({ error: 'Too many requests. Please try again after some time.' });
        } else if (error.message.includes('Could not find image content')) {
            res.status(400).json({ error: 'Unable to process image content. The image might be corrupt or an unsupported format for AI analysis.' });
        } else {
            res.status(500).json({ error: 'Failed to analyze image. Please try again.' });
        }
    }
});



// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`Frontend served from http://localhost:${port}`);
});