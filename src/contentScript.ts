"use strict";

// eslint-disable-next-line no-var
var imageEl: EventTarget | null = null;

window.addEventListener("load", () => {
    console.log('loaded');
    document.addEventListener("click", () => { console.log('click')})
    // register right click (contextmenu) event on document
    document.addEventListener("contextmenu", function (event: Event) {
    if(event.target instanceof HTMLImageElement) {
        imageEl = event.target;
    }
    else
    {
        sendMessageToChrome(findImages(event.target as HTMLElement));
    }
    
    }, true);
});

function findImages(node: HTMLElement, images: string[] = []): string[] {
    node.querySelectorAll("img").forEach((img: HTMLImageElement) => images.push(img.src));
    return images;
  }

const sendMessageToChrome = (message: Array<string>) => {
    console.log('sending message to chrome',message,JSON.stringify(message));
    chrome.runtime.sendMessage(JSON.stringify(message));
}
// register message event (sent from background.js)
chrome.runtime.onMessage.addListener(function (request) {
  console.log('message received', request)
  switch (request) {
    case "Local File":
      getInputImage();
      break;
    case "URL":
      getInputURL();
      break;
  }
  return true;
});



// gets image using file input
function getInputImage() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  fileInput.addEventListener("change", function () {
    readInputImage(this.files[0]);
  }, false);

  fileInput.click();
}

// reads image using FileReader
function readInputImage(file: File) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        replaceImage(reader.result);
    };
}

// gets the input url from user
function getInputURL() {
    console.log('getInputURL');
  const URL = prompt('Enter the Image URL:');
  if(!isValidUrl(URL)) {
    alert('Provided URL is Invalid');
    return;
  }
  replaceImage(URL);
}


// replace clicked image with base64 / URL
function replaceImage(source: ArrayBuffer | string) {
    if (!source || !(imageEl instanceof HTMLImageElement)) {
        return;
    }
    if (typeof source === 'string') {
        imageEl.src = source;
    } else {
        const blob = new Blob([source], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        imageEl.src = url;
    }
}

// checks wheather the URL is valid
function isValidUrl(string: string) {
  try { return Boolean(new URL(string)); }
  catch (e) { return false; }
}