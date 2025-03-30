// Global variables
let noteModal;
let clips = [];
let allClips = {}; // Organized by conversation ID
let currentClipId = 0;
let currentConversationId = '';
let conversationTitle = '';
let needsUpdate = false;

// Initialize extension
function init() {
  // Only run on Claude.ai
  if (!window.location.href.includes('claude.ai')) return;
  
  console.log('Claude Notes: Initializing extension...');
  
  // Extract conversation ID from URL
  currentConversationId = extractConversationId();
  
  // Log the full page title
  console.log('Full page title:', document.title);
  
  // Get conversation title
  conversationTitle = document.title.replace(' - Claude', '').trim();
  
  console.log('Current conversation:', currentConversationId, conversationTitle);
  
  // Create modal if it doesn't exist yet
  if (!document.getElementById('claude-notes-modal')) {
    createModal();
    // Show modal on initial load
    noteModal.style.display = 'flex';
  }
  
  // Load saved clips
  loadClips();
  
  // Add event listeners
  document.addEventListener('mouseup', handleTextSelection);
  
  // Apply highlights to any existing clips
  applyHighlights();
}

// Extract conversation ID from URL
function extractConversationId() {
  const url = window.location.href;
  const match = url.match(/\/chat\/([a-zA-Z0-9-]+)/);
  return match ? match[1] : 'default';
}

// Ensure initialization runs at the right time
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Also run on dynamic navigation (for SPA behavior)
window.addEventListener('load', init);
window.addEventListener('popstate', init);

// Create the floating modal
function createModal() {
  // Create modal container
  noteModal = document.createElement('div');
  noteModal.id = 'claude-notes-modal';
  noteModal.style.position = 'fixed';
  noteModal.style.top = '100px';
  noteModal.style.right = '100px';
  noteModal.style.width = '300px';
  noteModal.style.minHeight = '100px';
  noteModal.style.maxHeight = '500px';
  noteModal.style.backgroundColor = '#fff';
  noteModal.style.border = '1px solid #ccc';
  noteModal.style.borderRadius = '8px';
  noteModal.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  noteModal.style.zIndex = '10000';
  noteModal.style.overflow = 'hidden';
  noteModal.style.display = 'none'; // Start hidden
  noteModal.style.flexDirection = 'column';
  noteModal.style.fontFamily = 'Arial, sans-serif';
  
  // Create modal header
  const modalHeader = document.createElement('div');
  modalHeader.id = 'claude-notes-header';
  modalHeader.style.padding = '12px';
  modalHeader.style.backgroundColor = '#f5f5f5';
  modalHeader.style.borderBottom = '1px solid #ddd';
  modalHeader.style.cursor = 'move';
  modalHeader.style.display = 'flex';
  modalHeader.style.justifyContent = 'space-between';
  modalHeader.style.alignItems = 'center';
  
  const modalTitle = document.createElement('span');
  modalTitle.id = 'claude-notes-title';
  modalTitle.textContent = 'Claude Notes';
  modalTitle.style.fontWeight = 'bold';
  
  const closeButton = document.createElement('button');
  closeButton.textContent = '✕';
  closeButton.style.background = 'none';
  closeButton.style.border = 'none';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '16px';
  closeButton.addEventListener('click', () => {
    noteModal.style.display = 'none';
  });
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.id = 'claude-notes-content';
  modalContent.style.padding = '12px';
  modalContent.style.overflowY = 'auto';
  modalContent.style.flex = '1';
  
  // Create modal actions
  const modalActions = document.createElement('div');
  modalActions.style.padding = '12px';
  modalActions.style.borderTop = '1px solid #ddd';
  modalActions.style.display = 'flex';
  modalActions.style.justifyContent = 'space-between';
  
  // Add "View All Notes" link
  const viewAllLink = document.createElement('a');
  viewAllLink.textContent = 'View All Notes';
  viewAllLink.href = '#';
  viewAllLink.style.backgroundColor = '#5E72E4';
  viewAllLink.style.color = 'white';
  viewAllLink.style.padding = '8px 12px';
  viewAllLink.style.borderRadius = '4px';
  viewAllLink.style.textDecoration = 'none';
  viewAllLink.style.display = 'inline-block';
  viewAllLink.style.cursor = 'pointer';
  viewAllLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.sendMessage({ action: 'openLibrary' });
  });
  
  const clearButton = document.createElement('button');
  clearButton.textContent = 'Clear All';
  clearButton.style.padding = '8px 12px';
  clearButton.style.backgroundColor = '#f44336';
  clearButton.style.color = 'white';
  clearButton.style.border = 'none';
  clearButton.style.borderRadius = '4px';
  clearButton.style.cursor = 'pointer';
  clearButton.addEventListener('click', clearAllClips);
  
  modalActions.appendChild(viewAllLink);
  modalActions.appendChild(clearButton);
  
  // Assemble modal
  noteModal.appendChild(modalHeader);
  noteModal.appendChild(modalContent);
  noteModal.appendChild(modalActions);
  
  // Add modal to document
  document.body.appendChild(noteModal);
  
  // Make modal draggable
  makeDraggable(noteModal, modalHeader);
}

