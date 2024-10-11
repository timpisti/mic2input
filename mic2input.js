(function() {
  console.log('mic2input::Speech recognition code started');

  if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
    console.error('mic2input:: Speech recognition not supported in this browser');
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.recognizing = false;

  console.log('mic2input::Speech recognition object created');

  const supportedTypes = ['text', 'number', 'email', 'search', 'tel', 'url', 'password'];
  
  const micSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
  const recSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="red"/></svg>`;

  function createWrapper(el) {
    console.log('mic2input::Creating wrapper for', el);
    const wrapper = document.createElement('div');
    wrapper.className = 'speech-to-text-wrapper';
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.width = '100%';
    return wrapper;
  }


  function createIcon() {
    console.log('mic2input::Creating microphone icon');
    const icon = document.createElement('div');
    icon.className = 'microphone-icon';
    icon.innerHTML = micSvg;
    icon.style.position = 'absolute';
    icon.style.right = '5px';
    icon.style.top = '5px';
    icon.style.cursor = 'pointer';
    return icon;
  }


  function appendIcon(el) {
    console.log('mic2input::Appending icon to', el);
    if (el.parentNode.classList.contains('speech-to-text-wrapper')) {
      console.log('mic2input::Icon already appended');
      return;
    }

    const wrapper = createWrapper(el);
    const icon = createIcon();

    if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
      wrapper.appendChild(el.cloneNode(true));
      el.parentNode.replaceChild(wrapper, el);
    } else {
      // For contenteditable elements
      console.log('mic2input::Appending icon to contenteditable element');
      el.parentNode.insertBefore(wrapper, el);
      wrapper.appendChild(el);
    }
    wrapper.appendChild(icon);

    // Adjust styles for contenteditable elements
    if (el.getAttribute('contenteditable') === 'true') {
      console.log('mic2input::Adjusting styles for contenteditable element');
      wrapper.style.display = 'block';
      el.style.paddingRight = '30px';
    }
  }


  let lastClickTime = 0;
  function handleIconClick(event) {
    console.log('mic2input::Click event triggered');
    console.log('mic2input::Clicked element:', event.target);
    console.log('mic2input::Clicked element classes:', event.target.className);
    console.log('mic2input::Clicked element parent:', event.target.parentElement);
    console.log('mic2input::Clicked element parent classes:', event.target.parentElement.className);

    try {
      if (event.target.classList.contains('microphone-icon') || event.target.closest('.microphone-icon')) {
        console.log('mic2input::Microphone icon or its child element confirmed');
        const now = Date.now();
        if (now - lastClickTime < 300) {
          console.log('mic2input::Debouncing click');
          return;
        }
        lastClickTime = now;

        const wrapper = event.target.closest('.speech-to-text-wrapper');
        console.log('mic2input::Wrapper found:', wrapper);
        if (!wrapper) {
          throw new Error('mic2input:: Speech-to-text wrapper not found');
        }

        const el = wrapper.querySelector('input, textarea') || wrapper.querySelector('[contenteditable]');
        console.log('mic2input::Target element found:', el);
        if (!el) {
          throw new Error('mic2input:: Target input element not found');
        }

        checkPermissionAndStart(el, event.target.closest('.microphone-icon'));
      } else {
        console.log('mic2input::Clicked element is not a microphone icon');
      }
    } catch (error) {
      console.error('mic2input:: Error in handleIconClick:', error);
    }
  }

  function debugMicrophoneIcons() {
    console.log('mic2input::Debugging microphone icons');
    const icons = document.querySelectorAll('.microphone-icon');
    console.log('mic2input::Number of microphone icons found:', icons.length);
    icons.forEach((icon, index) => {
      console.log(`Icon ${index + 1}:`, icon);
      console.log(`Icon ${index + 1} classes:`, icon.className);
      console.log(`Icon ${index + 1} innerHTML:`, icon.innerHTML);
    });
  }

 async function checkPermissionAndStart(el, iconEl) {
    console.log('mic2input::Checking permission and starting recognition');
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
      console.log('mic2input::Permission status:', permissionStatus.state);
      switch (permissionStatus.state) {
        case 'granted':
          console.log('mic2input::Permission granted');
          startRecognition(el, iconEl);
          break;
        case 'prompt':
          console.log('mic2input::Permission prompt shown');
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            startRecognition(el, iconEl);
          } catch (error) {
            console.error('mic2input:: Error getting user media:', error);
            showError(el, "Error accessing microphone: " + error.message);
          }
          break;
        case 'denied':
          console.error('mic2input:: Permission denied');
          showError(el, "Microphone permission denied");
          break;
        default:
          console.error('mic2input:: Unknown permission state:', permissionStatus.state);
          showError(el, "Unknown microphone permission state");
      }
    } catch (error) {
      console.error('mic2input:: Error checking permission:', error);
      showError(el, "Error accessing microphone: " + error.message);
    }
  }

  function startRecognition(el, iconEl) {
    console.log('mic2input::Starting recognition');
    if (recognition.recognizing) {
      console.log('mic2input::Recognition already in progress');
      return;
    }
    recognition.recognizing = true;
    iconEl.innerHTML = recSvg;
    
    try {
      recognition.start();
      console.log('mic2input::Recognition started successfully');
    } catch (error) {
      console.error('mic2input:: Error starting recognition:', error);
      showError(el, "Error starting speech recognition: " + error.message);
      iconEl.innerHTML = micSvg;
      recognition.recognizing = false;
      return;
    }

    recognition.onresult = (event) => {
      console.log('mic2input::Recognition result event received:', event);
      if (event.results.length > 0) {
        const transcript = event.results[0][0].transcript;
        console.log('mic2input::Transcript:', transcript);
        appendTranscript(el, transcript);
      } else {
        console.warn('mic2input:: No results in the recognition event');
      }
    };

    recognition.onend = () => {
      console.log('mic2input::Recognition ended');
      iconEl.innerHTML = micSvg;
      recognition.recognizing = false;
    };

    recognition.onerror = (event) => {
      console.error('mic2input:: Recognition error:', event);
      showError(el, "Recognition error: " + event.error);
      iconEl.innerHTML = micSvg;
      recognition.recognizing = false;
    };
  }

	function appendTranscript(el, transcript) {
	  console.log('mic2input::Appending transcript to', el);
	  console.log('mic2input::Element type:', el.tagName.toLowerCase());
	  console.log('mic2input::Element attributes:', Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' '));
	  console.log('mic2input::Transcript to append:', transcript);

	  try {
		if (el.tagName.toLowerCase() === 'input' || el.tagName.toLowerCase() === 'textarea') {
		  const originalValue = el.value;
		  switch(el.type) {
			case 'number':
			  const number = transcript.replace(/[^0-9.-]/g, '');
			  el.value = el.value ? el.value + number : number;
			  break;
			case 'email':
			  el.value += transcript.replace(/\s+/g, '').toLowerCase();
			  break;
			case 'tel':
			  el.value += transcript.replace(/[^0-9+()-]/g, '');
			  break;
			case 'password':
			  el.value += transcript.replace(/\s+/g, '');
			  break;
			default:
			  el.value += ' ' + transcript;
		  }
		  console.log('mic2input::Input value updated. Original:', originalValue, 'New:', el.value);
		} else if (el.getAttribute('contenteditable') === 'true') {
		  console.log('mic2input::Updating contenteditable element');
		  const originalContent = el.innerHTML;
		  el.innerHTML = originalContent + ' ' + transcript;
		  console.log('mic2input::Contenteditable element updated. Original:', originalContent, 'New:', el.innerHTML);
		} else {
		  console.warn('mic2input:: Unhandled element type:', el.tagName.toLowerCase());
		}
	  } catch (error) {
		console.error('mic2input:: Error appending transcript:', error);
	  }
	}

  
  function showError(el, message) {
    console.log('mic2input::Showing error:', message);
    const wrapper = el.closest('.speech-to-text-wrapper');
    let tooltip = wrapper.querySelector('.tooltip');
    
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.backgroundColor = 'black';
      tooltip.style.color = 'white';
      tooltip.style.padding = '5px';
      tooltip.style.borderRadius = '5px';
      tooltip.style.fontSize = '12px';
      tooltip.style.bottom = '-25px';
      tooltip.style.left = '0';
      tooltip.style.zIndex = '1000';
      wrapper.appendChild(tooltip);
    }

    tooltip.textContent = message;
    tooltip.style.display = 'block';
    setTimeout(() => tooltip.style.display = 'none', 3000);
  }

  function handleNewElements(mutations) {
    console.log('mic2input::Handling new elements');
    for (let mutation of mutations) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const selector = supportedTypes.map(type => `input[type="${type}"]`).join(',') + ',textarea,[contenteditable="true"]';
            node.querySelectorAll(selector).forEach(appendIcon);
            
            if (node.shadowRoot) {
              console.log('mic2input::Checking shadow root');
              node.shadowRoot.querySelectorAll(selector).forEach(appendIcon);
            }
          }
        });
      }
    }
  }

  const observer = new MutationObserver(handleNewElements);
  observer.observe(document.body, { childList: true, subtree: true });

  const selector = supportedTypes.map(type => `input[type="${type}"]`).join(',') + ',textarea,[contenteditable="true"]';
  document.querySelectorAll(selector).forEach(appendIcon);
  setTimeout(debugMicrophoneIcons, 1000);

  document.addEventListener('click', handleIconClick);
  console.log('mic2input::Click event listener added');

  function observeShadowRoots(mutations) {
    console.log('mic2input::Observing shadow roots');
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.shadowRoot) {
            console.log('mic2input::Checking shadow root');
            const elements = node.shadowRoot.querySelectorAll(selector);
            elements.forEach(appendIcon);
          }
        }
      });
    });
  }

  const shadowRootObserver = new MutationObserver(observeShadowRoots);
  shadowRootObserver.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial check for existing shadow roots
  console.log('mic2input::Checking for existing shadow roots');
  document.querySelectorAll('*').forEach(el => {
    if (el.shadowRoot) {
      console.log('mic2input::Checking shadow root');
      const elements = el.shadowRoot.querySelectorAll(selector);
      elements.forEach(appendIcon);
    }
  });
})();
