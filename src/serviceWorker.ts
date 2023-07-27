import { initializeStorageWithDefaults } from './storage';

chrome.runtime.onInstalled.addListener(async () => {
  // Here goes everything you want to execute after extension initialization

  await initializeStorageWithDefaults({});

  console.log('Extension successfully installed!');
});

// Log storage changes, might be safely removed
chrome.storage.onChanged.addListener((changes) => {
  for (const [key, value] of Object.entries(changes)) {
    console.log(
      `"${key}" changed from "${value.oldValue}" to "${value.newValue}"`,
    );
  }
});

(async () => {
  chrome.contextMenus.create({
    id: "replaceimage",
    title: "Replace Image With",
    contexts: ["image", "page"],
  });

  chrome.contextMenus.create({
    id: "replaceImageLocal",
    title: "Local File",
    parentId: "replaceimage",
    contexts:["image"],
  });
  
  chrome.contextMenus.create({
    id: "replaceImageUrl",
    title: "URL",
    parentId: "replaceimage",
    contexts:["image"],
  });

  console.log('context menus created')


  chrome.contextMenus.onClicked.addListener(async (info) => {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    chrome.tabs.sendMessage(tab.id, info.selectionText );
  });
})();

chrome.runtime.onMessage.addListener((imageMessage) => {
    const imageArray = JSON.parse(imageMessage);
    console.log('imageArray',imageArray);
    if(imageArray.length > 0){
      imageArray.forEach((element : string) => {
        chrome.contextMenus.create({ 
          id: `foundImage${element}`,
          parentId: "replaceimage",
          title: element, 
        });

        chrome.contextMenus.create({
          id: `foundImageLocal${element}`,
          title: "Local File",
          parentId: `foundImage${element}`,
        });
        
        chrome.contextMenus.create({
          id: `foundImageUrl${element}`,
          title: "URL",
          parentId: `foundImage${element}`,
        });
      });
    }
    
  
});