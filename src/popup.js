const wittyStatements = [
  "Unleashing our AI legal eagle...",
  "Analyzing with AI-powered x-ray vision...",
  "Let's see what they're trying to hide...",
  "Scanning for shady shenanigans...",
  "Turning the legal jargon inside out...",
  "Summoning our digital detective...",
  "Reading the fine print so you don't have to...",
  "Exposing the hidden gotchas...",
  "Using AI to translate lawyer-speak...",
  "Unraveling the legalese...",
  "Doing the legal limbo - how low can they go?",
  "Decoding cryptic clauses...",
  "Checking under the legal hood...",
  "Squinting at the small print...",
  "One moment, scanning the terms...",
  "Let's put these terms on the stand...",
  "Order in the court! Reviewing the terms...",
  "The AI is in session. Reviewing the terms...",
  "Serving justice one term at a time...",
  "Our AI is putting on its glasses, ready to review...",
];

document.addEventListener("DOMContentLoaded", function () {
  let selectionModeCheckbox = document.getElementById("selection-mode-toggle");
  let tcInput = document.getElementById("tc-input");
  let openAiApiKeyInput = document.getElementById("openai-api-key");
  let modelToggle = document.getElementById("gpt-toggle");
  let submitButton = document.getElementById("submit-button");
  let egregiousnessTextArea = document.getElementById("egregious-likely");

  chrome.storage.local.get(["selectionMode"], (result) => {
    selectionModeCheckbox.checked = result.selectionMode;

    selectionModeCheckbox.addEventListener("change", function () {
      chrome.storage.local.set({ selectionMode: this.checked }, function () {
        chrome.runtime.sendMessage({
          message: this.checked ? "toggleSelectionMode" : "removeAllHighlights",
        });
      });
    });
  });

  chrome.storage.local.get(["textContent"], (result) => {
    tcInput.value = result.textContent || "";

    tcInput.addEventListener("input", function () {
      chrome.storage.local.set({ textContent: this.value });
    });
  });

  chrome.storage.local.get(["submitInFlight"], (result) => {
    submitButton.disabled = result.submitInFlight || false;

    submitButton.addEventListener("click", () => {
      let apiKey = openAiApiKeyInput.value;

      if (!apiKey) {
        openAiApiKeyInput.classList.add("input-error");
        return;
      } else {
        openAiApiKeyInput.classList.remove("input-error");
      }

      chrome.storage.local.set({ submitInFlight: true }, () => {
        submitButton.disabled = true;

        let model = modelToggle.checked ? "gpt-4" : "gpt-3.5-turbo";
        let prompt = `Please highlight any content in the following legal text that is overly "egregious" (i.e. has anti-consumer privacy policies, harvests too much data or any other sort of potentially nefarious terms and conditions). Feel free to also highlight amusing, funny, generally interesting and/or "outrageous" clauses:\n\n${tcInput.value}?`;
        chrome.runtime.sendMessage({
          message: "sendToOpenAIChatAPI",
          data: { model, prompt, apiKey },
        });

        let randomIndex = Math.floor(Math.random() * wittyStatements.length);
        const randomStatement = wittyStatements[randomIndex];
        chrome.storage.local.set({ egregiousContent: randomStatement }, () => {
          egregiousnessTextArea.value = wittyStatements[randomIndex];
        });
      });
    });
  });

  chrome.storage.local.get(["egregiousContent"], (result) => {
    egregiousnessTextArea.value = result.egregiousContent || "";

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.message === "displayEgregiousContent") {
        egregiousnessTextArea.value = request.data;

        submitButton.disabled = false;
      }
    });
  });
});
