let listOfBlockedSites = [];

chrome.storage.sync.get({blockedSites: []},(data) => {
    listOfBlockedSites = data.blockedSites || [];

    listOfBlockedSites.forEach(siteDomain => {
        if(siteDomain === window.location.hostname){

            window.location.href = window.location.href = chrome.runtime.getURL("blocked/blocked.html");
        }
    });

});