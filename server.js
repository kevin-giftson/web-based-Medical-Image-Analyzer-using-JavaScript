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
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use the vision model

// Define the system prompt for Gemini AI
const SYSTEM_PROMPT = `As a skilled medical practitioner specializing in image analysis, you are tasked with examining medical images for a renowned hospital. Your expertise is crucial in identifying any anomalies, diseases, or health issues that may be present in the images.

Your Responsibilities include:

1.  Detailed Analysis: Thoroughly analyze each image, focusing on identifying any abnormal findings.
2.  Findings Report: Document all observed anomalies or signs of disease. Clearly articulate these findings in a structured format.
3.  Recommendation and Next steps: Based on your analysis, suggest potential next steps, including further tests or treatments as applicable.
4.  Treatment Suggestion: If appropriate, recommend possible treatment options or interventions.

Important Notes:
1.  Scope of Response: Only respond if the image pertains to human health issues.
2.  Clarity of Image: In cases where the image quality impedes clear analysis, note that certain aspects are 'Unable to be determined based on the provided images.'
3.  Disclaimer: Accompany your analysis with the disclaimer: "Consult with a doctor before making any decisions."

Your insights are invaluable in guiding clinical decisions. Please proceed with the analysis, adhering to the structured approach outlined above.`;

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
    // 'image' here refers to the name attribute in the <input type="file" name="image">
    // In our frontend, we used formData.append('image', selectedFile);

    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded.' });
    }

    const file = req.file; // The uploaded file buffer and metadata

    try {
        let imagePart;

        if (file.mimetype === 'application/pdf') {
            // For PDF, Gemini API can sometimes process it directly if it contains embedded images.
            // If the PDF is complex (e.g., text-heavy documents or scans that aren't purely images),
            // you might need to convert it to an image.
            // For simplicity, we'll pass the PDF directly as inlineData.
            // Note: Directly parsing images from complex PDFs in JS can be tricky.
            // The `pdf-parse` library is more for text extraction.
            // If Gemini struggles with your PDF, you might need a dedicated PDF-to-image conversion library (e.g., ImageMagick on server-side).
            console.log("Processing PDF file directly with Gemini.");
            imagePart = fileToGenerativePart(file.buffer, 'application/pdf');

            // --- Alternative (more complex) PDF processing ---
            // If Gemini struggles with direct PDF processing, you might need to convert pages to images.
            // This is significantly more complex for a simple setup and often requires native libraries like ImageMagick
            // or a dedicated PDF rendering service.
            // For now, we'll rely on Gemini's ability to interpret PDF inline data.
            /*
            // Example of how you *might* process PDF to images, but it's not straightforward without a robust library
            // pdfParse(file.buffer).then(function(data) {
            //     // Data contains text, number of pages, etc.
            //     // Extracting images from PDF programmatically to send them is complex.
            //     // A common approach is to use tools like GraphicsMagick/ImageMagick (command-line tools)
            //     // executed from Node.js, or a cloud service.
            //     console.log("PDF parsed, but extracting images is complex without external tools.");
            //     // For demonstration, we'll proceed by sending the whole PDF
            // });
            */
        } else if (file.mimetype.startsWith('image/')) {
            // For image files (JPG, PNG)
            imagePart = fileToGenerativePart(file.buffer, file.mimetype);
        } else {
            return res.status(400).json({ error: 'Unsupported file type. Please upload JPG, PNG, or PDF.' });
        }

        console.log(`Sending ${file.mimetype} to Gemini AI.`);
        const result = await model.generateContent([SYSTEM_PROMPT, imagePart]);
        const response = await result.response;
        const text = response.text();

        console.log("Gemini AI Analysis Received.");
        res.json({ analysis: text });

    } catch (error) {
        console.error('Error analyzing image with Gemini AI:', error);
        if (error.response && error.response.status === 429) {
            res.status(429).json({ error: 'Too many requests. Please try again after some time.' });
        } else if (error.message.includes('Could not find image content')) {
            // Specific error for cases where Gemini can't parse the image (e.g., corrupt file, unsupported sub-format)
            res.status(400).json({ error: 'Unable to process image content. The image might be corrupt or an unsupported format for AI analysis.' });
        }
        else {
            res.status(500).json({ error: 'Failed to analyze image. Please try again.' });
        }
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log(`Frontend served from http://localhost:${port}`);
});