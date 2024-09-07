document.addEventListener('DOMContentLoaded', function() {
    const videoUrlInput = document.getElementById('videoUrl');
    const startButton = document.getElementById('startButton');
    const extractButton = document.getElementById('extractButton');
    const mainView = document.getElementById('mainView');
    const extractionView = document.getElementById('extractionView');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const downloadExcelButton = document.getElementById('downloadExcelButton');
    const previewExcelButton = document.getElementById('previewExcelButton');
    const downloadCSVButton = document.getElementById('downloadCSVButton');

    videoUrlInput.addEventListener('input', function() {
        startButton.disabled = !this.value.trim();
    });

    startButton.addEventListener('click', function() {
        const inputUrl = videoUrlInput.value.trim();
        console.log('Start button clicked. Input URL:', inputUrl);
        
        if (isValidYoutubeUrl(inputUrl)) {
            showExtractionView(inputUrl);
        } else {
            alert('Please enter a valid YouTube video link.');
        }
    });

    extractButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentUrl = tabs[0].url;
            if (isValidYoutubeUrl(currentUrl)) {
                showExtractionView(currentUrl);
            } else {
                alert('Please make sure the current page is a valid YouTube video page.');
            }
        });
    });

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentUrl = tabs[0].url;
        const isYouTube = isValidYoutubeUrl(currentUrl);
        
        extractButton.disabled = !isYouTube;
        
        if (!isYouTube) {
            extractButton.textContent = 'Current page is not a YouTube video';
            extractButton.style.backgroundColor = '#cccccc';
        } else {
            extractButton.textContent = 'Extract Current Video';
            extractButton.style.backgroundColor = '#008CBA';
        }
    });

    function showExtractionView(videoUrl) {
        mainView.style.display = 'none';
        extractionView.style.display = 'block';
        
        const loadingText = document.querySelector('#extractionView h2');
        loadingText.textContent = 'Extracting Comments...';
        
        // Initially hide buttons, only show loading animation
        downloadExcelButton.style.display = 'none';
        previewExcelButton.style.display = 'none';
        downloadCSVButton.style.display = 'none';
        loadingSpinner.style.display = 'block';
        
        const apiUrl = `https://yt-comments-434608.ue.r.appspot.com/api/commentsFile?url=${encodeURIComponent(videoUrl)}`;
        fetch(apiUrl, { mode: 'no-cors' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('API response:', data);
                loadingSpinner.style.display = 'none';
                
                // Update text
                loadingText.textContent = 'Completed! Ready to Download';
                
                // Show buttons after loading is complete
                downloadExcelButton.style.display = 'block';
                previewExcelButton.style.display = 'block';
                downloadCSVButton.style.display = 'block';

                const excelFileUrl = data.url;
                const previewUrlWithOfficeViewer = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(excelFileUrl)}`;

                const csvFileUrl = data.csvUrl; // Assuming API also returns CSV file URL

                downloadExcelButton.addEventListener('click', function() {
                    downloadFile(excelFileUrl, 'comments_data.xlsx');
                });

                previewExcelButton.addEventListener('click', function() {
                    chrome.tabs.create({ url: previewUrlWithOfficeViewer });
                });

                downloadCSVButton.addEventListener('click', function() {
                    downloadFile(csvFileUrl, 'comments_data.csv');
                });
            })
            .catch(error => {
                console.error('Error calling API:', error);
                loadingSpinner.style.display = 'none';
                loadingText.textContent = 'Error extracting comments. Please try again later.';
                alert('Error extracting comments. Please try again later.');
            });
    }

    function downloadFile(url, filename) {
        console.log("downloadFile: url="+url+", filename="+filename);
        if (chrome.downloads && chrome.downloads.download) {
            chrome.downloads.download({
                url: url,
                filename: filename,
                saveAs: false
            }, function(downloadId) {
                if (chrome.runtime.lastError) {
                    console.error('Download error:', chrome.runtime.lastError);
                    alert('Error downloading file. Please try again later.');
                } else {
                    console.log('File download started, Download ID:', downloadId);
                }
            });
        } else {
            console.error('chrome.downloads API is not available');
            alert('Download function is not available. Please make sure you are using the latest version of Chrome browser.');
            // As a fallback, we can try to open the URL
            chrome.tabs.create({ url: url });
        }
    }

    // Clicking outside the menu closes it
    window.onclick = function(event) {
        if (!event.target.matches('#downloadButton')) {
            if (downloadOptions.classList.contains('show')) {
                downloadOptions.classList.remove('show');
            }
        }
    }
});

function isValidYoutubeUrl(url) {
    return url.includes('youtube.com/watch?v=') || url.includes('youtu.be/');
}