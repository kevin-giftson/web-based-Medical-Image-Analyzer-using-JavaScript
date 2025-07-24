# web-based-Medical-Image-Analyzer-using-JavaScript

# 🏥 Medical Image Analyzer (Powered by Gemini AI)

This project is a web-based medical image analyzer that leverages Google's Gemini Pro Vision (or Gemini 1.5 Flash) model to analyze medical images (JPG, PNG, PDF) and provide a detailed report, potential next steps, and treatment suggestions based on a predefined medical practitioner's prompt.

**Disclaimer:** This tool is for **informational and demonstrative purposes only** and should **NOT** be used for actual medical diagnosis or treatment. **Always consult with a qualified medical professional before making any health-related decisions.**

## ✨ Features

* **Image Upload:** Easily upload JPG, JPEG, PNG, and PDF medical images.
* **Image Preview:** See a preview of the uploaded image before analysis.
* **AI-Powered Analysis:** Utilizes the cutting-edge Gemini AI model to:
    * Provide a detailed analysis of abnormal findings.
    * Generate a structured findings report.
    * Suggest potential next steps (e.g., further tests).
    * Recommend possible treatment options.
* **Structured Output:** AI responses are guided by a specific medical practitioner's prompt for clear and organized information.
* **User-Friendly Interface:** Simple and intuitive web interface for interaction.
* **Secure Backend:** Your Gemini API key is securely handled on the server-side, not exposed in the frontend.

## 🚀 Technologies Used

* **Frontend:**
    * HTML5
    * CSS3
    * JavaScript (ES6+)
* **Backend:**
    * Node.js
    * Express.js (Web Framework)
    * Multer (for file uploads)
    * CORS (for cross-origin requests)
    * Dotenv (for environment variables)
* **AI Model:**
    * Google Gemini API (`@google/generative-ai` SDK) - Specifically, the `gemini-1.5-flash` model (or `gemini-pro-vision` if you're using an older version, though it's deprecated).

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

* **Node.js**: [Download & Install Node.js](https://nodejs.org/en/download/) (includes npm)
* **npm**: Comes with Node.js
* **Git** (Optional, but recommended for version control): [Download & Install Git](https://git-scm.com/downloads)
* **Google Gemini API Key**:
    1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
    2.  Create a new API key.

## ⚙️ Setup and Installation

Follow these steps to get the project up and running on your local machine:

1.  **Clone the Repository (or create manually):**

    If you're using Git:
    ```bash
    git clone https://github.com/kevin-giftson/web-based-Medical-Image-Analyzer-using-JavaScript.git
    cd medical-image-analyzer
    ```
    If you're setting it up manually, create a directory and `npm init -y` inside it as described in the tutorial.

2.  **Install Dependencies:**
    Navigate to the project's root directory in your terminal and install the necessary Node.js packages:
    ```bash
    npm install express cors dotenv @google/generative-ai multer pdf-parse
    ```

3.  **Configure Environment Variables:**
    Create a file named `.env` in the **root** directory of your project (the same level as `package.json`).
    Add your Gemini API key to this file:
    ```dotenv
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
    **Important:** Replace `"YOUR_GEMINI_API_KEY_HERE"` with the actual API key you obtained from Google AI Studio. **Never commit your `.env` file to version control!** (It's good practice to add `.env` to your `.gitignore`).

4.  **Verify Model Name in `server.js`:**
    Open `server.js` and ensure the Gemini model name is set correctly to `gemini-1.5-flash` (or the latest recommended vision model).
    Look for this line:
    ```javascript
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or 'gemini-pro-vision' (deprecated)
    ```
    Ensure it matches `gemini-1.5-flash` to avoid deprecation errors.

## ▶️ How to Run

1.  **Start the Backend Server:**
    Open your terminal, navigate to the project's root directory, and run:
    ```bash
    node server.js
    ```
    You should see output indicating the server is running on `http://localhost:3000`.

2.  **Access the Frontend:**
    Open your web browser and go to:
    ```
    http://localhost:3000
    ```

## 🚀 Usage

1.  **Upload Image:** Click the "Choose File" button and select a JPG, PNG, or PDF medical image from your computer.
2.  **Preview:** A preview of your selected image will appear.
3.  **Analyze:** Click the "Analyze Image" button.
4.  **Results:** The AI's analysis, findings report, recommended next steps, and treatment suggestions will appear below the image preview.
5.  **Remember the Disclaimer:** Always keep in mind that this is a demonstration, and professional medical advice is paramount.

## ⚠️ Important Disclaimer

This project is intended solely for educational and demonstration purposes to showcase the capabilities of AI in image analysis. **It is not a substitute for professional medical advice, diagnosis, or treatment.** Any information provided by this tool should be independently verified by a qualified healthcare professional. Do not use this tool to make health-related decisions.

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this project, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.


## 🙏 Acknowledgements

* Google for the Gemini API.
* The open-source community for all the wonderful tools and libraries used.
