let controller;
let cancelledRequest = false;

const fetchTimeout = (url, ms, { signal, ...options } = {}) => {
  const promise = fetch(url, { signal: controller.signal, ...options });
  if (signal) signal.addEventListener("abort", () => controller.abort());
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "enableTextSelection") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentTabId = tabs[0].id;

      chrome.storage.local.get(["lilHawkContentInjectedTabs"], (result) => {
        let tabList = result.lilHawkContentInjectedTabs || [];
        // If the tab list has somehow reached 1,000 stored tabs, just clear it
        // out. By this point, the tabs that were saved should likely no longer
        // be active tabs in the user's browsing session.
        if (tabList.length >= 1_000) {
          tabList.length = 0;
        }
        if (!tabList.includes(currentTabId)) {
          tabList.push(currentTabId);
          chrome.storage.local.set(
            { lilHawkContentInjectedTabs: tabList },
            function () {
              chrome.scripting.executeScript(
                {
                  target: { tabId: currentTabId },
                  files: ["content.js"],
                },
                () => {
                  chrome.tabs.sendMessage(currentTabId, { message: "start" });
                  sendResponse({ message: "Text selection enabled" });
                }
              );
            }
          );
        } else {
          chrome.tabs.sendMessage(currentTabId, { message: "start" });
          sendResponse({ message: "Text selection enabled" });
        }
      });
    });

    return true;
  } else if (request.message === "sendToOpenAIChatAPI") {
    // Always make a new abort controller upon any fresh request, but save its
    // state globally so that you can cancel it too if the user opts to do so.
    controller = new AbortController();
    cancelledRequest = false;

    let model = request.data.model;
    let prompt = request.data.prompt;
    let apiKey = request.data.apiKey;

    fetchTimeout("https://api.openai.com/v1/chat/completions", 50_000, {
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
      .then((response) => {
        if (!response.ok) {
          const errorMessage =
            "There was an error. Sorry about that! Please try again later...";
          chrome.storage.local.set(
            {
              egregiousContent: errorMessage,
              submitInFlight: false,
            },
            () => {
              chrome.runtime.sendMessage({
                message: "displayEgregiousContent",
                data: errorMessage,
              });
            }
          );
        }
        return response.json();
      })
      .then((data) => {
        chrome.storage.local.set(
          {
            egregiousContent: data.choices[0].message.content,
            submitInFlight: false,
          },
          () => {
            chrome.runtime.sendMessage({
              message: "displayEgregiousContent",
              data: data.choices[0].message.content,
            });
          }
        );
      })
      .catch((error) => {
        const errorMessage =
          cancelledRequest === true
            ? ""
            : "The request timed out. Sorry about that! Please try again later.\n\nIf you were using GPT 4 (8k), consider trying again with GPT 3.5 (16k) as the document might be too close to the 8k token limit.";
        chrome.storage.local.set(
          {
            egregiousContent: errorMessage,
            submitInFlight: false,
          },
          () => {
            chrome.runtime.sendMessage({
              message: "displayEgregiousContent",
              data: errorMessage,
            });
          }
        );
      });
  } else if (request.message === "cancelApiRequest") {
    cancelledRequest = true;
    controller.abort();
  }
});
