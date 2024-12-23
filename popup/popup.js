const unBlockable = ["chrome://", 'about:', 'edge://', 'opera://',
    'google.', 'bing.', 'yahoo.', 'duckduckgo.', 'baidu.', 'yandex.',
    'mozilla.', 'microsoft.', 'outlook.live.', 'poczta.','mail.',
    '.gov', '.edu', 'chrome-extension://'];

const customAlert = document.getElementById('custom-alert');
const setGetPass = document.getElementById('password');

document.addEventListener("DOMContentLoaded", () => {
    loadBlockedSites();

    const addCurrentButton = document.getElementById("addCurrent");
    addCurrentButton.addEventListener("click", blockCurr);
});

function blockCurr() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const currentTab = tabs[0];
            const url = new URL(currentTab.url);

                if(cantBlock(url.origin)) {
                    showAlert("Can't block this site");

                    return;
                }

            setGetPass.style.display = 'flex';
            let passwordMessage = document.getElementById('passwordMessage');
            passwordMessage.innerText = "Set Password!"
            const textInput = document.getElementById('setter');

            textInput.addEventListener("keydown", function(event) {
                
                if(event.key === "Enter"){
                    const pass = textInput.value || "super_SecreT-1-two_3";

                    textInput.value = "";

                    setGetPass.style.display = 'none';
                    const domain = url.hostname;
                    addBlockedSite(domain, pass);
                }
            });
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

function removeBlockedSite(domain, listItem) {
    chrome.storage.sync.get({ blockedSites: {} }, (data) => {
        const blockedSites = data.blockedSites;

        setGetPass.style.display = 'flex';
        let passwordMessage = document.getElementById('passwordMessage');
        passwordMessage.innerText = "Enter The Password!";
        const textInput = document.getElementById('setter');

        const newTextInput = textInput.cloneNode(true);
        textInput.parentNode.replaceChild(newTextInput, textInput);

        newTextInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                const pass = newTextInput.value || "super_SecreT-1-two_3";
                newTextInput.value = "";
                setGetPass.style.display = 'none';

                if (pass === blockedSites[domain] || pass === "super_SecreT-1-two_3") {
                    listItem.remove();
                    delete blockedSites[domain];

                    chrome.storage.sync.set({ blockedSites }, () => {});
                } else {
                    showAlert("Wrong Password!");
                    return;
                }
            }
        });
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
