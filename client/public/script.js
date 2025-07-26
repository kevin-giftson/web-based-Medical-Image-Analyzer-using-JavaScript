// Function to format the analysis text with bold/colored headings
function formatAnalysisText(text) {
    let formattedText = text;

    // Define the headings to highlight
    const headings = [
        "Detailed Analysis:",
        "Findings Report:",
        "Recommendation and Next Steps:",
        "Treatment Suggestion:"
    ];

    // Define the color (e.g., a shade of blue or green)
    const highlightColor = "#007bff"; // A nice blue, matches your button color
    // const highlightColor = "#28a745"; // A nice green

    headings.forEach(heading => {
        // Create a regular expression to find the heading, case-insensitively and globally
        // \b ensures whole word match, :? ensures optional colon if AI sometimes omits it
        const regex = new RegExp(`(${heading.replace(':', '\\:')})`, 'gi'); // Escaping colon for regex

        formattedText = formattedText.replace(regex, `<span class="analysis-heading" style="color: ${highlightColor}; font-weight: bold;">$1</span>`);
    });

    return formattedText;
}

document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const analyzeButton = document.getElementById('analyzeButton');
    const imagePreview = document.getElementById('imagePreview');
    const noImageText = document.getElementById('noImageText');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsText = document.getElementById('resultsText');
    const analysisTime = document.getElementById('analysisTime');

    let selectedFile = null;

    // Event listener for file selection
    imageUpload.addEventListener('change', (event) => {
        selectedFile = event.target.files[0];

        if (selectedFile) {
            const reader = new FileReader();

            // When the file is loaded (read)
            reader.onload = (e) => {
                // Set the image source for preview
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block'; // Show the image
                noImageText.style.display = 'none'; // Hide "No image selected" text
                analyzeButton.disabled = false; // Enable the analyze button
                resultsText.textContent = ''; // Clear previous results
            };

            // Read the file as a Data URL (Base64) for preview
            // Note: For actual API call, we'll send the Blob/File directly via FormData
            reader.readAsDataURL(selectedFile);
        } else {
            // No file selected
            imagePreview.src = '#';
            imagePreview.style.display = 'none';
            noImageText.style.display = 'block';
            analyzeButton.disabled = true;
            resultsText.textContent = '';
            selectedFile = null;
        }
    });

    // Event listener for analyze button click
    analyzeButton.addEventListener('click', async () => {
        if (!selectedFile) {
            alert('Please select an image first.');
            return;
        }

        loadingIndicator.style.display = 'block'; // Show loading message
        resultsText.textContent = ''; // Clear previous results
        analyzeButton.disabled = true; // Disable button during analysis

        const formData = new FormData();
        formData.append('image', selectedFile); // Append the file to FormData

        try {
            // Make a POST request to your backend
            // Ensure this URL matches your backend server's address and port
            const response = await fetch('http://localhost:3000/analyze', {
                method: 'POST',
                body: formData, // Send FormData
            });

            if (!response.ok) {
                // If the response status is not 2xx
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong on the server.');
            }

            const data = await response.json();            
            resultsText.innerHTML = formatAnalysisText(data.analysis); // Use innerHTML because we're inserting HTML tags

            if (data.analysisDateTime) {
                analysisTime.textContent = `Analysis made on: ${data.analysisDateTime}`;
                analysisTime.style.display = 'block';
            } else {
                analysisTime.style.display = 'none';
            }

            if (data.analysisDateTime) {
                analysisTime.textContent = `Analysis made on: ${data.analysisDateTime}`;
                analysisTime.style.display = 'block'; // Show the date/time
            } else {
                analysisTime.style.display = 'none'; // Hide if no date/time is sent (shouldn't happen with our server code)
            }

        } catch (error) {
            console.error('Error during analysis:', error);
            resultsText.textContent = `Error: ${error.message}. Please try again or check the console for more details.`;
            // Optionally, show an alert for critical errors
            // alert('Analysis failed: ' + error.message);
        } finally {
            loadingIndicator.style.display = 'none'; // Hide loading message
            analyzeButton.disabled = false; // Re-enable the button
        }
    });
});