// Make an element draggable
function makeDraggable(element, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  
  handle.onmousedown = dragMouseDown;
  
  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // Get the mouse cursor position at startup
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // Call a function whenever the cursor moves
    document.onmousemove = elementDrag;
  }
  
  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // Calculate the new cursor position
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // Set the element's new position
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
    // If moving from default position, set right to auto
    if (element.style.right) {
      element.style.right = 'auto';
    }
  }
  
  function closeDragElement() {
    // Stop moving when mouse button is released
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Find the Claude message container from a node
function findMessageContainer(node) {
  // Look for Claude.ai message containers
  // Claude has updated its DOM structure multiple times, so we need to be comprehensive
  if (!node) return null;
  
  // Walk up the DOM tree to find a suitable container
  while (node && node !== document.body) {
    // Check for various class names and attributes that might indicate a message container
    
    // Direct class-based checks - check both className string and classList
    const className = node.className || '';
    if (typeof className === 'string') {
      // Check for common patterns in Claude's class names
      if (className.includes('message') || 
          className.includes('claude') || 
          className.includes('assistant') ||
          className.includes('prose') ||
          className.includes('text-message')) {
        return node;
      }
    }
    
    // Check using classList API if available
    if (node.classList && (
        node.classList.contains('message') || 
        node.classList.contains('claude-message') ||
        node.classList.contains('assistant-message') ||
        node.classList.contains('prose') ||
        node.classList.contains('assistant-content') ||
        node.classList.contains('whitespace-pre-wrap')
      )) {
      return node;
    }
    
    // Role-based checks for accessibility attributes
    if (node.getAttribute) {
      const role = node.getAttribute('role');
      const ariaLabel = node.getAttribute('aria-label');
      
      if ((role === 'region' || role === 'article') && 
          ariaLabel && 
          (ariaLabel.includes('Assistant') || ariaLabel.includes('Claude'))) {
        return node;
      }
    }
    
    // Data attribute checks
    if (node.dataset && 
        (node.dataset.message || 
         node.dataset.assistant || 
         node.dataset.claude)) {
      return node;
    }
    
    // Move up to parent node
    node = node.parentNode;
  }
  
  // If we can't find a container but we're definitely in the message area,
  // try to find a generic container that's large enough to be a message
  if (window.location.href.includes('claude.ai/chat')) {
    // Check if we're near any text that looks like a message
    if (node && node.textContent && node.textContent.length > 50) {
      console.log('Found potential generic message container');
      return node;
    }
  }
  
  return null;
}

// Handle text selection
function handleTextSelection(e) {
  const selection = window.getSelection();
  if (!selection.toString().trim()) {
    // Remove clip button if no text is selected
    const existingButton = document.getElementById('claude-notes-clip-button');
    if (existingButton) {
      document.body.removeChild(existingButton);
    }
    return;
  }
  
  console.log('Text selected:', selection.toString().trim());
  
  // Check if selection is within a Claude message
  const range = selection.getRangeAt(0);
  const container = findMessageContainer(range.commonAncestorContainer);
  
  if (container) {
    console.log('Found message container:', container);
    // Create clip button near selection if it doesn't exist
    if (!document.getElementById('claude-notes-clip-button')) {
      createClipButton(selection);
    } else {
      // Update position of existing button
      updateClipButtonPosition(selection);
    }
  } else {
    console.log('No message container found for selection');
  }
}

// Create a clip button near the selected text
function createClipButton(selection) {
  // Remove any existing button first
  const existingButton = document.getElementById('claude-notes-clip-button');
  if (existingButton) {
    document.body.removeChild(existingButton);
  }
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  const clipButton = document.createElement('button');
  clipButton.id = 'claude-notes-clip-button';
  clipButton.textContent = 'Clip';
  clipButton.style.position = 'absolute';
  clipButton.style.left = `${rect.right + window.scrollX}px`;
  clipButton.style.top = `${rect.top + window.scrollY - 30}px`;
  clipButton.style.zIndex = '10001';
  clipButton.style.padding = '5px 10px';
  clipButton.style.backgroundColor = '#5E72E4';
  clipButton.style.color = 'white';
  clipButton.style.border = 'none';
  clipButton.style.borderRadius = '4px';
  clipButton.style.cursor = 'pointer';
  clipButton.style.fontSize = '14px';
  clipButton.style.fontWeight = 'bold';
  clipButton.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  
  clipButton.addEventListener('click', () => {
    saveClip(selection);
    // Don't remove the button immediately to provide visual feedback
    clipButton.textContent = 'Saved!';
    clipButton.style.backgroundColor = '#4CAF50';
    setTimeout(() => {
      if (document.body.contains(clipButton)) {
        document.body.removeChild(clipButton);
      }
    }, 1000);
  });
  
  document.body.appendChild(clipButton);
  
  // Remove clip button when clicking elsewhere or after a timeout
  const removeClipButton = (e) => {
    if (e && e.target === clipButton) return;
    
    // Only remove if it still exists
    const button = document.getElementById('claude-notes-clip-button');
    if (button) {
      document.body.removeChild(button);
    }
    document.removeEventListener('mousedown', removeClipButton);
  };
  
  document.addEventListener('mousedown', removeClipButton);
  
  // Set a longer timeout to ensure button visibility
  setTimeout(() => removeClipButton(), 5000);
}

// Update the clip button position when selection changes
function updateClipButtonPosition(selection) {
  const clipButton = document.getElementById('claude-notes-clip-button');
  if (!clipButton) return;
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  clipButton.style.left = `${rect.right + window.scrollX}px`;
  clipButton.style.top = `${rect.top + window.scrollY - 30}px`;
}

// Save the selected text as a clip
function saveClip(selection) {
  const selectedText = selection.toString().trim();
  if (!selectedText) return;
  
  // Create a new clip object
  const clip = {
    id: currentClipId++,
    text: selectedText,
    timestamp: new Date().toISOString(),
    range: getRangeInfo(selection.getRangeAt(0)),
    url: window.location.href
  };
  
  // Add to clips array for current conversation
  clips.push(clip);
  
  // Update the master object
  allClips[currentConversationId].clips = clips;
  allClips[currentConversationId].lastUpdated = new Date().toISOString();
  
  // Save to Chrome storage
  chrome.storage.local.set({ 'claudeNotesV2': allClips }, () => {
    console.log('Claude Notes: Clip saved to conversation', currentConversationId);
  });
  
  // Highlight the selected text
  highlightText(selection.getRangeAt(0), clip.id);
  
  // Update the modal content
  updateModalContent();
  
  // Show the modal
  noteModal.style.display = 'flex';
}

// Get information about a range that can be stored
function getRangeInfo(range) {
  const container = findMessageContainer(range.commonAncestorContainer);
  if (!container) return null;
  
  // Create a fingerprint of the message content
  const messageContent = container.textContent;
  const messageFingerprint = hashString(messageContent);
  
  return {
    text: range.toString(),
    containerFingerprint: messageFingerprint,
    startOffset: range.startOffset,
    endOffset: range.endOffset
  };
}

// Simple hash function for creating message fingerprints
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

// Highlight selected text in the DOM
function highlightText(range, clipId) {
  try {
    // Check if the selection crosses multiple node boundaries
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;
    
    console.log('Highlighting range:', range.toString());
    console.log('Start container:', startContainer.nodeType, startContainer.nodeName);
    console.log('End container:', endContainer.nodeType, endContainer.nodeName);
    
    // Simple case: selection is within a single text node
    if (startContainer === endContainer && startContainer.nodeType === Node.TEXT_NODE) {
      // Use surroundContents for simple text node selections
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'claude-notes-highlight';
      highlightSpan.dataset.clipId = clipId;
      highlightSpan.style.textDecoration = 'underline';
      highlightSpan.style.textDecorationColor = '#5E72E4';
      highlightSpan.style.textDecorationThickness = '1px';
      highlightSpan.style.position = 'relative';
      
      const superscript = document.createElement('sup');
      superscript.textContent = clipId + 1; // Display 1-based indexing
      superscript.style.color = '#5E72E4';
      superscript.style.verticalAlign = 'baseline';
      
      range.surroundContents(highlightSpan);
      highlightSpan.prepend(superscript);
      return;
    }
    
    // Complex case: selection spans multiple nodes or elements
    // Use a DocumentFragment to handle complex selections
    const fragment = range.extractContents();
    
    // Create highlight span
    const highlightSpan = document.createElement('span');
    highlightSpan.className = 'claude-notes-highlight';
    highlightSpan.dataset.clipId = clipId;
    highlightSpan.style.textDecoration = 'underline';
    highlightSpan.style.textDecorationColor = '#5E72E4';
    highlightSpan.style.textDecorationThickness = '1px';
    highlightSpan.style.position = 'relative';
    
    // Create superscript number
    const superscript = document.createElement('sup');
    superscript.textContent = clipId + 1; // Display 1-based indexing
    superscript.style.color = '#5E72E4';
    superscript.style.fontWeight = 'bold';
    superscript.style.verticalAlign = 'baseline';
    
    // Add the superscript to the beginning of the span
    highlightSpan.appendChild(superscript);
    
    // Add the extracted contents to the highlight span
    highlightSpan.appendChild(fragment);
    
    // Insert the highlight span at the start of the range
    range.insertNode(highlightSpan);
    
  } catch (e) {
    console.error('Claude Notes: Error highlighting text', e);
    // Fallback method - try to at least apply a basic highlight to part of the selection
    try {
      // Create a new range for just a portion of the selection if possible
      const newRange = document.createRange();
      newRange.setStart(range.startContainer, range.startOffset);
      newRange.setEnd(range.startContainer, 
                     Math.min(range.startContainer.length || 0, 
                             range.startOffset + 5));
      
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'claude-notes-highlight';
      highlightSpan.dataset.clipId = clipId;
      highlightSpan.style.textDecoration = 'underline';
      highlightSpan.style.textDecorationColor = '#5E72E4';
      highlightSpan.style.textDecorationThickness = '1px';
      
      // Create the superscript number
      const superscript = document.createElement('sup');
      superscript.textContent = clipId + 1; // Display 1-based indexing
      superscript.style.color = '#5E72E4';
      superscript.style.fontWeight = 'bold';
      superscript.style.verticalAlign = 'baseline';
      
      // If this fails, we'll just skip the highlighting
      newRange.surroundContents(highlightSpan);
      highlightSpan.prepend(superscript);
    } catch (fallbackError) {
      console.error('Claude Notes: Fallback highlighting also failed', fallbackError);
    }
  }
}

// Apply highlights for all saved clips
function applyHighlights() {
  console.log('Applying highlights for conversation:', currentConversationId);
  console.log('Number of clips to highlight:', clips.length);
  
  if (!clips || clips.length === 0) {
    console.log('No clips to highlight');
    return;
  }
  
  // Clear any existing highlights first to avoid duplicates
  document.querySelectorAll('.claude-notes-highlight').forEach(highlight => {
    try {
      const parent = highlight.parentNode;
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
    } catch (e) {
      console.error('Error clearing existing highlight', e);
    }
  });
  
  // Find all possible message containers
  const potentialContainers = [];
  
  // Add all elements that could be Claude message containers
  // This covers a wide range of possible DOM structures
  const containerSelectors = [
    '.message', '.claude-message', '.assistant-message', '.prose',
    '[role="region"]', '[role="article"]', '.whitespace-pre-wrap',
    'p', 'div.text-message', 'div[data-message]'
  ];
  
  containerSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => potentialContainers.push(el));
    } catch (e) {
      console.error('Error finding containers with selector:', selector, e);
    }
  });
  
  console.log('Found potential containers:', potentialContainers.length);
  
  // Try to highlight each clip
  clips.forEach(clip => {
    if (!clip.range) {
      console.log('Clip has no range info:', clip);
      return;
    }
    
    let found = false;
    
    // First try exact fingerprint match
    for (const container of potentialContainers) {
      try {
        const containerFingerprint = hashString(container.textContent);
        
        if (containerFingerprint === clip.range.containerFingerprint) {
          console.log('Found exact container match for clip:', clip.id);
          highlightTextInContainer(container, clip);
          found = true;
          break;
        }
      } catch (e) {
        console.error('Error checking container:', e);
      }
    }
    
    // If no exact match, try fuzzy text search
    if (!found) {
      console.log('No exact match found, trying fuzzy search for clip:', clip.id);
      
      // Try to find containers that contain the clip text
      for (const container of potentialContainers) {
        try {
          if (container.textContent.includes(clip.text)) {
            console.log('Found container with clip text');
            // Create a range for this text
            const range = findTextInContainer(container, clip.text);
            if (range) {
              highlightText(range, clip.id);
              found = true;
              break;
            }
          }
        } catch (e) {
          console.error('Error in fuzzy search:', e);
        }
      }
    }
    
    if (!found) {
      console.log('Could not find a match for clip:', clip.id);
    }
  });
}

