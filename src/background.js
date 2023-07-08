chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "toggleSelectionMode") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "toggleSelectionMode",
      });
    });
  } else if (request.message === "removeAllHighlights") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "removeAllHighlights",
      });
    });
  } else if (request.message === "sendToOpenAIChatAPI") {
    let model = request.data.model;
    let prompt = request.data.prompt;
    let apiKey = request.data.apiKey;

    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        chrome.storage.local.set(
          { egregiousContent: data.choices[0].message.content },
          () => {
            chrome.storage.local.set({ submitInFlight: false }, () => {
              chrome.runtime.sendMessage({
                message: "displayEgregiousContent",
                data: data.choices[0].message.content,
              });
            });
          }
        );
      })
      .catch((error) => {
        chrome.storage.local.set({ submitInFlight: false }, () => {
          console.error("Error:", error);
        });
      });
  }
});
