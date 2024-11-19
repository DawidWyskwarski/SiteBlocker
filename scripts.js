let listOfBlockedSites = [];

chrome.storage.sync.get({blockedSites: []},(data) => {
    listOfBlockedSites = data.blockedSites || [];

    listOfBlockedSites.forEach(siteDomain => {
        if(siteDomain === window.location.hostname){

            fetch(chrome.runtime.getURL("blocked/blocked.html"))
                .then(response => response.text())
                .then(html => {
                    document.open();
                    document.write(html);
                    document.close();
                })
                .catch(error => console.error("Error loading blocked page:", error));
        }
    });

});