// Highlight text in a container using text node offsets
function highlightTextInContainer(container, clip) {
  try {
    // Get all text nodes in the container
    const textNodes = getTextNodes(container);
    let currentOffset = 0;
    
    for (const node of textNodes) {
      const nodeLength = node.textContent.length;
      
      // Check if this node contains our text
      if (currentOffset + nodeLength >= clip.range.startOffset) {
        const startInNode = Math.max(0, clip.range.startOffset - currentOffset);
        const endInNode = Math.min(nodeLength, clip.range.endOffset - currentOffset);
        
        if (startInNode < endInNode) {
          // Create a range for this text
          const range = document.createRange();
          range.setStart(node, startInNode);
          range.setEnd(node, endInNode);
          
          // Highlight it
          highlightText(range, clip.id);
          return true;
        }
      }
      
      currentOffset += nodeLength;
    }
    
    return false;
  } catch (e) {
    console.error('Error highlighting in container:', e);
    return false;
  }
}

// Find text in a container and create a range for it
function findTextInContainer(container, searchText) {
  try {
    const textNodes = getTextNodes(container);
    const searchTextLower = searchText.toLowerCase();
    
    // First try exact match
    for (const node of textNodes) {
      if (node.textContent.includes(searchText)) {
        const startPos = node.textContent.indexOf(searchText);
        const range = document.createRange();
        range.setStart(node, startPos);
        range.setEnd(node, startPos + searchText.length);
        return range;
      }
    }
    
    // Try case-insensitive match
    for (const node of textNodes) {
      const lowerContent = node.textContent.toLowerCase();
      if (lowerContent.includes(searchTextLower)) {
        const startPos = lowerContent.indexOf(searchTextLower);
        const range = document.createRange();
        range.setStart(node, startPos);
        range.setEnd(node, startPos + searchText.length);
        return range;
      }
    }
    
    // Try checking across multiple text nodes
    if (textNodes.length > 1) {
      // Build a concatenated string of text content with node indices
      let fullText = '';
      const nodeIndices = [];
      
      for (let i = 0; i < textNodes.length; i++) {
        const nodeText = textNodes[i].textContent;
        nodeIndices.push({
          node: i,
          start: fullText.length,
          end: fullText.length + nodeText.length
        });
        fullText += nodeText;
      }
      
      // Find the search text in the full text
      const pos = fullText.indexOf(searchText);
      if (pos >= 0) {
        // Find which nodes this spans
        const startNodeInfo = nodeIndices.find(info => 
          pos >= info.start && pos < info.end);
        
        const endPos = pos + searchText.length;
        const endNodeInfo = nodeIndices.find(info => 
          endPos > info.start && endPos <= info.end);
        
        if (startNodeInfo && endNodeInfo) {
          const range = document.createRange();
          
          // Set start position
          const startNode = textNodes[startNodeInfo.node];
          const startOffset = pos - startNodeInfo.start;
          range.setStart(startNode, startOffset);
          
          // Set end position
          const endNode = textNodes[endNodeInfo.node];
          const endOffset = endPos - endNodeInfo.start;
          range.setEnd(endNode, endOffset);
          
          return range;
        }
      }
    }
    
    return null;
  } catch (e) {
    console.error('Error finding text in container:', e);
    return null;
  }
}

