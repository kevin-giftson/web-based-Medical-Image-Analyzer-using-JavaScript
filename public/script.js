document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const analyzeButton = document.getElementById('analyzeButton');
    const imagePreview = document.getElementById('imagePreview');
    const noImageText = document.getElementById('noImageText');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const resultsText = document.getElementById('resultsText');

    let selectedFile = null; // To store the file object

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
            resultsText.textContent = data.analysis; // Display the analysis result
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