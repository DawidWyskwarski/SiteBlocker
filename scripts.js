chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && isValidUrl(tab.url)) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: redirect,
            args: [tab.url]
        });
    }
});

function isValidUrl(url) {
    const invalidSchemes = ['chrome:', 'about:', 'file:', 'chrome-extension:'];
    return !invalidSchemes.some(scheme => url.startsWith(scheme));
}

function redirect(tabUrl) {
    chrome.storage.sync.get({ blockedSites: {} }, (data) => {
        const listOfBlockedSites = data.blockedSites;
        const curDomain = new URL(tabUrl).hostname;

        Object.entries(listOfBlockedSites).forEach(([domain, password]) => {
            if (curDomain.toLowerCase().includes(domain.toLowerCase()) || domain.toLowerCase().includes(curDomain.toLowerCase())) {
                const blockedPage = chrome.runtime.getURL("blocked/blocked.html");
                window.location.href = blockedPage;    
            }
        });
    });
}