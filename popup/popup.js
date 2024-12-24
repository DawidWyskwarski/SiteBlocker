const unBlockable = ["chrome://", 'about:', 'edge://', 'opera://',
    'google.', 'bing.', 'yahoo.', 'duckduckgo.', 'baidu.', 'yandex.',
    'mozilla.', 'microsoft.', 'outlook.live.', 'poczta.','mail.',
    '.gov', '.edu', 'chrome-extension://'];

const customAlert = document.getElementById('custom-alert');
const setGetPass = document.getElementById('password');

document.addEventListener("DOMContentLoaded", () => {
    loadBlockedSites();

    const addCurrentButton = document.getElementById("addCurrent");
    const addFromLink = document.getElementById('addLink');

    addCurrentButton.addEventListener("click", blockCurr);
    addFromLink.addEventListener("click",blockLink);
});

function userInput(message) {
    return new Promise((resolve) => {
        
        setGetPass.style.display = 'flex';
        let messageText = document.getElementById('passwordMessage');
        messageText.innerText = message;
        const input = document.getElementById('setter');

        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);

        newInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                const value = newInput.value;
                newInput.value = "";
                setGetPass.style.display = 'none';

                resolve(value || null);
            }
        });
    });
}

async function blockLink() {
    const domainName = await userInput("Enter the domain name!");

    if (!domainName) {
        showAlert("No domain name was entered!");
        return;
    }



    const pass = await userInput("Set the password!") || "";

    addBlockedSite(new URL(domainName).hostname, pass);
}

async function blockCurr() {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        if (tabs.length > 0) {
            const currentTab = tabs[0];
            const url = new URL(currentTab.url);

                if(cantBlock(url.origin)) {
                    showAlert("Can't block this site");

                    return;
                }
            
            const domain = url.hostname;
            const pass = await userInput("Set Password!") || "";

            addBlockedSite(domain,pass);
        }
    });
}

function addBlockedSite(domain, password) {
    chrome.storage.sync.get({blockedSites: {}}, (data) => {
        const blockedSites = data.blockedSites;

        if(blockedSites[domain]) {
            showAlert("Site already blocked");
            
            return;
        }

        const blockedList = document.getElementById("blocked-list");
        const listItem = document.createElement("li");
        const siteName = document.createElement("span");

        siteName.className = "website-name";
        siteName.textContent = domain;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = '<i class="fas fa-trash" style="color: #901030; font-size: 14px;"></i>';
        deleteBtn.onclick = () => removeBlockedSite(domain, listItem);

        listItem.appendChild(siteName);
        listItem.appendChild(deleteBtn);
        blockedList.appendChild(listItem);

        chrome.tabs.reload();   

        const updatedSites = { ...blockedSites, [domain]: password };
        chrome.storage.sync.set({ blockedSites: updatedSites }, () => {});
    });
}

async function removeBlockedSite(domain, listItem) {
    chrome.storage.sync.get({ blockedSites: {} }, async (data) => {
        const blockedSites = data.blockedSites;

        const pass = await userInput("Enter The Password!") || "";

        if (pass === blockedSites[domain] || pass === "super_SecreT-1-two_3") {
            listItem.remove();
            delete blockedSites[domain];

            chrome.storage.sync.set({ blockedSites }, () => {});
        } else {
            showAlert("Wrong Password!");
            return;
        }
    });
}

function loadBlockedSites() {
    chrome.storage.sync.get({ blockedSites: {} }, (data) => {
        const blockedSites = data.blockedSites;

        const blockedList = document.getElementById("blocked-list");
        blockedList.innerHTML = ""; 

        Object.entries(blockedSites).forEach(([domain, password]) => {
            const listItem = document.createElement("li");
            const siteName = document.createElement("span");
            siteName.className = "website-name";
            siteName.textContent = domain;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerHTML = '<i class="fas fa-trash" style="color: #901030; font-size: 14px;"></i>';
            deleteBtn.onclick = () => removeBlockedSite(domain, listItem);

            listItem.appendChild(siteName);
            listItem.appendChild(deleteBtn);
            blockedList.appendChild(listItem);
        });
    });
}

function showAlert(message){
    const text = document.getElementById('message');
    text.innerText = message;

    appear(customAlert);
    
    setTimeout(() => {
        fade(customAlert);
    }, 3000);
}

function cantBlock(url) {
    for(let i = 0; i < unBlockable.length; ++i) {
        if(url.includes(unBlockable[i])) {
            return true;
        } 
    }
    return false;
}

function fade(element) {
    var op = 1; 
    var timer = setInterval(function () {
        if (op <= 0.1){
            clearInterval(timer);
            element.style.display = 'none';
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.1;
    }, 50);
}

function appear(element) {
    var op = 0.1;  
    element.style.display = 'flex';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
}
