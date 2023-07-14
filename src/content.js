var lilHawkHoveredElement;
// If an element had a non-blank background color, we don't want to lose that
// information, so we store it here such that when `removeHighlight` is called
// over that element, the original background color is restored to it.
var lilHawkOriginalColorMap = new Map();

const highlightElement = (element) => {
  lilHawkOriginalColorMap.set(element, element.style.backgroundColor);
  element.style.backgroundColor = "rgba(255, 0, 0, 0.3)";
};

const removeHighlight = (element) => {
  element.style.backgroundColor = lilHawkOriginalColorMap.get(element) || "";
  lilHawkOriginalColorMap.delete(element);
};

const removeAllHighlights = () => {
  var elements = document.getElementsByTagName("*");
  for (var i = 0; i < elements.length; i++) {
    removeHighlight(elements[i]);
  }
};

const gatherText = (element) => {
  return element.innerText;
};

const highlightElementListener = (event) => {
  if (lilHawkHoveredElement) {
    removeHighlight(lilHawkHoveredElement);
  }
  lilHawkHoveredElement = event.target;
  highlightElement(lilHawkHoveredElement);
};

const keydownListener = (event) => {
  if (event.key === "Escape") {
    if (lilHawkHoveredElement) {
      let textContent = gatherText(lilHawkHoveredElement);
      chrome.storage.local.set({ textContent }, () => {
        removeHighlight(lilHawkHoveredElement);
        lilHawkHoveredElement = null;
        document.removeEventListener("mouseover", highlightElementListener);
        document.removeEventListener("keydown", keydownListener);
      });
    }
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "start") {
    document.addEventListener("mouseover", highlightElementListener);
    document.addEventListener("keydown", keydownListener);
  }
});