// Get all text nodes within an element
function getTextNodes(element) {
  const textNodes = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }
  
  return textNodes;
}

// Update the content of the modal with clips from current conversation
function updateModalContent() {
  const modalContent = document.getElementById('claude-notes-content');
  modalContent.innerHTML = '';
  
  // Set the modal title to be static
  const modalTitle = document.getElementById('claude-notes-title');
  if (modalTitle) {
    modalTitle.textContent = 'Claude Notes';
  }
  
  if (clips.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'No clips saved in this conversation yet. Select text and click "Clip" to save.';
    emptyMessage.style.color = '#666';
    modalContent.appendChild(emptyMessage);
    return;
  }
  
  // Create clips list
  clips.forEach(clip => {
    const clipElement = document.createElement('div');
    clipElement.className = 'claude-notes-clip';
    clipElement.style.padding = '10px';
    clipElement.style.marginBottom = '10px';
    clipElement.style.border = '1px solid #eee';
    clipElement.style.borderRadius = '4px';
    clipElement.style.position = 'relative';
    
    const clipNumber = document.createElement('div');
    clipNumber.textContent = clip.id + 1;
    clipNumber.style.position = 'absolute';
    clipNumber.style.top = '5px';
    clipNumber.style.right = '5px';
    clipNumber.style.backgroundColor = '#5E72E4';
    clipNumber.style.color = 'white';
    clipNumber.style.width = '20px';
    clipNumber.style.height = '20px';
    clipNumber.style.borderRadius = '50%';
    clipNumber.style.display = 'flex';
    clipNumber.style.justifyContent = 'center';
    clipNumber.style.alignItems = 'center';
    clipNumber.style.fontSize = '12px';
    
    const clipText = document.createElement('p');
    clipText.textContent = clip.text;
    clipText.style.margin = '0 0 5px 0';
    clipText.style.fontSize = '0.875rem';
    clipText.style.width = '95%';
    
    // Create footer div to contain date and delete button
    const clipFooter = document.createElement('div');
    clipFooter.style.display = 'flex';
    clipFooter.style.justifyContent = 'space-between';
    clipFooter.style.alignItems = 'center';
    clipFooter.style.marginTop = '8px';
    
    const clipDate = document.createElement('small');
    clipDate.textContent = new Date(clip.timestamp).toLocaleString();
    clipDate.style.color = '#999';
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.padding = '4px 8px';
    deleteButton.style.backgroundColor = '#f44336';
    deleteButton.style.color = 'white';
    deleteButton.style.border = 'none';
    deleteButton.style.borderRadius = '4px';
    deleteButton.style.cursor = 'pointer';
    deleteButton.style.fontSize = '12px';
    
    deleteButton.addEventListener('click', () => {
      deleteClip(clip.id);
    });
    
    // Add date and delete button to footer
    clipFooter.appendChild(clipDate);
    clipFooter.appendChild(deleteButton);
    
    // Assemble clip element
    clipElement.appendChild(clipNumber);
    clipElement.appendChild(clipText);
    clipElement.appendChild(clipFooter);
    
    modalContent.appendChild(clipElement);
  });
}

