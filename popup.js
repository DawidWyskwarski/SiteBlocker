document.addEventListener("DOMContentLoaded", () => {
    const addCurrentButton = document.getElementById("addCurrent");
    addCurrentButton.addEventListener("click", blockCurr);
});
  
function blockCurr() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const currentTab = tabs[0];
            const url = new URL(currentTab.url);
            const domain = url.hostname;
  
            addBlockedSite(domain);
        }
    });
}

  
function addBlockedSite(site) {
    const blockedList = document.getElementById("blocked-list");
  
    const listItem = document.createElement("li");
    const siteName = document.createElement("span");
    siteName.className = "website-name";
    siteName.textContent = site;
  
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-trash" style="color: #901030; font-size: 14px;"></i>';
    deleteBtn.onclick = () => listItem.remove();
  
    listItem.appendChild(siteName);
    listItem.appendChild(deleteBtn);
    blockedList.appendChild(listItem);
}