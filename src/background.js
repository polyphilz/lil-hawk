const fetchTimeout = (url, ms, { signal, ...options } = {}) => {
  const controller = new AbortController();
  const promise = fetch(url, { signal: controller.signal, ...options });
  if (signal) signal.addEventListener("abort", () => controller.abort());
  const timeout = setTimeout(() => controller.abort(), ms);
  return promise.finally(() => clearTimeout(timeout));
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "sendToOpenAIChatAPI") {
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
          "The request timed out. Sorry about that! Please try again later.\n\nIf you were using GPT 4 (8k), consider trying again with GPT 3.5 (16k) as the document might be too close to the 8k token limit.";
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
  }
});
