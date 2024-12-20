const unBlockable = ["chrome://", 'about:', 'edge://', 'opera://',
                     'google.', 'bing.', 'yahoo.', 'duckduckgo.', 'baidu.', 'yandex.',
                     'mozilla.', 'microsoft.', 'outlook.live.', 'poczta.','mail.',
                     '.gov', '.edu', 'chrome-extension://'];

const customAlert = document.getElementById('custom-alert')
const setPass = document.getElementById('set-password')

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

            if( cantBlock(url.origin) ){
                
                const message = document.getElementById('message');
                message.innerText = "Can't block this site"

                appear(customAlert);
                
                setTimeout(() => {
                    fade(customAlert);
                }, 3000);

                return;
            }

            setPass.style.display = 'flex'; 
            const textInput = document.getElementById('setter')

            textInput.addEventListener("keydown", function(event) {
                
                if(event.key === "Enter"){
                    const pass = textInput.value;
                    textInput.value = "";
                    alert(pass);

                    fade(setPass)
                    const domain = url.hostname;
                    addBlockedSite(domain);
                }
            });
        }
    });
}

function addBlockedSite(site) {
    
    chrome.storage.sync.get({blockedSites: []}, (data) =>{
        const blockedSites = data.blockedSites;

        if(blockedSites.includes(site)){
            
            const message = document.getElementById('message');
            message.innerText = "Site already blocked"

            appear(customAlert);
                
            setTimeout(() => {
                fade(customAlert);
            }, 3000);
            
            return;
        }

        const blockedList = document.getElementById("blocked-list");
        const listItem = document.createElement("li");
        const siteName = document.createElement("span");

        siteName.className = "website-name";
        siteName.textContent = site;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.innerHTML = '<i class="fas fa-trash" style="color: #901030; font-size: 14px;"></i>';
        deleteBtn.onclick = () => removeBlockedSite(site,listItem);

        listItem.appendChild(siteName);
        listItem.appendChild(deleteBtn);
        blockedList.appendChild(listItem);

        chrome.tabs.reload();

        const updatedSites = [...blockedSites, site];
        chrome.storage.sync.set({ blockedSites: updatedSites }, () => {
            console.log("Strona została zapisana:", site);
          });
    });
}

function removeBlockedSite(site, listItem){
    listItem.remove();

    chrome.storage.sync.get({blockedSites: [] }, (data) =>{
        const updatedSites = data.blockedSites.filter((blockedSites) => blockedSites !== site );
        chrome.storage.sync.set({ blockedSites: updatedSites }, () => {
            console.log("Strona została usunięta:", site);
        });
    });
}

function loadBlockedSites() {
    chrome.storage.sync.get({ blockedSites: [] }, (data) => {
        const blockedSites = data.blockedSites;

        const blockedList = document.getElementById("blocked-list");
        blockedList.innerHTML = ""; 

        blockedSites.forEach((site) => {
            const listItem = document.createElement("li");
            const siteName = document.createElement("span");
            siteName.className = "website-name";
            siteName.textContent = site;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerHTML = '<i class="fas fa-trash" style="color: #901030; font-size: 14px;"></i>';
            deleteBtn.onclick = () => removeBlockedSite(site, listItem);

            listItem.appendChild(siteName);
            listItem.appendChild(deleteBtn);
            blockedList.appendChild(listItem);
        });
    });
}

function cantBlock(url){
    for(i=0;i<unBlockable.length;++i){
        if( url.includes(unBlockable[i]) ){
            return true;
        } 
    }
    return false;
}