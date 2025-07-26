// Function to format the analysis text with bold/colored headings
function formatAnalysisText(text) {
    let formattedText = text;
    const headings = [
        "Detailed Analysis:",
        "Findings Report:",
        "Recommendation and Next Steps:",
        "Treatment Suggestion:"
    ];
    const highlightColor = "#007bff";

    headings.forEach(heading => {
        const regex = new RegExp(`(${heading.replace(':', '\\:')})`, 'gi');
        formattedText = formattedText.replace(regex, `<span class="analysis-heading" style="color: ${highlightColor}; font-weight: bold;">$1</span>`);
    });

    // Replace newlines with <br> for better formatting in innerHTML
    formattedText = formattedText.replace(/\n/g, '<br>');

    return formattedText;
}

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT REFERENCES ---
    const imageUpload = document.getElementById('imageUpload');
    const selectImageButton = document.getElementById('selectImageButton');
    const analyzeButton = document.getElementById('analyzeButton');
    const addNewAnalysisButton = document.getElementById('addNewAnalysisButton');
    const imagePreview = document.getElementById('imagePreview');
    const noImageText = document.getElementById('noImageText');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsText = document.getElementById('resultsText');
    const analysisTime = document.getElementById('analysisTime');
    const navigationSection = document.getElementById('navigation-section');
    const prevAnalysisButton = document.getElementById('prevAnalysisButton');
    const nextAnalysisButton = document.getElementById('nextAnalysisButton');
    const analysisCounter = document.getElementById('analysisCounter');

    // --- State Variables ---
    let selectedFile = null; // <--- THIS IS THE MISSING/MOVED LINE!
    let currentAnalysisIndex = -1; // -1 means no analysis loaded yet
    const analysisHistory = []; // Stores objects like { file: Blob, previewUrl: string, analysis: string, analysisDateTime: string }

    // --- Helper Functions ---

    // Resets UI elements to initial state (ready for a new upload)
    function resetUIForNewUpload() {
        selectedFile = null;
        imageUpload.value = ''; // Clear file input
        imagePreview.src = '#';
        imagePreview.style.display = 'none';
        noImageText.style.display = 'block';
        analyzeButton.disabled = true;
        selectImageButton.textContent = 'Select/Change Image'; // Reset button text
        resultsText.innerHTML = '';
        analysisTime.textContent = '';
        analysisTime.style.display = 'none';
        loadingIndicator.style.display = 'none';
        addNewAnalysisButton.style.display = 'none'; // Hide "Add New" until analysis is complete
        navigationSection.style.display = 'none'; // Hide navigation
        updateNavigationButtons(); // Disable nav buttons
    }

    // Displays a specific analysis from history
    function displayAnalysis(index) {
        if (index >= 0 && index < analysisHistory.length) {
            currentAnalysisIndex = index;
            const analysis = analysisHistory[currentAnalysisIndex];

            // Display image
            imagePreview.src = analysis.previewUrl;
            imagePreview.style.display = 'block';
            noImageText.style.display = 'none';
            selectImageButton.textContent = 'Change Image'; // Indicate image is already selected

            // Display analysis results
            resultsText.innerHTML = formatAnalysisText(analysis.analysis);
            if (analysis.analysisDateTime) {
                analysisTime.textContent = `Analysis made on: ${analysis.analysisDateTime}`;
                analysisTime.style.display = 'block';
            } else {
                analysisTime.style.display = 'none';
            }

            // Update navigation counter
            analysisCounter.textContent = `${currentAnalysisIndex + 1}/${analysisHistory.length}`;
            navigationSection.style.display = 'flex'; // Show navigation
            updateNavigationButtons();

            // Disable analyze button as this is a loaded history item
            analyzeButton.disabled = true;
            // Show "Add New Analysis" if this isn't the last analysis
            addNewAnalysisButton.style.display = (currentAnalysisIndex === analysisHistory.length - 1) ? 'block' : 'none';

        } else if (analysisHistory.length === 0) {
            resetUIForNewUpload(); // If history is empty, reset everything
        }
    }

    // Updates state of Prev/Next buttons
    function updateNavigationButtons() {
        prevAnalysisButton.disabled = (currentAnalysisIndex <= 0);
        nextAnalysisButton.disabled = (currentAnalysisIndex >= analysisHistory.length - 1);
    }

    // --- Event Listeners ---

    // Trigger hidden file input
    selectImageButton.addEventListener('click', () => {
        imageUpload.click();
    });

    // Handle file selection
    imageUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (file) {
            selectedFile = file; // Store the actual file object
            const reader = new FileReader();

            reader.onload = (e) => {
                imagePreview.src = e.target.result; // For preview
                imagePreview.style.display = 'block';
                noImageText.style.display = 'none';
                analyzeButton.disabled = false; // Enable analyze button
                selectImageButton.textContent = 'Change Image'; // Indicate an image is selected
                resultsText.innerHTML = ''; // Clear previous results
                analysisTime.textContent = ''; // Clear previous date/time
                analysisTime.style.display = 'none';
                loadingIndicator.style.display = 'none';
                addNewAnalysisButton.style.display = 'none'; // Hide "Add New"
                navigationSection.style.display = 'none'; // Hide navigation when new image is selected
            };

            reader.readAsDataURL(file); // Read file for preview
        } else {
            resetUIForNewUpload();
        }
    });

    // Handle Analyze button click
    analyzeButton.addEventListener('click', async () => {
        if (!selectedFile) {
            alert('Please select an image first.');
            return;
        }

        loadingIndicator.style.display = 'block';
        resultsText.innerHTML = ''; // Clear previous results
        analysisTime.textContent = '';
        analysisTime.style.display = 'none';
        analyzeButton.disabled = true;
        addNewAnalysisButton.style.display = 'none'; // Hide "Add New" during analysis
        navigationSection.style.display = 'none'; // Hide navigation during analysis

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('http://localhost:3000/analyze', { // Use '/analyze' on Render
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong on the server.');
            }

            const data = await response.json();

            // Store this analysis in history
            const newAnalysis = {
                file: selectedFile, // Store the actual file if needed later, or just its preview URL
                previewUrl: imagePreview.src, // Store the Base64 preview URL
                analysis: data.analysis,
                analysisDateTime: data.analysisDateTime
            };

            // If we're at the end of history, add new. Otherwise, insert/overwrite at current index
            if (currentAnalysisIndex === analysisHistory.length - 1 || currentAnalysisIndex === -1) {
                 analysisHistory.push(newAnalysis);
                 currentAnalysisIndex = analysisHistory.length - 1;
            } else {
                 // If user navigated back and analyzes a new image, replace subsequent history
                 analysisHistory.splice(currentAnalysisIndex + 1); // Remove all analyses after current
                 analysisHistory.push(newAnalysis);
                 currentAnalysisIndex = analysisHistory.length - 1;
            }


            displayAnalysis(currentAnalysisIndex); // Display the newly added/analyzed one
            addNewAnalysisButton.style.display = 'block'; // Show "Add New" button after analysis
            analyzeButton.disabled = true; // Disable analyze button as current is analyzed

        } catch (error) {
            console.error('Error during analysis:', error);
            resultsText.textContent = `Error: ${error.message}. Please try again or check the console for more details.`;
            analysisTime.style.display = 'none'; // Hide time if error
            analyzeButton.disabled = false; // Re-enable for another try
            addNewAnalysisButton.style.display = 'none'; // Keep "Add New" hidden on error
            navigationSection.style.display = 'none'; // Hide nav on error
        } finally {
            loadingIndicator.style.display = 'none';
            // analyzeButton.disabled is handled within the try/catch now
        }
    });

    // Handle "Add New Analysis" button click
    addNewAnalysisButton.addEventListener('click', () => {
        resetUIForNewUpload();
        // The navigation section will be hidden by resetUIForNewUpload,
        // and only shown again when a new analysis is completed.
    });

    // Handle Previous Analysis button click
    prevAnalysisButton.addEventListener('click', () => {
        if (currentAnalysisIndex > 0) {
            displayAnalysis(currentAnalysisIndex - 1);
        }
    });

    // Handle Next Analysis button click
    nextAnalysisButton.addEventListener('click', () => {
        if (currentAnalysisIndex < analysisHistory.length - 1) {
            displayAnalysis(currentAnalysisIndex + 1);
        }
    });
});