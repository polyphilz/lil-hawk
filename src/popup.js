const DEFAULT_MODEL = "gpt-3.5-turbo";

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
  let legalInput = document.getElementById("legal-input");
  let infoLink = document.getElementById("info-link");
  let infoTooltip = document.getElementById("info-tooltip");
  let openAiApiKeyInput = document.getElementById("openai-api-key");
  let modelRadios = document.getElementsByName("gpt-version");
  let submitButton = document.getElementById("submit-button");
  let egregiousnessTextArea = document.getElementById("egregious-likely");
  let cancelRequestContainer = document.getElementById(
    "cancel-request-container"
  );
  let cancelRequest = document.getElementById("cancel-request");

  infoLink.addEventListener("mouseover", function () {
    infoTooltip.classList.remove("hidden");
  });

  infoLink.addEventListener("mouseout", function () {
    infoTooltip.classList.add("hidden");
  });

  infoLink.addEventListener("click", function (event) {
    event.preventDefault();
  });

  // Set all initial form values on load.
  chrome.storage.local.get(
    [
      "selectionMode",
      "textContent",
      "openAiApiKey",
      "selectedModel",
      "submitInFlight",
      "egregiousContent",
    ],
    (result) => {
      const selectionModeEnabled = result.selectionMode || false;
      const legalText = result.textContent || "";
      const openAiApiKey = result.openAiApiKey || "";
      const selectedModel = result.selectedModel || DEFAULT_MODEL;
      const submitInFlight = result.submitInFlight || false;
      const egregiousContent = result.egregiousContent || "";

      // SELECTION MODE
      selectionModeCheckbox.checked = selectionModeEnabled;

      // LEGAL INPUT
      legalInput.value = legalText;

      // API KEY
      openAiApiKeyInput.value = openAiApiKey;

      // SELECTED MODEL
      modelRadios.forEach((radio) => {
        if (radio.value === selectedModel) {
          radio.checked = true;
        }
      });

      // SUBMIT BUTTON DISABLED OR NOT
      submitButton.disabled = submitInFlight;

      // EGREGIOUS CONTENT
      egregiousnessTextArea.value = egregiousContent;
    }
  );

  // Set all event listeners.
  selectionModeCheckbox.addEventListener("change", function () {
    chrome.storage.local.set({ selectionMode: this.checked }, () => {
      console.log(`lil' hawk [popup] - Selection mode set to: ${this.checked}`);
    });
  });

  legalInput.addEventListener("input", function () {
    chrome.storage.local.set({ textContent: this.value });
  });

  openAiApiKeyInput.addEventListener("input", function () {
    chrome.storage.local.set({ openAiApiKey: this.value });
  });

  modelRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked) {
        const selectedModel = this.value;
        chrome.storage.local.set({ selectedModel }, function () {
          if (chrome.runtime.lastError) {
            console.error(
              "lil' hawk [popup] - Error setting value to Chrome storage: ",
              chrome.runtime.lastError
            );
          } else {
            console.log(
              "lil' hawk [popup] - Saved model to Chrome storage: ",
              selectedModel
            );
          }
        });
      }
    });
  });

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

      chrome.storage.local.get(["selectedModel"], (result) => {
        let model = result.selectedModel;
        let prompt = `The following document is a legal agreement/contract (e.g. Terms & Conditions, Terms of Service, rental agreement, etc). Please highlight any content in the document that is overly "egregious" (i.e. has anti-consumer privacy policies, anti-renter clauses, harvests too much data or any other sort of potentially nefarious statements). Feel free to also highlight amusing, funny, generally interesting and/or dystopian clauses. Next to each highlight, add a short summary of why you believe that clause could be considered problematic. Return the results as a list of bullet points with 2 newlines in between:\n\n${legalInput.value}?`;

        cancelRequestContainer.classList.remove("hidden");

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

  const setEgregiousContent = (content) => {
    egregiousnessTextArea.value = content;
    submitButton.disabled = false;
  };

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "displayEgregiousContent") {
      cancelRequestContainer.classList.add("hidden");
      setEgregiousContent(request.data);
    }
  });

  cancelRequest.addEventListener("click", function (event) {
    event.preventDefault();
    chrome.runtime.sendMessage({
      message: "cancelApiRequest",
    });
  });
});
