# mic2input: Speech-to-Text Input Enhancement
====================================================

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub version](https://badge.fury.io/gh/mic2input%2Fmic2input.svg)](https://github.com/mic2input/mic2input)

## Overview
mic2input is a lightweight JavaScript utility that integrates speech recognition into input fields (`text`, `number`, `email`, `tel`, `url`, `password`) and `contenteditable` elements. It adds a microphone icon to these elements even in shadowroot of web components or after dynamic html content change, enabling users to provide voice input, with real-time speech recognition support for dynamic typing.

## Features

* Speech Recognition Support: Works for text-based input fields and `contenteditable` elements, leveraging native speech recognition APIs (`SpeechRecognition` or `webkitSpeechRecognition`).
* Automatic Icon Insertion: Automatically appends a microphone icon to supported elements, allowing users to trigger voice input.
* Microphone Permission Handling: Handles microphone permission prompts with fallbacks in case of access denial.
* Dynamic Transcript Insertion: Inserts recognized speech into the targeted input or `contenteditable` element, including specialized handling for number, email, telephone, and password inputs.
* Graceful Error Handling: Displays user-friendly error messages in case of recognition errors or permission issues.

## Installation
To integrate mic2input into your project, simply include the script:

```html
<script src="path-to-mic2input.js"></script>
```
This will activate the utility, automatically adding microphone icons to the supported fields and elements on your page.

## How It Works
### Speech Recognition Initialization
* The script checks for browser support for speech recognition.
* If unsupported, it logs an error and does not execute further.

### Element Handling
* Automatically identifies input fields (`text`, `number`, `email`, etc.) and `contenteditable` elements.
* Appends a microphone icon for each supported element.

### Voice Input Processing
* When the icon is clicked, the script checks for microphone permissions.
* Upon successful permission, it starts listening to the user’s speech and inserts the recognized transcript into the element.

### Specialized Input Types
* Handles different input types (e.g., number, email, tel) with specific rules for transcript formatting.

### Error Management
* Provides clear error messages (e.g., microphone access denied, speech recognition failure) displayed as tooltips on the input field.

## Usage
Once the script is included on your page, mic2input will automatically enhance all input fields with voice input capabilities. No additional configuration is required.

Supported input types and elements:

* `input[type="text"]`
* `input[type="number"]`
* `input[type="email"]`
* `input[type="search"]`
* `input[type="tel"]`
* `input[type="url"]`
* `input[type="password"]`
* `textarea`
* `[contenteditable="true"]`

Example of a `contenteditable` element:

```html
<div contenteditable="true" id="editable-text"></div>
```

## Permissions Handling
The script manages microphone permissions based on the browser’s current state:

* Granted: Starts recognition immediately.
* Prompted: Shows a permission prompt and retries after the user grants access.
* Denied: Displays a tooltip message indicating microphone access denial.

## Icon Customization
The default microphone and recording icons can be customized by updating the `micSvg` and `recSvg` variables in the script.

## Error Handling
Errors during speech recognition are displayed as tooltips. You can customize the error message appearance by modifying the tooltip style in the script.

## Browser Support
mic2input supports modern browsers with native speech recognition capabilities:

* Chrome (with `webkitSpeechRecognition`)
* Other browsers that support `SpeechRecognition`

Note: Safari and older versions of Internet Explorer are not supported.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contribution
Feel free to submit issues or pull requests if you'd like to improve the functionality or add features to the project.
