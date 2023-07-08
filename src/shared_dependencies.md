the files we have decided to generate are: 

- `manifest.json`
- `popup.html`
- `popup.js`
- `background.js`
- `styles.css`

Shared dependencies between these files:

- Exported Variables: `selectionModeEnabled`, `tAndCInput`, `submitButton`, `egregiousLikely`, `openAIKey`, `sliderValue`
- Data Schemas: None
- ID Names of DOM Elements: `selection-mode-enabled`, `tc-input`, `submit-button`, `egregious-likely`, `openai-api-key`, `gpt-slider`
- Message Names: `toggleSelectionMode`, `gatherTextContent`, `validateAPIKey`, `sendToOpenAIChatAPI`, `displayEgregiousContent`
- Function Names: `enableSelectionMode`, `gatherText`, `validateKey`, `sendToAPI`, `displayContent`