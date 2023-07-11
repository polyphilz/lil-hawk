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
  if (hoveredElement) {
    removeHighlight(hoveredElement);
  }
  hoveredElement = event.target;
  highlightElement(hoveredElement);
};

const keydownListener = (event) => {
  if (event.key === "Escape") {
    chrome.storage.local.set({ selectionMode: false }, () => {
      if (hoveredElement) {
        let textContent = gatherText(hoveredElement);
        chrome.storage.local.set({ textContent }, () => {
          removeHighlight(hoveredElement);
          hoveredElement = null;
        });
      }
    });
  }
};

chrome.storage.local.get(["selectionMode"], (result) => {
  if (result.selectionMode) {
    document.addEventListener("mouseover", highlightElementListener);
    document.addEventListener("keydown", keydownListener);
  } else {
    document.removeEventListener("mouseover", highlightElementListener);
    document.removeEventListener("keydown", keydownListener);
    removeAllHighlights();
  }
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.selectionMode) {
    if (changes.selectionMode.newValue) {
      document.addEventListener("mouseover", highlightElementListener);
      document.addEventListener("keydown", keydownListener);
    } else {
      document.removeEventListener("mouseover", highlightElementListener);
      document.removeEventListener("keydown", keydownListener);
      removeAllHighlights();
    }
  }
});
