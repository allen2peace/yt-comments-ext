document.addEventListener('DOMContentLoaded', function() {
    const videoUrlInput = document.getElementById('videoUrl');
    const startButton = document.getElementById('startButton');
    const extractButton = document.getElementById('extractButton');
    const mainView = document.getElementById('mainView');
    const extractionView = document.getElementById('extractionView');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const downloadButton = document.getElementById('downloadButton');
    const downloadOptions = document.getElementById('downloadOptions');
    const downloadExcel = document.getElementById('downloadExcel');
    const previewExcel = document.getElementById('previewExcel');
    const downloadCSV = document.getElementById('downloadCSV');

    videoUrlInput.addEventListener('input', function() {
        startButton.disabled = !this.value.trim();
    });

    startButton.addEventListener('click', function() {
        console.log('Start button clicked');
        // Add functionality for start button here
    });

    extractButton.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            const currentUrl = tabs[0].url;
            if (isValidYoutubeUrl(currentUrl)) {
                showExtractionView(currentUrl);
            } else {
                alert('请确保当前页面是有效的YouTube视频页面。');
            }
        });
    });

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentUrl = tabs[0].url;
        const isYouTube = isValidYoutubeUrl(currentUrl);
        
        extractButton.disabled = !isYouTube;
        
        if (!isYouTube) {
            extractButton.textContent = '当前页面不是YouTube视频';
            extractButton.style.backgroundColor = '#cccccc';
        } else {
            extractButton.textContent = '提取当前视频';
            extractButton.style.backgroundColor = '#008CBA';
        }
    });

    function showExtractionView(videoUrl) {
        mainView.style.display = 'none';
        extractionView.style.display = 'block';
        
        const apiUrl = `https://yt-comments-434608.ue.r.appspot.com/api/commentsFile?url=${encodeURIComponent(videoUrl)}`;
        fetch(apiUrl, { mode: 'no-cors' })
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应不正常');
                }
                return response.json();
            })
            .then(data => {
                console.log('API响应:', data);
                loadingSpinner.style.display = 'none';
                downloadButton.style.display = 'block';

                const excelFileUrl = data.url;
                const previewUrlWithOfficeViewer = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(excelFileUrl)}`;

                const csvFileUrl = data.csvUrl; // 假设API也返回了CSV文件的URL

                downloadButton.addEventListener('click', function() {
                    downloadOptions.classList.toggle('show');
                });

                downloadExcel.addEventListener('click', function() {
                    downloadFile(excelFileUrl, '评论数据.xlsx');
                });

                previewExcel.addEventListener('click', function() {
                    window.open(previewUrlWithOfficeViewer, '_blank');
                });

                downloadCSV.addEventListener('click', function() {
                    downloadFile(csvFileUrl, '评论数据.csv');
                });
            })
            .catch(error => {
                console.error('调用API时发生错误:', error);
                loadingSpinner.style.display = 'none';
                alert('提取评论时发生错误，请稍后重试。');
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
                    console.error('下载出错:', chrome.runtime.lastError);
                    alert('下载文件时发生错误，请稍后重试。');
                } else {
                    console.log('文件下载已开始，下载ID:', downloadId);
                }
            });
        } else {
            console.error('chrome.downloads API 不可用');
            alert('下载功能不可用，请确保您使用的是最新版本的Chrome浏览器。');
            // 作为备选方案，我们可以尝试打开URL
            window.open(url, '_blank');
        }
    }

    // 点击页面其他地方时关闭下拉菜单
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