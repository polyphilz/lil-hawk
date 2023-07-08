A Chrome Manifest V3 extension that offers a popup UI that contains a few elements:

- A checkbox called "selection mode enabled"
- A text area called "T&C input"
- A button called "Submit"
- A non-editable text area called "egregious likely!"
- A text input called "OpenAI API key" that allows a user to enter an OpenAI API key
- A slider that has the left option being GPT 3.5 and the right option being GPT 4. Default is left (GPT 3.5)

When the "selection mode enabled" checkbox is enabled, the user can now mouse over any UI element on the page they are currently on, and that UI element will get highlighted in a light red color with some transparency to it. If they then hit "esc" on their keyboard, "selection mode enabled" checkbox should be turned off and the text content of the UI element they were mousing over (and all of its children by extension) should be gathered and inputted into the first text area "T&C input." Keep in mind that this textarea is able to be edited by the user so they can manually enter stuff in here if they choose to do so also. The submit button is disabled unless the user enters an API key in the text input "OpenAI API key." Once they do so, the submit button is clickable. When clicked, it will send everything in the first text area to the OpenAI Chat API (gpt-3.5-turbo if the slider is on GPT 3.5 else gpt-4 if the slider is on GPT 4). The prompt should be something along the lines of asking whether any content from the text sent is 'egregious.' This is because that content is a terms and conditions document, and contains potentially obscure legalese. Egregious content returned from the API should then be added to the non-editable "egregious likely!" text area.