// Delete a specific clip
function deleteClip(clipId) {
  // Remove highlight from DOM
  const highlight = document.querySelector(`.claude-notes-highlight[data-clip-id="${clipId}"]`);
  if (highlight) {
    // Replace the highlight with its text content
    const parent = highlight.parentNode;
    while (highlight.firstChild) {
      parent.insertBefore(highlight.firstChild, highlight);
    }
    parent.removeChild(highlight);
  }
  
  // Remove from clips array
  clips = clips.filter(clip => clip.id !== clipId);
  
  // Update the master object
  allClips[currentConversationId].clips = clips;
  allClips[currentConversationId].lastUpdated = new Date().toISOString();
  
  // Update storage
  chrome.storage.local.set({ 'claudeNotesV2': allClips }, () => {
    console.log('Claude Notes: Clip deleted from conversation', currentConversationId);
  });
  
  // Update modal
  updateModalContent();
}

// Clear all clips from current conversation
function clearAllClips() {
  if (confirm('Are you sure you want to clear all notes from this conversation?')) {
    // Remove all highlights from DOM
    document.querySelectorAll('.claude-notes-highlight').forEach(highlight => {
      const parent = highlight.parentNode;
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
    });
    
    // Clear clips array for this conversation
    clips = [];
    allClips[currentConversationId].clips = [];
    allClips[currentConversationId].lastUpdated = new Date().toISOString();
    
    // Update storage
    chrome.storage.local.set({ 'claudeNotesV2': allClips }, () => {
      console.log('Claude Notes: All clips cleared from conversation', currentConversationId);
    });
    
    // Update modal
    updateModalContent();
  }
}

