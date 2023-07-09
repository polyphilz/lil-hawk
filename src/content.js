let hoveredElement;
// If an element had a non-blank background color, we don't want to lose that
// information, so we store it here such that when `removeHighlight` is called
// over that element, the original background color is restored to it.
let originalColors = new Map();

const highlightElement = (element) => {
  originalColors.set(element, element.style.backgroundColor);
  element.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
};

const removeHighlight = (element) => {
  element.style.backgroundColor = originalColors.get(element) || "";
  originalColors.delete(element);
};

const gatherText = (element) => {
  return element.innerText;
};

document.addEventListener("mouseover", (event) => {
  chrome.storage.local.get(["selectionMode"], (result) => {
    if (result.selectionMode) {
      if (hoveredElement) {
        removeHighlight(hoveredElement);
      }
      hoveredElement = event.target;
      highlightElement(hoveredElement);
    }
  });
});

document.addEventListener("keydown", (event) => {
  chrome.storage.local.get(["selectionMode"], (result) => {
    if (result.selectionMode && event.key === "Escape") {
      chrome.storage.local.set({ selectionMode: false }, () => {
        console.log("lil' hawk: selection mode has been disabled.");

        if (hoveredElement) {
          let textContent = gatherText(hoveredElement);
          chrome.storage.local.set({ textContent }, () => {
            console.log("lil' hawk: T&C has been captured!");

            removeHighlight(hoveredElement);
            hoveredElement = null;
          });
        }
      });
    }
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "removeAllHighlights") {
    var elements = document.getElementsByTagName("*");
    for (var i = 0; i < elements.length; i++) {
      removeHighlight(elements[i]);
    }
  }
});
