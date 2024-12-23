chrome.storage.sync.get({ blockedSites: {} }, (data) => {
    const listOfBlockedSites = data.blockedSites;

    if (listOfBlockedSites[window.location.hostname]) {
        window.location.href = chrome.runtime.getURL("blocked/blocked.html");
    }
});