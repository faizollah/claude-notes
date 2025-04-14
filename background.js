// Background script for Claude Notes extension

// Listen for installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Claude Notes extension installed or updated');
  
  // Initialize empty clips array in storage if it doesn't exist
  chrome.storage.local.get('claudeNotes', (result) => {
    if (!result.claudeNotes) {
      chrome.storage.local.set({ 'claudeNotes': [] });
    }
  });
});

// Set up action for toolbar icon clicks - toggle the notes panel
chrome.action.onClicked.addListener((tab) => {
  // For Claude.ai tabs, toggle the notes panel
  if (tab.url.includes('claude.ai')) {
    console.log('Toggling notes panel on Claude.ai tab');
    
    // First try to send a message to the content script
    chrome.tabs.sendMessage(
      tab.id,
      { action: 'toggleModal' },
      (response) => {
        // If there's an error (content script not ready), try to inject and initialize
        if (chrome.runtime.lastError) {
          console.error('Error toggling modal:', chrome.runtime.lastError);
          
          // Inject content script if it's not already loaded
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          }).then(() => {
            console.log('Content script injected, now trying to toggle modal again');
            // After injecting, try toggling the modal again after a short delay
            setTimeout(() => {
              chrome.tabs.sendMessage(
                tab.id,
                { action: 'toggleModal' },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.error('Still could not toggle modal:', chrome.runtime.lastError);
                    showNotification('Error', 'Could not display notes panel');
                  } else if (response && !response.success) {
                    // Handle error response from content script
                    console.log('Modal toggle failed:', response.error);
                    showNotification('Claude Notes', response.error || 'Please open a conversation to use Claude Notes');
                  } else {
                    console.log('Modal toggled after injection');
                  }
                }
              );
            }, 300);
          }).catch(err => {
            console.error('Could not inject content script:', err);
            showNotification('Error', 'Could not initialize Claude Notes');
          });
        } else if (response && !response.success) {
          // Handle error response from content script
          console.log('Modal toggle failed:', response.error);
          showNotification('Claude Notes', response.error || 'Please open a conversation to use Claude Notes');
        } else {
          console.log('Modal toggled successfully');
        }
      }
    );
  } else {
    // Notify user that the extension only works on Claude.ai
    showNotification('Claude Notes', 'This extension only works on Claude.ai');
  }
});

// Helper function to show notifications
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: title,
    message: message
  });
}

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message, 'from:', sender);
  
  // Handle toggle request coming *from* the content script (e.g., injected button)
  if (message.action === 'toggleModal') {
    // Ensure the message is from a content script in a tab
    if (sender.tab) {
      const tabId = sender.tab.id;
      console.log(`Forwarding toggleModal request to tab ${tabId}`);
      // Send the message back to the specific content script to perform the toggle
      chrome.tabs.sendMessage(
        tabId,
        { action: 'toggleModal' }, // Send the same action back
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending toggleModal back to content script:', chrome.runtime.lastError.message);
            // We might not be able to show notification if tab context is weird
            // showNotification('Error', 'Could not toggle notes panel.');
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else if (response && !response.success) {
            console.log('Content script failed to toggle modal:', response.error);
            showNotification('Claude Notes', response.error || 'Could not toggle notes panel.');
            sendResponse({ success: false, error: response.error });
          } else {
            console.log('Modal toggle initiated by content script successful.');
            sendResponse({ success: true });
          }
        }
      );
      return true; // Indicate async response
    } else {
      console.error('toggleModal message received without sender tab info.');
      sendResponse({ success: false, error: 'Internal error: Sender tab not found.' });
    }
  } else if (message.action === 'saveClip') {
    // Forward the clip to any open Claude.ai tabs
    chrome.tabs.query({url: 'https://claude.ai/*'}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message).catch(err => {
          console.error('Error sending message to tab:', err);
        });
      });
    });
    sendResponse({success: true});
    return true; // Indicate we'll respond asynchronously
  }
  
  if (message.action === 'openLibrary') {
    // Open the library in a new tab
    chrome.tabs.create({
      url: chrome.runtime.getURL('library.html')
    });
    sendResponse({success: true});
    return true;
  }
}); 