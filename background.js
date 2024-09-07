chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkYouTube") {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            const currentUrl = tabs[0].url;
            const isYouTube = currentUrl.includes('youtube.com') || currentUrl.includes('youtu.be');
            sendResponse({isYouTube: isYouTube});
        });
        return true; // 保持消息通道开放
    }
});