// Load clips from storage
function loadClips() {
  chrome.storage.local.get(['claudeNotes', 'claudeNotesV2'], (result) => {
    if (result.claudeNotesV2) {
      // New format with conversation IDs
      allClips = result.claudeNotesV2;
      let needsUpdate = false;
      
      // Check for and fix any conversation titles with wrong format
      Object.keys(allClips).forEach(convId => {
        const conversation = allClips[convId];
        if (conversation.title && conversation.title.endsWith(' | Claude')) {
          conversation.title = conversation.title.replace(' | Claude', '').trim();
          // Flag that we need to save changes
          needsUpdate = true;
        }
      });
      
      // Save updates if we fixed any titles
      if (needsUpdate) {
        chrome.storage.local.set({ 'claudeNotesV2': allClips }, () => {
          console.log('Fixed old conversation titles from " | Claude" to " - Claude" format');
        });
      }
      
      // If we have clips for the current conversation, use them
      if (allClips[currentConversationId]) {
        clips = allClips[currentConversationId].clips;
        // Set the next clip ID based on the highest existing ID
        currentClipId = clips.length > 0 ? Math.max(...clips.map(clip => clip.id)) + 1 : 0;
        
        // Update the conversation title if it's out of date
        if (allClips[currentConversationId].title !== conversationTitle) {
          allClips[currentConversationId].title = conversationTitle;
          allClips[currentConversationId].lastUpdated = new Date().toISOString();
          
          // Save the updated title
          chrome.storage.local.set({ 'claudeNotesV2': allClips }, () => {
            console.log('Updated conversation title');
          });
        }
      } else {
        // Initialize this conversation
        clips = [];
        currentClipId = 0;
        allClips[currentConversationId] = {
          id: currentConversationId,
          title: conversationTitle,
          lastUpdated: new Date().toISOString(),
          clips: []
        };
      }
    } else if (result.claudeNotes) {
      // Old format, migrate to new format
      console.log('Migrating old notes format to new format');
      allClips = {};
      
      // Create a default conversation for old notes
      allClips['migrated'] = {
        id: 'migrated',
        title: 'Migrated Notes',
        lastUpdated: new Date().toISOString(),
        clips: result.claudeNotes
      };
      
      // Initialize current conversation
      clips = [];
      currentClipId = 0;
      allClips[currentConversationId] = {
        id: currentConversationId,
        title: conversationTitle,
        lastUpdated: new Date().toISOString(),
        clips: []
      };
      
      // Save the migrated structure
      chrome.storage.local.set({ 'claudeNotesV2': allClips }, () => {
        console.log('Migration complete');
      });
    } else {
      // No existing data
      clips = [];
      allClips = {};
      allClips[currentConversationId] = {
        id: currentConversationId,
        title: conversationTitle,
        lastUpdated: new Date().toISOString(),
        clips: []
      };
    }
    
    updateModalContent();
  });
}

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.action === 'toggleModal') {
    // Initialize if needed
    if (!noteModal) {
      console.log('Modal not initialized yet, creating it now');
      init();
    }
    
    // Toggle modal visibility
    if (noteModal) {
      if (noteModal.style.display === 'none') {
        console.log('Showing modal');
        noteModal.style.display = 'flex';
      } else {
        console.log('Hiding modal');
        noteModal.style.display = 'none';
      }
      sendResponse({ success: true });
    } else {
      console.error('Could not toggle modal, not initialized');
      sendResponse({ success: false, error: 'Modal not initialized' });
    }
    return true; // Keep the message channel open for async response
  }
}); 