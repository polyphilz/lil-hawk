const infoLink = document.getElementById("info-link");
const infoTooltip = document.getElementById("info-tooltip");

infoLink.addEventListener("mouseover", function () {
  infoTooltip.classList.remove("hidden");
});

infoLink.addEventListener("mouseout", function () {
  infoTooltip.classList.add("hidden");
});

infoLink.addEventListener("click", function (event) {
  event.preventDefault();
});

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
  let modelRadios = document.getElementsByName("gpt-version");
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

  chrome.storage.local.get(["selectedModel"], (result) => {
    modelRadios.forEach((radio) => {
      if (radio.value === result.selectedModel) {
        radio.checked = true;
      }

      radio.addEventListener("change", function () {
        if (this.checked) {
          const selectedModel = this.value;
          chrome.storage.local.set({ selectedModel }, function () {
            if (chrome.runtime.lastError) {
              console.error(
                "Error setting value to chrome storage: ",
                chrome.runtime.lastError
              );
            } else {
              console.log(
                "Saved selectedModel to chrome storage: ",
                selectedModel
              );
            }
          });
        }
      });
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

        chrome.storage.local.get(["selectedModel"], (result) => {
          console.log(result.selectedModel);
          let model = result.selectedModel;
          let prompt = `Please highlight any content in the following legal text that is overly "egregious" (i.e. has anti-consumer privacy policies, harvests too much data or any other sort of potentially nefarious terms and conditions). Feel free to also highlight amusing, funny, generally interesting and/or dystopian clauses. Next to each highlight, add a short summary of why you believe that clause could be considered problematic. Return the results as a list of bullet points with 2 newlines in between:\n\n${tcInput.value}?`;
          chrome.runtime.sendMessage({
            message: "sendToOpenAIChatAPI",
            data: { model, prompt, apiKey },
          });

          let randomIndex = Math.floor(Math.random() * wittyStatements.length);
          const randomStatement = wittyStatements[randomIndex];
          chrome.storage.local.set(
            { egregiousContent: randomStatement },
            () => {
              egregiousnessTextArea.value = wittyStatements[randomIndex];
            }
          );
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
