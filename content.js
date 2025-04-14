console.log('Claude Notes: content.js script loaded.');

// Style utility functions
const styles = {
  colors: {
    primary: '#c96442',
    border: '#ddd',
    background: {
      light: '#f5f5f5',
      white: '#fff'
    },
    text: {
      normal: '#666',
      dark: '#000'
    }
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px'
  }
};

// Inject highlight styles
const injectHighlightStyles = () => {
  const styleSheet = document.createElement("style");
  styleSheet.id = 'claude-notes-styles';
  styleSheet.textContent = `
    .claude-notes-highlight {
      text-decoration: underline !important;
      text-decoration-color: ${styles.colors.primary} !important;
      text-decoration-thickness: 1px !important;
      position: relative !important;
      display: inline !important;
    }
    
    .claude-notes-highlight.secondary {
      text-decoration-color: ${styles.colors.text.normal} !important;
    }
    
    .claude-notes-highlight > sup,
    .claude-notes-text-wrapper + sup {
      color: ${styles.colors.primary};
      font-weight: bold;
      vertical-align: baseline;
      margin-right: 4px;
      font-size: 0.7em;
      user-select: none;
    }
    
    .claude-notes-highlight.secondary > sup,
    .claude-notes-text-wrapper.secondary + sup {
      color: ${styles.colors.text.normal};
    }
    
    /* Element-specific styles */
    .claude-notes-highlight[data-element-type="p"] {
      white-space: pre-wrap !important;
    }
    
    .claude-notes-highlight[data-element-type="li"] {
      white-space: normal !important;
      display: inline !important;
      list-style: inherit !important;
    }
    
    .claude-notes-highlight[data-element-type^="h"] {
      font-weight: inherit !important;
      font-size: inherit !important;
      margin: inherit !important;
      display: inline !important;
    }
    
    /* Preserve list structure */
    li > .claude-notes-highlight[data-element-type="li"] {
      display: inline !important;
      white-space: normal !important;
      word-break: break-word !important;
    }
    
    /* Preserve heading structure */
    h1 > .claude-notes-highlight[data-element-type="h1"],
    h2 > .claude-notes-highlight[data-element-type="h2"],
    h3 > .claude-notes-highlight[data-element-type="h3"],
    h4 > .claude-notes-highlight[data-element-type="h4"],
    h5 > .claude-notes-highlight[data-element-type="h5"],
    h6 > .claude-notes-highlight[data-element-type="h6"] {
      display: inline !important;
      font-weight: inherit !important;
      font-size: inherit !important;
    }
  `;
  
  // Remove existing stylesheet if present
  const existingStyle = document.getElementById('claude-notes-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  document.head.appendChild(styleSheet);
};

const createStyleObject = (...objects) => Object.assign({}, ...objects);

const baseStyles = {
  modal: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    width: '350px',
    maxHeight: 'calc(100vh - 40px)',
    backgroundColor: styles.colors.background.white,
    border: `1px solid ${styles.colors.border}`,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: '10000',
    display: 'none', // Initially hidden
    flexDirection: 'column',
    overflow: 'hidden',
    // Update font family here
    fontFamily: '\'Lato\', Arial, sans-serif', 
    fontSize: '14px',
    color: styles.colors.text.dark
  },
  header: {
    padding: styles.spacing.md,
    backgroundColor: styles.colors.background.light,
    borderBottom: `1px solid ${styles.colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  button: {
    background: 'none',
    border: 'none',
    cursor: 'pointer'
  },
  container: {
    display: 'flex',
    borderBottom: `1px solid ${styles.colors.border}`,
    backgroundColor: styles.colors.background.light
  },
  tab: {
    padding: `${styles.spacing.sm} ${styles.spacing.lg}`,
    border: 'none',
    borderBottom: '2px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    flex: '1',
    fontSize: '14px'
  },
  tabActive: {
    fontWeight: 'bold',
    borderBottom: `2px solid ${styles.colors.primary}`
  },
  content: {
    padding: styles.spacing.md,
    overflowY: 'auto',
    flex: '1'
  },
  actions: {
    padding: styles.spacing.md,
    borderTop: `1px solid ${styles.colors.border}`,
    display: 'flex',
    justifyContent: 'space-between'
  },
  actionButton: {
    padding: `${styles.spacing.sm} ${styles.spacing.md}`,
    borderRadius: '4px',
    cursor: 'pointer',
    color: styles.colors.background.white,
    textDecoration: 'none',
    display: 'inline-block'
  },
  clip: {
    padding: styles.spacing.sm,
    marginBottom: styles.spacing.sm,
    border: `1px solid ${styles.colors.border}`,
    borderRadius: '4px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: styles.spacing.sm
  },
  clipNumber: {
    fontSize: '14px',
    fontWeight: 'bold'
  },
  clipContent: {
    flex: '1',
    minWidth: '0'
  },
  clipText: {
    margin: '0',
    fontSize: '0.875rem',
    width: '100%',
    overflowX: 'hidden',
    textOverflow: 'ellipsis'
  },
  clipTextSecondary: {
    fontStyle: 'italic'
  },
  codeClip: {
    display: 'block',
    backgroundColor: '#1e1e1e', // Dark background for code
    color: '#d4d4d4', // Light text for code
    padding: styles.spacing.sm,
    borderRadius: '4px',
    // Keep specific monospace font for code blocks
    fontFamily: '"Fira Code", "Menlo", "Monaco", "Courier New", monospace', 
    whiteSpace: 'pre', // Changed from pre-wrap to pre
    overflowX: 'auto', // Keep this for horizontal scroll
    fontSize: '0.85em', // Slightly smaller font for code
    lineHeight: '1.4',
    maxHeight: '150px',
    overflowY: 'auto'
  },
  deleteButton: {
    position: 'absolute',
    top: styles.spacing.sm,
    right: styles.spacing.sm,
    background: 'none',
    border: 'none',
    color: styles.colors.text.normal,
    fontSize: '1.25rem',
    cursor: 'pointer',
  }
};

const applyStyles = (element, styleObject) => {
  Object.assign(element.style, styleObject);
};

// Global variables
let noteModal;
let clips = [];
let allClips = {}; // Organized by conversation ID
let currentClipId = 0;
let currentConversationId = '';
let conversationTitle = '';
let needsUpdate = false;
let lastUrl = ''; // Track URL for SPA navigation detection
let activeTab = 'clips'; // Track active tab
let isApplyingHighlights = false;
let currentAnnotationFilter = null; // Ensure this is declared globally

// Style utility functions
const buttonStyles = {
  base: {
    padding: '5px 10px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
  },
  container: {
    position: 'absolute',
    zIndex: '10001',
    display: 'flex',
    gap: '5px'
  }
};

const applyButtonStyles = (button, type = 'primary') => {
  Object.assign(button.style, buttonStyles.base);
  button.style.backgroundColor = type === 'primary' ? '#c96442' : '#444';
};

// --- UPDATED FUNCTION (v3) ---
// Inject a button into the Claude action bar, next to the Share button
function injectHeaderButton() {
  const buttonId = 'claude-notes-action-button';
  // More robust check: Wait for the specific Share button text
  const checkInterval = setInterval(() => {
    // Find the button containing the text "Share"
    const shareButton = Array.from(document.querySelectorAll('header button')).find(btn => btn.textContent.trim() === 'Share');

    // Find the div directly wrapping the Share button (often data-state=closed)
    const shareButtonWrapper = shareButton?.parentNode;

    // Find the container holding the group of buttons (Share, Notes, etc.)
    const buttonGroupContainer = shareButtonWrapper?.parentNode;

    // Ensure all elements are found and our button isn't already there
    if (shareButton && shareButtonWrapper && buttonGroupContainer && !document.getElementById(buttonId)) {
      console.log('Claude Notes: Found Share button anchor, injecting Notes button...');
      clearInterval(checkInterval); // Stop checking

      // 1. Clone the actual Share BUTTON
      const notesButton = shareButton.cloneNode(true); // Deep clone the button

      // 2. Set unique ID
      notesButton.id = buttonId;

      // 3. Define the new SVG markup
      const newSvgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 18 18"><path fill="currentColor" fill-rule="evenodd" d="M3.422 2.85a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v12.3a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-.68H3a.422.422 0 0 1 0-.845h.422v-1.68H3a.422.422 0 0 1 0-.843h.422v-1.68H3a.422.422 0 0 1 0-.843h.422v-1.68H3a.422.422 0 0 1 0-.844h.422v-1.68H3a.422.422 0 0 1 0-.843h.422v-.683Zm.844 1.525h.425a.422.422 0 0 0 0-.843h-.425v-.59a.25.25 0 0 1 .25-.25h9.812a.25.25 0 0 1 .25.25V15.06a.25.25 0 0 1-.25.25H4.516a.25.25 0 0 1-.25-.25v-.59h.425a.422.422 0 0 0 0-.843h-.425v-1.68h.425a.42.42 0 0 0 .262-.091.425.425 0 0 0 .16-.331.422.422 0 0 0-.422-.422h-.425v-1.68h.425a.422.422 0 0 0 0-.843h-.425v-1.68h.425a.422.422 0 0 0 0-.844h-.425v-1.68Zm1.695.84c0 .233.19.422.422.422h6.084a.422.422 0 0 0 0-.844H6.383a.415.415 0 0 0-.309.136.39.39 0 0 0-.107.223l-.006.063Zm0 2.524c0 .233.19.422.422.422h6.084a.422.422 0 0 0 0-.844H6.383a.422.422 0 0 0-.422.422Zm.422 2.945a.422.422 0 0 1 0-.844h6.084a.422.422 0 0 1 0 .844H6.383Zm-.422 2.102c0 .233.19.421.422.421h6.084a.422.422 0 0 0 0-.843H6.383a.423.423 0 0 0-.422.422Z" clip-rule="evenodd"/></svg>`; // NOTE: Changed fill="#000" to fill="currentColor" to inherit color

      // 4. Replace content (SVG + Text)
      notesButton.innerHTML = newSvgMarkup + ' Notes';

      // 5. Add click listener
      notesButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Claude Notes: Action bar button clicked.');
        const currentConvId = extractConversationId();
        if (currentConvId === 'default') {
          alert('Claude Notes: Please open or start a conversation to use notes.');
          return;
        }
        chrome.runtime.sendMessage({ action: 'toggleModal' });
      });

      // 6. Insert the new Notes button into the group container,
      //    BEFORE the Share button's wrapper div.
      buttonGroupContainer.insertBefore(notesButton, shareButtonWrapper);
      console.log('Claude Notes: Action bar button injected before Share button wrapper.');

    } else if (document.getElementById(buttonId)) {
      // Button already exists
      clearInterval(checkInterval);
    }
  }, 500);

  // Timeout
  setTimeout(() => {
    clearInterval(checkInterval);
    if (!document.getElementById(buttonId)) {
      console.log('Claude Notes: Could not find Share button anchor after 15 seconds.');
    }
  }, 15000);
}
// --- END UPDATED FUNCTION (v3) ---

// Initialize extension
function init() {
  // Only run on Claude.ai
  if (!window.location.href.includes('claude.ai')) return;
  
  console.log('Claude Notes: Initializing extension...');
  
  // Inject our styles
  injectHighlightStyles();
  
  // Attempt to inject the header/action bar button
  injectHeaderButton(); // This now targets the action bar button
  
  // Store current URL
  lastUrl = window.location.href;
  
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
  }
  
  // Only proceed with showing UI if there's a valid conversation ID
  if (currentConversationId !== 'default') {
    // Load saved clips
    loadClips();
    
    // Add event listeners
    document.addEventListener('mouseup', handleTextSelection);
    
    // Show modal on initial load if we have a valid conversation
    if (noteModal) {
      noteModal.style.display = 'flex';
    }
    
    // Set up a content-ready check to ensure Claude has loaded its content
    waitForClaudeContent();
  } else {
    console.log('No conversation ID found in URL, hiding extension UI');
    // Hide modal if it exists
    if (noteModal) {
      noteModal.style.display = 'none';
    }
    
    // Remove selection listener to prevent showing the clip button
    document.removeEventListener('mouseup', handleTextSelection);
  }
  
  // Add resize listener to keep modal within bounds
  window.addEventListener('resize', ensureModalWithinBounds);
  
  // Setup URL change monitoring for SPA navigation
  setupUrlChangeMonitoring();
}

// Wait for Claude's content to be ready before applying highlights
function waitForClaudeContent(attempt = 0, maxAttempts = 10) {
  // Check if Claude has rendered its messages
  const messageContainers = document.querySelectorAll('.message, .prose, [role="region"], .whitespace-pre-wrap');
  
  if (messageContainers.length > 0) {
    console.log('Claude content detected, applying highlights...');
    // Apply highlights now that content is available
    setTimeout(() => {
      applyHighlights();
    }, 200);
  } else if (attempt < maxAttempts) {
    // Retry with exponential backoff
    const delay = 300 * Math.pow(1.5, attempt);
    console.log(`No Claude content detected yet, retry in ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);
    setTimeout(() => {
      waitForClaudeContent(attempt + 1, maxAttempts);
    }, delay);
  } else {
    console.log('Maximum retry attempts reached, could not detect Claude content');
  }
}

// Setup monitoring for URL changes in SPA
function setupUrlChangeMonitoring() {
  // Check frequently for URL changes (SPA navigation)
  setInterval(checkUrlChange, 1000);
  
  // Also use a MutationObserver as a backup detection method
  const observer = new MutationObserver((mutations) => {
    // If URL has changed, the title often changes too
    if (window.location.href !== lastUrl) {
      checkUrlChange();
    }
  });
  
  // Observe title changes which often correlate with navigation
  observer.observe(document.querySelector('title'), { 
    subtree: true, 
    characterData: true, 
    childList: true 
  });
}

// Check if URL has changed and handle conversation changes
function checkUrlChange() {
  const currentUrl = window.location.href;
  const previousUrl = lastUrl; // Store previous URL for comparison

  // If URL hasn't changed, do nothing
  if (currentUrl === previousUrl) return;

  console.log('URL changed:', previousUrl, '->', currentUrl);
  lastUrl = currentUrl; // Update lastUrl immediately

  // Get new conversation ID
  const newConversationId = extractConversationId();

  // Handle case where URL changes but ID extraction might be delayed
  if (newConversationId === 'default' && currentUrl.includes('claude.ai/chat/')) {
    console.log('URL indicates a conversation but couldn\'t extract ID, will retry');
    setTimeout(checkUrlChange, 500); // Retry after delay
    return;
  }

  // Handle navigation AWAY from a conversation
  if (newConversationId === 'default') {
    console.log('Navigated to a page without a conversation ID, hiding extension UI');
    currentConversationId = newConversationId;

    // Hide modal if it exists
    if (noteModal && noteModal.style.display !== 'none') {
      noteModal.style.display = 'none';
    }

    // Remove selection listener
    document.removeEventListener('mouseup', handleTextSelection);

    // Clear highlights
    clearAllHighlights();

    // Remove the button if it exists
    const notesButton = document.getElementById('claude-notes-action-button');
    if (notesButton) {
        notesButton.remove();
        console.log('Removed Notes button as we navigated away from a chat.');
    }

    return;
  }

  // --- Key Change: Ensure button injection happens on valid navigation ---
  // Whether the conversation ID changed or just the URL (indicating potential DOM update),
  // ensure the button is present.
  console.log('Valid conversation context detected, ensuring header button exists...');
  injectHeaderButton(); // Call injection function - it has internal checks

  // Handle conversation *data* change only if ID is different
  if (newConversationId !== currentConversationId) {
    console.log('Conversation changed:', currentConversationId, '->', newConversationId);
    currentConversationId = newConversationId;

    // Update conversation title (with retry for SPA transitions)
    const updateTitle = () => {
      conversationTitle = document.title.replace(' - Claude', '').trim();

      if (conversationTitle === 'Claude' || conversationTitle === '') {
        console.log('Title not yet updated, will retry');
        setTimeout(updateTitle, 300);
        return;
      }

      console.log('New conversation title:', conversationTitle);

      // Add selection listener if it was removed
      document.removeEventListener('mouseup', handleTextSelection);
      document.addEventListener('mouseup', handleTextSelection);

      // Reload clips for the new conversation
      loadClips(); // This will eventually call applyHighlights via waitForClaudeContent

      // Update modal content if it's visible
      if (noteModal && noteModal.style.display !== 'none') {
        updateModalContent();
      }

      // Clear old highlights before loading new ones
      clearAllHighlights();
    };

    updateTitle(); // Start the title update process
  } else {
      console.log('URL changed, but conversation ID remains the same. Button re-checked.');
      // Optional: Maybe trigger a light refresh or highlight check even if ID is the same?
      // For now, ensuring the button exists is the main goal.
      // We might need to re-apply highlights if the content area also re-rendered.
      waitForClaudeContent(); // Re-check content and apply highlights if needed
  }
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
  applyStyles(noteModal, createStyleObject(baseStyles.modal, {
    top: '100px',
    right: '24px', // Changed from 50px
    width: '300px',
    minHeight: '100px',
    maxHeight: '500px',
    display: 'none' // Start hidden
  }));
  
  // Create modal header
  const modalHeader = document.createElement('div');
  modalHeader.id = 'claude-notes-header';
  applyStyles(modalHeader, baseStyles.header);
  
  const modalTitle = document.createElement('span');
  modalTitle.textContent = 'Claude Notes';
  applyStyles(modalTitle, {
    fontWeight: 'bold'
  });
  
  const closeButton = document.createElement('button');
  applyStyles(closeButton, createStyleObject(baseStyles.button, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px'
  }));
  closeButton.appendChild(ClaudeIcons.createIcon('x', 20, styles.colors.text.normal));
  closeButton.addEventListener('click', () => {
    noteModal.style.display = 'none';
  });
  
  modalHeader.appendChild(modalTitle);
  modalHeader.appendChild(closeButton);

  // Create tab container
  const tabContainer = document.createElement('div');
  applyStyles(tabContainer, baseStyles.container);

  // Create tabs
  const clipsTab = createTabButton('Clips', 'clips');
  const annotationsTab = createTabButton('Annotations', 'annotations');
  
  tabContainer.appendChild(clipsTab);
  tabContainer.appendChild(annotationsTab);
  
  // Create modal content
  const modalContent = document.createElement('div');
  modalContent.id = 'claude-notes-content';
  applyStyles(modalContent, baseStyles.content);
  
  // NEW: Create Filter Container (initially hidden)
  const filterContainer = document.createElement('div');
  filterContainer.id = 'claude-notes-filter-container';
  applyStyles(filterContainer, {
    display: 'none', // Start hidden
    // Uniform padding
    padding: `${styles.spacing.sm} ${styles.spacing.md}`,
    borderBottom: `1px solid ${styles.colors.border}`,
    backgroundColor: styles.colors.background.white,
    alignItems: 'center', // Vertically align items
    gap: styles.spacing.sm
  });

  const selectFontSize = '0.9rem'; // Define common font size
  const selectPadding = styles.spacing.sm; // Define common padding

  const labelSelect = document.createElement('select');
  labelSelect.id = 'claude-notes-label-filter-select';
  applyStyles(labelSelect, {
    flex: '1', 
    padding: selectPadding, 
    fontSize: selectFontSize, // Apply common font size
    border: `1px solid ${styles.colors.border}`,
    borderRadius: '4px',
    boxSizing: 'border-box' // Consistent height calculation
  });
  labelSelect.addEventListener('change', () => {
    currentAnnotationFilter = labelSelect.value || null; // Explicitly null if empty value
    updateModalContent();
  });

  const clearFilterButton = document.createElement('button');
  clearFilterButton.id = 'claude-notes-clear-filter-button';
  clearFilterButton.textContent = 'Clear';
  applyStyles(clearFilterButton, createStyleObject(baseStyles.actionButton, {
    backgroundColor: styles.colors.text.normal,
    padding: selectPadding, // Use same padding as select
    fontSize: selectFontSize, // Apply common font size
    lineHeight: '1.2', // Adjust line-height for vertical centering if needed
    boxSizing: 'border-box' // Consistent height calculation
  }));
  clearFilterButton.disabled = true;
  clearFilterButton.addEventListener('click', () => {
    currentAnnotationFilter = null;
    labelSelect.value = "";
    updateModalContent();
  });

  filterContainer.appendChild(labelSelect);
  filterContainer.appendChild(clearFilterButton);

  // Create modal actions
  const modalActions = document.createElement('div');
  applyStyles(modalActions, baseStyles.actions);
  
  // Change "View All Notes" from link to button
  const viewAllButton = document.createElement('button');
  viewAllButton.id = 'claude-notes-view-all-button'; // <<< Add ID
  viewAllButton.textContent = 'View All Notes';
  // Apply base action button styles, override background, and center text
  applyStyles(viewAllButton, createStyleObject(
    baseStyles.actionButton, 
    {
      backgroundColor: styles.colors.primary, // Keep primary color
      textAlign: 'center' // Center the text within the button
      // textDecoration: 'none' // Not needed for button
    }
  ));
  viewAllButton.addEventListener('click', (e) => {
    // e.preventDefault(); // Not needed for button
    chrome.runtime.sendMessage({ action: 'openLibrary' });
  });
  
  const clearButton = document.createElement('button');
  clearButton.id = 'claude-notes-clear-all-button'; // <<< Add ID
  clearButton.textContent = 'Clear All';
  applyStyles(clearButton, createStyleObject(baseStyles.actionButton, {
    backgroundColor: '#f44336' // Keep danger color
  }));
  clearButton.addEventListener('click', clearAllClips);
  
  // Append buttons
  modalActions.appendChild(viewAllButton);
  modalActions.appendChild(clearButton);
  
  // Assemble modal
  noteModal.appendChild(modalHeader);
  noteModal.appendChild(tabContainer);
  noteModal.appendChild(filterContainer); // Add filter container here
  noteModal.appendChild(modalContent);
  noteModal.appendChild(modalActions);
  
  // Add modal to document
  document.body.appendChild(noteModal);
}

// Create a tab button
function createTabButton(text, tabId) {
  const tab = document.createElement('button');
  tab.textContent = text;
  
  const isActive = activeTab === tabId;
  applyStyles(tab, createStyleObject(
    baseStyles.tab,
    isActive ? baseStyles.tabActive : {}
  ));
  
  tab.addEventListener('click', () => switchTab(tabId));
  return tab;
}

// Switch between tabs
function switchTab(tabId) {
  activeTab = tabId;
  
  // Update tab styles
  const tabs = noteModal.querySelectorAll('button');
  tabs.forEach(tab => {
    if (tab.textContent === (tabId === 'clips' ? 'Clips' : 'Annotations')) {
      tab.style.fontWeight = 'bold';
      tab.style.borderBottom = '2px solid #c96442';
    } else {
      tab.style.fontWeight = 'normal';
      tab.style.borderBottom = '2px solid transparent';
    }
  });
  
  // Update content
  updateModalContent();
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
  const selectedText = selection.toString().trim(); // Get trimmed text first

  // Remove clip buttons if no text is selected or if selection is cleared
  const existingButtonContainer = document.querySelector('div[style*="position: absolute"][id*="claude-notes-clip-button"]'); // Find container
  if (!selectedText) {
    if (existingButtonContainer) {
        document.body.removeChild(existingButtonContainer);
    }
    return;
  }

  // --- NEW CHECK: Prevent clipping inside the modal --- 
  if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      let ancestor = range.commonAncestorContainer;
      // Traverse up to check if selection originated within our modals
      while(ancestor && ancestor !== document.body) {
          if (ancestor.nodeType === Node.ELEMENT_NODE && 
              (ancestor.id === 'claude-notes-modal' || ancestor.id === 'claude-notes-annotation-modal')) 
          {
              console.log('Selection is inside the Claude Notes modal, ignoring.');
               // Also remove buttons if they somehow appeared for an intra-modal selection
              if (existingButtonContainer) {
                  document.body.removeChild(existingButtonContainer);
              }
              return; // Exit early, don't show clip buttons
          }
          ancestor = ancestor.parentNode;
      }
  }
  // --- END NEW CHECK ---

  console.log('Text selected:', selectedText);
  
  // Check if selection is within a code block
  let isCodeBlock = false;
  let node = selection.anchorNode;
  
  // Debug logging for node traversal
  console.log('Starting node type:', node.nodeType);
  console.log('Starting node name:', node.nodeName);
  
  // Log the parent elements to help debug the hierarchy
  let parentChain = [];
  let currentNode = node;
  while (currentNode && currentNode !== document.body) {
    parentChain.push({
      nodeName: currentNode.nodeName,
      classList: currentNode.classList ? Array.from(currentNode.classList) : []
    });
    currentNode = currentNode.parentNode;
  }
  console.log('Parent element chain:', parentChain);
  
  // Reset node for actual code block check
  node = selection.anchorNode;
  while (node && node !== document.body) {
    if (node.nodeName === 'CODE' || 
        (node.classList && 
         node.classList.contains('prismjs') && 
         node.classList.contains('code-block__code'))) {
      isCodeBlock = true;
      console.log('Found code block:', {
        nodeName: node.nodeName,
        classList: node.classList ? Array.from(node.classList) : [],
        parentNodeName: node.parentNode ? node.parentNode.nodeName : null
      });
      break;
    }
    node = node.parentNode;
  }
  
  console.log('Is code block:', isCodeBlock);
  
  // Check if selection is within a Claude message
  const range = selection.getRangeAt(0);
  const container = findMessageContainer(range.commonAncestorContainer);
  
  if (container || isCodeBlock) {
    if (isCodeBlock) {
      console.log('Creating clip button for code block selection');
    } else {
      console.log('Creating clip button for regular text selection');
    }
    
    // Create clip button near selection if it doesn't exist
    if (!document.getElementById('claude-notes-clip-button')) {
      createClipButton(selection, isCodeBlock);
    } else {
      // Update position of existing button
      updateClipButtonPosition(selection);
    }
  } else {
    console.log('No message container or code block found for selection');
  }
}

// Create a clip button near the selected text
function createClipButton(selection, isCodeBlock) {
  // Remove any existing buttons first
  const existingButton = document.getElementById('claude-notes-clip-button');
  const existingSecondButton = document.getElementById('claude-notes-second-clip-button');
  if (existingButton) {
    document.body.removeChild(existingButton);
  }
  if (existingSecondButton) {
    document.body.removeChild(existingSecondButton);
  }
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // Create container for buttons
  const buttonContainer = document.createElement('div');
  Object.assign(buttonContainer.style, buttonStyles.container);
  buttonContainer.style.left = `${rect.right + window.scrollX}px`;
  buttonContainer.style.top = `${rect.top + window.scrollY - 30}px`;
  
  // Primary clip button
  const clipButton = document.createElement('button');
  clipButton.id = 'claude-notes-clip-button';
  clipButton.textContent = isCodeBlock ? 'Clip Code' : 'Clip';
  applyButtonStyles(clipButton, 'primary');
  
  // Secondary clip button
  const secondClipButton = document.createElement('button');
  secondClipButton.id = 'claude-notes-second-clip-button';
  secondClipButton.textContent = 'Annotate';
  applyButtonStyles(secondClipButton, 'secondary');
  
  clipButton.addEventListener('click', () => {
    saveClip(selection, isCodeBlock, false);
    clipButton.textContent = 'Saved!';
    clipButton.style.backgroundColor = '#4CAF50';
    setTimeout(() => { 
        // Find the container to remove
        const buttonContainer = clipButton.closest('div[style*="position: absolute"]'); 
        if (buttonContainer && document.body.contains(buttonContainer)) {
            document.body.removeChild(buttonContainer);
        }
    }, 1000);
  });
  
  secondClipButton.addEventListener('click', () => {
    openAnnotationModal(selection, isCodeBlock);
    // Remove the button container immediately after opening the modal
    const buttonContainer = secondClipButton.closest('div[style*="position: absolute"]'); // Find the container using a more specific selector if needed
    if (buttonContainer && document.body.contains(buttonContainer)) {
        document.body.removeChild(buttonContainer);
    }
  });
  
  buttonContainer.appendChild(clipButton);
  buttonContainer.appendChild(secondClipButton);
  document.body.appendChild(buttonContainer);
  
  // Remove clip buttons when clicking elsewhere or after a timeout
  const removeClipButtons = (e) => {
    if (e && (e.target === clipButton || e.target === secondClipButton)) return;
    
    if (document.body.contains(buttonContainer)) {
      document.body.removeChild(buttonContainer);
    }
    document.removeEventListener('mousedown', removeClipButtons);
  };
  
  document.addEventListener('mousedown', removeClipButtons);
  setTimeout(() => removeClipButtons(), 5000);
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

// Add this new function to recalculate clip IDs
function recalculateClipIds() {
    // Sort clips by their current IDs to maintain relative order
    clips.sort((a, b) => a.id - b.id);
    
    // Reassign IDs sequentially
    clips.forEach((clip, index) => {
        clip.id = index;
        
        // Update the highlight in the DOM
        const highlight = document.querySelector(`.claude-notes-highlight[data-clip-id="${clip.id}"]`);
        if (highlight) {
            highlight.dataset.clipId = index;
            // Update the superscript number
            const sup = highlight.querySelector('sup');
            if (sup) {
                sup.textContent = index + 1;
            }
        }
    });
    
    // Set currentClipId to next available number
    currentClipId = clips.length;
}

// Modify the deleteClip function
function deleteClip(clipId) {
    // Remove highlight from DOM
    const highlight = document.querySelector(`.claude-notes-highlight[data-clip-id="${clipId}"]`);
    if (highlight) {
        const parent = highlight.parentNode;
        
        // First remove all superscript elements
        const sups = highlight.querySelectorAll('sup');
        sups.forEach(sup => sup.remove());
        
        // Move remaining text content back to parent
        while (highlight.firstChild) {
            parent.insertBefore(highlight.firstChild, highlight);
        }
        parent.removeChild(highlight);
    }
    
    // Remove from clips array
    clips = clips.filter(clip => clip.id !== clipId);
    
    // Recalculate IDs
    recalculateClipIds();
    
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

// Modify the saveClip function
function saveClip(selection, isCodeBlock, isSecondary) {
    const selectedText = selection.toString().trim();
    if (!selectedText) return;
    
    console.log('Saving clip, isCodeBlock:', isCodeBlock, 'isSecondary:', isSecondary);
    
    const originalRange = selection.getRangeAt(0);
    const startContainer = originalRange.startContainer;
    const endContainer = originalRange.endContainer;

    // Define block elements we want to potentially split into separate clips
    const splittableBlockElements = ['P', 'LI']; // Add other tags like H1-H6 if needed

    // Find the nearest block element ancestors for start and end
    let startBlock = startContainer;
    while (startBlock && startBlock.nodeType !== Node.ELEMENT_NODE) { startBlock = startBlock.parentNode; } // Ensure startBlock is an element
    while (startBlock && !splittableBlockElements.includes(startBlock.nodeName) && startBlock !== document.body) {
        startBlock = startBlock.parentNode;
    }
    if (startBlock === document.body) startBlock = null; // Didn't find a valid block ancestor

    let endBlock = endContainer;
    while (endBlock && endBlock.nodeType !== Node.ELEMENT_NODE) { endBlock = endBlock.parentNode; } // Ensure endBlock is an element
    while (endBlock && !splittableBlockElements.includes(endBlock.nodeName) && endBlock !== document.body) {
        endBlock = endBlock.parentNode;
    }
    if (endBlock === document.body) endBlock = null; // Didn't find a valid block ancestor

    // Check if selection spans multiple distinct splittable block elements
    const spansMultipleBlocks = startBlock && endBlock && startBlock !== endBlock;

    if (spansMultipleBlocks) {
        console.log('Selection spans multiple blocks, attempting to split...');
        const allBlocksInRange = [];
        let currentBlock = startBlock;

        // Find the common ancestor to constrain the search
        const commonAncestor = originalRange.commonAncestorContainer;
        let searchRoot = commonAncestor;
        while(searchRoot && searchRoot.nodeType !== Node.ELEMENT_NODE) { searchRoot = searchRoot.parentNode; }
        if (!searchRoot) searchRoot = document.body; // Fallback

        // Get all potential block elements within the common ancestor
        const potentialBlocks = Array.from(searchRoot.querySelectorAll(splittableBlockElements.join(', ')));
        
        // Filter to get only the blocks intersecting the original range
        const intersectingBlocks = potentialBlocks.filter(block => 
            originalRange.intersectsNode(block) &&
            splittableBlockElements.includes(block.nodeName)
        );

        let clipsCreatedCount = 0;

        intersectingBlocks.forEach((block) => {
            const itemRange = document.createRange();
            itemRange.selectNodeContents(block); // Start with the full block

            // Calculate the actual intersection range accurately
            const intersectionRange = document.createRange();
            
            // Start of intersection
            const startCompare = originalRange.compareBoundaryPoints(Range.START_TO_START, itemRange);
            if (startCompare <= 0) { // Selection starts before or at the start of the block
                intersectionRange.setStart(itemRange.startContainer, itemRange.startOffset);
            } else { // Selection starts within the block
                intersectionRange.setStart(originalRange.startContainer, originalRange.startOffset);
            }
            
            // End of intersection
            const endCompare = originalRange.compareBoundaryPoints(Range.END_TO_END, itemRange);
            if (endCompare >= 0) { // Selection ends after or at the end of the block
                intersectionRange.setEnd(itemRange.endContainer, itemRange.endOffset);
            } else { // Selection ends within the block
                intersectionRange.setEnd(originalRange.endContainer, originalRange.endOffset);
            }

            const clipText = intersectionRange.toString().trim();
            if (!clipText) return; // Skip empty clips

            const clipRangeInfo = getRangeInfo(intersectionRange);
            if (!clipRangeInfo) { 
                console.error(`Could not get range info for block intersection: ${block.nodeName}`, block); 
                return;
            }

            const isListItem = block.nodeName === 'LI';
            const clip = createClipObject(
                intersectionRange, 
                clipText, 
                isCodeBlock, 
                isSecondary, 
                currentClipId + clipsCreatedCount, 
                isListItem 
            );
            
            clips.push(clip);
            highlightText(intersectionRange, clip.id, clip.isCode, clip.isSecondary);
            clipsCreatedCount++;
        });

        if (clipsCreatedCount > 0) {
            currentClipId += clipsCreatedCount;
            updateStorageAndUI(); // Update storage and UI after processing all blocks
        } else {
            console.warn("Multi-block selection detected, but no splittable blocks processed. Saving as single block.");
            handleSingleBlockSave(originalRange, selectedText, isCodeBlock, isSecondary);
        }

    } else {
        // Handle non-list/non-multi-paragraph selections (single block)
        console.log('Selection is within a single block or not splittable, saving as single clip.');
        handleSingleBlockSave(originalRange, selectedText, isCodeBlock, isSecondary);
    }
}

// Helper function to create a clip object (refactored)
function createClipObject(range, text, isCodeBlock, isSecondary, id, isList = false) {
    return {
        id: id,
        text: text,
        timestamp: new Date().toISOString(),
        range: getRangeInfo(range), // Make sure getRangeInfo handles the specific range correctly
        url: window.location.href,
        isCode: isCodeBlock,
        isSecondary: isSecondary,
        isList: isList
    };
}

// Helper function to handle saving a single block/non-list clip (refactored)
function handleSingleBlockSave(range, text, isCodeBlock, isSecondary) {
    const clip = createClipObject(range, text, isCodeBlock, isSecondary, currentClipId);
    clips.push(clip);
    currentClipId++;
    highlightText(range, clip.id, clip.isCode, clip.isSecondary);
    // Update storage and UI after saving
    updateStorageAndUI();
}

// Refactored update logic
function updateStorageAndUI() {
    allClips[currentConversationId].clips = clips;
    allClips[currentConversationId].lastUpdated = new Date().toISOString();
    
    chrome.storage.local.set({ 'claudeNotesV2': allClips }, () => {
        console.log('Claude Notes: Clip(s) saved/updated in conversation', currentConversationId);
    });
    
    updateModalContent();
    if (noteModal) {
        noteModal.style.display = 'flex';
    }
}

// Get information about a range that can be stored
function getRangeInfo(range) {
  const container = findMessageContainer(range.commonAncestorContainer);
  if (!container) return null;
  
  // Get the actual element containing the START of the selection range
  let element = range.startContainer; 
  while (element && element.nodeType !== Node.ELEMENT_NODE) {
    element = element.parentNode;
  }
  
  // If the determined element isn't an LI itself, try finding the closest LI ancestor 
  // that still contains the start of the range. This is crucial for ranges starting in nested elements within an LI.
  if (element && element.tagName !== 'LI') {
      const closestLi = element.closest('li');
      // Ensure the found LI actually contains the start of the range we're analyzing
      if (closestLi && closestLi.contains(range.startContainer)) { 
          element = closestLi;
      } else {
          // Fallback if we can't reliably find the LI for this range part.
          // Try the commonAncestorContainer's parent element.
          console.warn("getRangeInfo: Could not reliably find LI element for range start, context might be less accurate.", range);
          element = range.commonAncestorContainer;
           while (element && element.nodeType !== Node.ELEMENT_NODE) {
               element = element.parentNode;
           }
      }
  }
  
  // If element is still null or not identifiable, return null
  if (!element || !element.tagName) {
       console.error("getRangeInfo: Could not determine element for range.", range);
       return null; 
  }

  // Get element context
  const elementContext = {
    type: element.tagName.toLowerCase(),
    classes: Array.from(element.classList || []).join(' '), // Added check for classList
    parentType: element.parentNode ? element.parentNode.tagName.toLowerCase() : null, // Added check for parentNode
    parentClasses: element.parentNode ? Array.from(element.parentNode.classList || []).join(' ') : '', // Added check
    isHeading: element.tagName.match(/^H[1-6]$/i) ? true : false,
    headingLevel: element.tagName.match(/^H([1-6])$/i)?.[1] || null,
    isList: element.tagName === 'LI',
    listType: element.closest('ul, ol')?.tagName.toLowerCase() || null,
    listContext: null // Initialize as null
  };

  // Store list context ONLY if it's definitely a list item and has a parent list
  if (elementContext.isList && element.parentNode) {
      const parentList = element.closest('ul, ol'); // Ensure we get the list element itself
      if (parentList) { // Check if parentList was found
          elementContext.listContext = {
              parentList: parentList.tagName.toLowerCase(),
              listStyle: window.getComputedStyle(element).listStyleType,
              isOrdered: parentList.tagName === 'OL',
              // IMPORTANT: Calculate index relative to the PARENT LIST children
              itemIndex: Array.from(parentList.children).indexOf(element), 
              listStart: parentList.getAttribute('start') || null,
              listReversed: parentList.hasAttribute('reversed') || false
          };
      } else {
          console.warn("getRangeInfo: LI element found, but could not find parent UL/OL.", element);
      }
  }

  const messageContent = container.textContent;
  const messageFingerprint = hashString(messageContent);
  
  // Return the range info, including the potentially refined element context
  return {
    text: range.toString(), // Text content of the specific range (intersection)
    containerFingerprint: messageFingerprint,
    startOffset: range.startOffset, // Relative to startContainer of the passed range
    endOffset: range.endOffset,     // Relative to endContainer of the passed range
    // Store the start/end containers themselves for more robust restoration?
    // startContainerPath: getNodePath(range.startContainer), // Example for future enhancement
    // endContainerPath: getNodePath(range.endContainer),     // Example for future enhancement
    elementContext: elementContext 
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

// Handle heading element highlighting
function handleHeadingHighlight(range, clipId, isSecondary) {
  try {
    const heading = range.commonAncestorContainer.closest('h1, h2, h3, h4, h5, h6');
    if (!heading) return false;

    // Create wrapper span
    const textWrapper = document.createElement('span');
    textWrapper.className = 'claude-notes-text-wrapper claude-notes-heading-wrapper claude-notes-highlight';
    if (isSecondary) {
      textWrapper.classList.add('secondary');
    }
    textWrapper.dataset.clipId = clipId;
    textWrapper.dataset.originalClasses = heading.getAttribute('class');
    textWrapper.dataset.isHeadingClip = 'true';
    
    // Create superscript
    const superscript = document.createElement('sup');
    superscript.textContent = clipId + 1;
    
    // Move content to wrapper
    const content = range.extractContents();
    textWrapper.appendChild(content);
    
    // Insert superscript and wrapper
    range.insertNode(textWrapper);
    textWrapper.parentNode.insertBefore(superscript, textWrapper);
    
    return true;
  } catch (e) {
    console.error('Error in heading highlight:', e);
    return false;
  }
}

// Helper function to handle list item highlighting
function handleListHighlight(range, clipId, isSecondary) {
  try {
    // Find the list container
    let listContainer = range.commonAncestorContainer;
    while (listContainer && !['ul', 'ol'].includes(listContainer.nodeName)) {
      listContainer = listContainer.parentNode;
    }
    
    if (!listContainer) return false;
    
    // Get selected list items
    const listItems = Array.from(listContainer.getElementsByTagName('LI'));
    const selectedItems = listItems.filter(li => {
      const itemRange = document.createRange();
      itemRange.selectNodeContents(li);
      return range.intersectsNode(li);
    });
    
    if (selectedItems.length === 0) return false;
    
    // Create a highlight wrapper for the entire selection
    const highlightWrapper = document.createElement('span');
    highlightWrapper.className = 'claude-notes-highlight';
    if (isSecondary) {
      highlightWrapper.classList.add('secondary');
    }
    highlightWrapper.dataset.clipId = clipId;
    highlightWrapper.dataset.isListClip = 'true';
    
    // Only add superscript to the first item
    const firstItem = selectedItems[0];
    const superscript = document.createElement('sup');
    superscript.textContent = clipId + 1;
    
    // Insert superscript at the start of the text content
    const textNode = Array.from(firstItem.childNodes).find(node => 
      node.nodeType === Node.TEXT_NODE && node.textContent.trim()
    );
    if (textNode) {
      firstItem.insertBefore(superscript, textNode);
    } else {
      firstItem.appendChild(superscript);
    }
    
    // Apply styling to all selected items
    selectedItems.forEach((item, index) => {
      // Store original classes and attributes
      const originalClasses = item.getAttribute('class');
      const originalIndex = item.getAttribute('index');
      const originalDepth = item.closest('ul, ol').getAttribute('depth');
      
      // Create or get the text wrapper span
      let textWrapper = item.querySelector('.claude-notes-text-wrapper');
      if (!textWrapper) {
        textWrapper = document.createElement('span');
        textWrapper.className = 'claude-notes-text-wrapper claude-notes-list-item claude-notes-highlight';
        if (isSecondary) {
          textWrapper.classList.add('secondary');
        }
        
        // Store original attributes
        textWrapper.dataset.originalClasses = originalClasses;
        textWrapper.dataset.originalIndex = originalIndex;
        textWrapper.dataset.originalDepth = originalDepth;
        textWrapper.dataset.clipId = clipId;
        
        // Move all text nodes into the wrapper
        Array.from(item.childNodes).forEach(node => {
          if (node !== superscript && (node.nodeType === Node.TEXT_NODE || node.nodeName !== 'SUP')) {
            textWrapper.appendChild(node.cloneNode(true));
          }
        });
        
        // Clear original text nodes
        Array.from(item.childNodes).forEach(node => {
          if (node !== superscript && (node.nodeType === Node.TEXT_NODE || node.nodeName !== 'SUP')) {
            item.removeChild(node);
          }
        });
        
        item.appendChild(textWrapper);
      }
      
      // Store original list style and additional info for ordered lists
      const computedStyle = window.getComputedStyle(item);
      textWrapper.dataset.originalListStyle = computedStyle.listStyleType;
      
      // For ordered lists, store the original number
      if (listContainer.nodeName === 'OL') {
        // Find the item's position in the original list
        const itemIndex = Array.from(listContainer.children).indexOf(item);
        const startAttr = listContainer.getAttribute('start');
        const startNum = startAttr ? parseInt(startAttr) : 1;
        const originalNumber = startNum + itemIndex;
        textWrapper.dataset.originalNumber = originalNumber;
        
        // Store list style properties
        textWrapper.dataset.isOrdered = 'true';
        if (startAttr) textWrapper.dataset.listStart = startAttr;
        if (listContainer.getAttribute('reversed')) {
          textWrapper.dataset.listReversed = 'true';
        }
        
        // For ordered lists, explicitly set the counter
        item.style.setProperty('counter-reset', `list-item ${originalNumber - 1}`);
      }
      
      // Preserve list spacing
      const listParent = item.closest('ul, ol');
      if (listParent && !listParent.style.paddingLeft) {
        listParent.style.paddingLeft = '28px'; // Claude's default
      }
    });
    
    return true;
  } catch (e) {
    console.error('Error in list highlight:', e);
    return false;
  }
}

// Modify the highlightText function to handle lists specially
function highlightText(range, clipId, isCodeBlock, isSecondary) {
    try {
        // Check if we're in the modal
        const modal = document.getElementById('claude-notes-modal');
        if (modal && modal.contains(range.commonAncestorContainer)) {
            return false;
        }

        // Get the containing element
        let element = range.commonAncestorContainer;
        while (element && element.nodeType !== Node.ELEMENT_NODE) {
            element = element.parentNode;
        }

        // Create base highlight span
        const highlightSpan = document.createElement('span');
        highlightSpan.className = 'claude-notes-highlight';
        if (isSecondary) highlightSpan.classList.add('secondary');
        highlightSpan.dataset.clipId = clipId;

        // Add element-specific attributes
        const tagName = element.tagName.toLowerCase();
        highlightSpan.dataset.elementType = tagName;

        // Special handling for list items
        if (tagName === 'li') {
            highlightSpan.classList.add('whitespace-normal');
            const listParent = element.closest('ul, ol');
            if (listParent) {
                highlightSpan.dataset.listType = listParent.tagName.toLowerCase();
                // Store list context
                highlightSpan.dataset.listContext = JSON.stringify({
                    isOrdered: listParent.tagName === 'OL',
                    listStart: listParent.getAttribute('start'),
                    listReversed: listParent.hasAttribute('reversed'),
                    itemIndex: Array.from(listParent.children).indexOf(element)
                });
            }
        }
        // Handle other element types
        else if (tagName === 'p') {
            highlightSpan.classList.add('whitespace-pre-wrap');
        } else if (tagName.match(/^h[1-6]$/)) {
            highlightSpan.dataset.headingLevel = tagName.charAt(1);
        }

        // Store original classes
        highlightSpan.dataset.originalClasses = Array.from(element.classList).join(' ');
        
        // Apply common styling
        if (!isCodeBlock) {
            highlightSpan.style.textDecoration = 'underline';
            highlightSpan.style.textDecorationColor = isSecondary ? '#444' : '#c96442';
            highlightSpan.style.textDecorationThickness = '1px';
            highlightSpan.style.position = 'relative';
        }

        // Add superscript
        const superscript = document.createElement('sup');
        superscript.textContent = clipId + 1;
        superscript.style.color = isSecondary ? '#444' : '#c96442';
        superscript.style.verticalAlign = 'baseline';
        
        try {
            // Try to use surroundContents for simple cases
            const clonedRange = range.cloneRange();
            clonedRange.surroundContents(highlightSpan);
            highlightSpan.prepend(superscript);
            return true;
        } catch (simpleError) {
            // If that fails, try the complex case
            try {
                const fragment = range.extractContents();
                highlightSpan.appendChild(superscript);
                highlightSpan.appendChild(fragment);
                range.insertNode(highlightSpan);
                return true;
            } catch (complexError) {
                console.error('Error in complex highlight case:', complexError);
                return false;
            }
        }
    } catch (e) {
        console.error('Error in highlightText:', e);
        return false;
    }
}

// Apply highlights for all saved clips
function applyHighlights(retryCount = 0, maxRetries = 5) {
  if (isApplyingHighlights) {
    console.log('Already applying highlights, skipping...');
    return;
  }
  
  isApplyingHighlights = true;
  console.log('Applying highlights for conversation:', currentConversationId);
  
  clearAllHighlights();
  
  if (!clips || clips.length === 0) {
    isApplyingHighlights = false;
    return;
  }
  
  let highlightedCount = 0;
  
  clips.forEach(clip => {
    if (!clip.range || !clip.range.elementContext) return;
    
    let found = false;
    const elementContext = clip.range.elementContext;
    
    // Try to find matching elements based on stored context
    const elementSelector = `${elementContext.type}${elementContext.classes ? '.' + elementContext.classes.split(' ').join('.') : ''}`;
    const elements = document.querySelectorAll(elementSelector);
    
    for (const element of elements) {
      try {
        if (element.textContent.includes(clip.text)) {
          const range = findTextInContainer(element, clip.text);
          if (range) {
            highlightText(range, clip.id, clip.isCode, clip.isSecondary);
            found = true;
            highlightedCount++;
            break;
          }
        }
      } catch (e) {
        console.error('Error highlighting element:', e);
      }
    }
    
    // If not found with exact context, try fuzzy search
    if (!found) {
      const potentialContainers = document.querySelectorAll(elementContext.type);
      for (const container of potentialContainers) {
        try {
          if (container.textContent.includes(clip.text)) {
            const range = findTextInContainer(container, clip.text);
            if (range) {
              highlightText(range, clip.id, clip.isCode, clip.isSecondary);
              found = true;
              highlightedCount++;
              break;
            }
          }
        } catch (e) {
          console.error('Error in fuzzy search:', e);
        }
      }
    }
  });
  
  console.log(`Successfully highlighted ${highlightedCount} out of ${clips.length} clips`);
  
  // If no clips were highlighted but we have clips and haven't exceeded retries, try again
  if (highlightedCount === 0 && clips.length > 0 && retryCount < maxRetries) {
    console.log(`No clips were highlighted, retrying in ${1000 * (retryCount + 1)}ms (attempt ${retryCount + 1}/${maxRetries})`);
    setTimeout(() => {
      applyHighlights(retryCount + 1, maxRetries);
    }, 1000 * (retryCount + 1));
  }
  
  isApplyingHighlights = false;
}

// Clear all existing highlights from the page
function clearAllHighlights() {
  console.log('Clearing all existing highlights');
  
  try {
    // First remove any orphaned superscript elements
    const orphanedSups = document.querySelectorAll('sup');
    orphanedSups.forEach(sup => {
      if (sup.parentNode) {
        sup.parentNode.removeChild(sup);
      }
    });

    const highlights = document.querySelectorAll('.claude-notes-highlight');
    
    if (highlights.length === 0) {
      console.log('No highlights found to clear');
      return;
    }
    
    console.log(`Clearing ${highlights.length} highlights`);
    
    highlights.forEach(highlight => {
      try {
        const parent = highlight.parentNode;
        if (!parent) {
          console.log('Highlight has no parent, skipping');
          return;
        }
        
        // Remove all superscript elements first
        const sups = highlight.querySelectorAll('sup');
        sups.forEach(sup => sup.remove());
        
        // Move remaining children (text nodes) out before removing the highlight element
        while (highlight.firstChild) {
          parent.insertBefore(highlight.firstChild, highlight);
        }
        
        // Remove the empty highlight span
        parent.removeChild(highlight);
      } catch (e) {
        console.error('Error clearing specific highlight', e);
      }
    });
  } catch (e) {
    console.error('Error in clearAllHighlights:', e);
  }
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
          highlightText(range, clip.id, clip.isCode, clip.isSecondary);
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
    // First try exact match within the text content
    if (container.textContent.includes(searchText)) {
      const textNodes = getTextNodes(container);
      const searchTextLower = searchText.toLowerCase();
      
      // Try exact match in individual text nodes
      for (const node of textNodes) {
        if (node.textContent.includes(searchText)) {
          const startPos = node.textContent.indexOf(searchText);
          const range = document.createRange();
          range.setStart(node, startPos);
          range.setEnd(node, startPos + searchText.length);
          return range;
        }
      }
      
      // Try case-insensitive match in individual nodes
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
        
        // Try exact match first
        let pos = fullText.indexOf(searchText);
        if (pos < 0) {
          // Fall back to case-insensitive match
          pos = fullText.toLowerCase().indexOf(searchTextLower);
        }
        
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
      
      // If we couldn't create a precise range but we know the text is in there,
      // create a range for the first portion of the container as a fallback
      if (textNodes.length > 0) {
        console.log('Creating fallback range for text that we know exists in container');
        const firstNode = textNodes[0];
        const range = document.createRange();
        range.setStart(firstNode, 0);
        range.setEnd(firstNode, Math.min(firstNode.length || 0, searchText.length));
        return range;
      }
    }
    
    // Final fallback - if we know the text should be in this container but couldn't find it normally
    // Look for smaller chunks of the text
    if (searchText.length > 20) {
      // Try to find a significant chunk of the search text
      const chunk = searchText.slice(0, Math.min(20, searchText.length / 2));
      console.log('Trying to find a chunk of the text:', chunk);
      return findTextInContainer(container, chunk);
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
  const filterContainer = document.getElementById('claude-notes-filter-container');
  const labelSelect = document.getElementById('claude-notes-label-filter-select');
  const clearFilterButton = document.getElementById('claude-notes-clear-filter-button');
  
  modalContent.innerHTML = ''; // Clear previous content
  
  // --- Debugging Start ---
  console.log(`--- updateModalContent ---`);
  console.log(`Active Tab: ${activeTab}`);
  console.log(`Total clips in memory: ${clips.length}`);
  console.log(`Annotations in memory: ${clips.filter(c => c.isSecondary).length}`);
  // --- Debugging End ---

  // Handle filter UI visibility and population
  if (activeTab === 'annotations' && labelSelect && filterContainer) {
    filterContainer.style.display = 'flex'; // Show filter UI

    // Get unique labels from *all* annotations
    const uniqueLabels = [...new Set(
        clips
            .filter(clip => clip.isSecondary && clip.label)
            .map(clip => clip.label)
    )].sort();

    // Populate select dropdown
    // Store current value to reset it later if possible
    const currentSelectedValue = labelSelect.value;
    labelSelect.innerHTML = ''; // Clear previous options
    
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "-- Filter by label --";
    labelSelect.appendChild(defaultOption);

    uniqueLabels.forEach(label => {
        const option = document.createElement('option');
        option.value = label;
        option.textContent = label;
        labelSelect.appendChild(option);
    });

    // Set current filter selection and button state
    // Try to restore previous selection if it still exists, otherwise use global filter state
    if (uniqueLabels.includes(currentSelectedValue)) {
        labelSelect.value = currentSelectedValue;
        currentAnnotationFilter = currentSelectedValue; // Ensure filter state matches dropdown
    } else {
        labelSelect.value = currentAnnotationFilter || ""; 
    }
    clearFilterButton.disabled = !currentAnnotationFilter;

  } else if (filterContainer) {
    filterContainer.style.display = 'none'; // Hide filter UI for 'Clips' tab
  }
  
  // Check for overall clips emptiness first
  if (clips.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = activeTab === 'clips' 
      ? 'No clips saved in this conversation yet. Select text and click "Clip" to save.'
      : 'No annotations saved in this conversation yet. Select text and click "Annotate" to save.';
    applyStyles(emptyMessage, {
      color: styles.colors.text.normal
    });
    modalContent.appendChild(emptyMessage);
    return;
  }
  
  // Filter clips based on active tab FIRST
  let filteredClips = clips.filter(clip => 
    activeTab === 'clips' ? !clip.isSecondary : clip.isSecondary
  );
  
  // --- Debugging Start ---
  console.log(`Clips after tab filter (${activeTab}): ${filteredClips.length}`);
  console.log(`Current label filter: ${currentAnnotationFilter}`);
  // --- Debugging End ---

  // NEW: Apply label filter if on Annotations tab and filter is active
  if (activeTab === 'annotations' && currentAnnotationFilter) {
      filteredClips = filteredClips.filter(clip => clip.label === currentAnnotationFilter);
      // --- Debugging Start ---
      console.log(`Clips after label filter (${currentAnnotationFilter}): ${filteredClips.length}`);
      // --- Debugging End ---
  }
  
  // Check for emptiness AFTER filtering
  if (filteredClips.length === 0) {
     const emptyMessage = document.createElement('p');
     emptyMessage.textContent = activeTab === 'clips' 
       ? 'No clips saved yet.' // Should not happen if clips.length > 0, but good fallback
       : currentAnnotationFilter 
         ? `No annotations found with label: "${currentAnnotationFilter}"`
         : 'No annotations saved yet.'; // Adjusted message
     applyStyles(emptyMessage, { color: styles.colors.text.normal });
     modalContent.appendChild(emptyMessage);
    return;
  }
  
  // Sort clips in descending order (newest first)
  const sortedClips = [...filteredClips].reverse();
  
  // --- Debugging Start ---
  console.log('Clips to render:', sortedClips.map(c => ({ id: c.id, text: c.text.substring(0, 15), isSecondary: c.isSecondary, label: c.label })));
  // --- Debugging End ---
  
  // Render the filtered clips (existing loop logic)
  sortedClips.forEach(clip => {
      const clipElement = document.createElement('div');
      clipElement.className = 'claude-notes-clip';
      applyStyles(clipElement, createStyleObject(baseStyles.clip, {
        cursor: 'pointer'  // Add pointer cursor to indicate clickability
      }));
      
      // Add click handler to the clip element
      clipElement.addEventListener('click', (e) => {
        // Don't trigger if clicking the delete button
        if (e.target.closest('button')) return;
        scrollToClip(clip.id);
      });
  
      const clipNumber = document.createElement('div');
      clipNumber.textContent = clip.id + 1;
      applyStyles(clipNumber, createStyleObject(baseStyles.clipNumber, {
        color: clip.isSecondary ? styles.colors.text.normal : styles.colors.primary
      }));
      
      const clipContent = document.createElement('div');
      applyStyles(clipContent, baseStyles.clipContent);
      
      const clipText = document.createElement(clip.isCode ? 'code' : 'p');
      clipText.textContent = clip.text;
      
      // Apply appropriate styles based on clip type
      if (clip.isCode) {
        applyStyles(clipText, baseStyles.codeClip);
      } else {
        applyStyles(clipText, createStyleObject(
          baseStyles.clipText,
          clip.isSecondary ? baseStyles.clipTextSecondary : {}
        ));
      }
      
      clipContent.appendChild(clipText); // Add the main text first
  
      // Display label if it exists (existing logic)
      if (clip.label) {
          const clipLabel = document.createElement('div');
          // Remove the "Label: " prefix
          clipLabel.textContent = clip.label; 
          applyStyles(clipLabel, {
              fontSize: '0.75rem', // Smaller font size
              color: styles.colors.text.normal,
              marginTop: styles.spacing.xs,
              fontStyle: 'italic'
          });
          clipContent.appendChild(clipLabel); // Append label below text
      }
  
      const deleteButton = document.createElement('button');
      applyStyles(deleteButton, createStyleObject(baseStyles.deleteButton, {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }));
      deleteButton.appendChild(ClaudeIcons.createIcon('x', 16, styles.colors.text.normal));
      deleteButton.addEventListener('click', () => {
        deleteClip(clip.id);
      });
      
      clipElement.appendChild(clipNumber);
      clipElement.appendChild(clipContent);
      clipElement.appendChild(deleteButton);
      modalContent.appendChild(clipElement);
  });
}

// Clear all clips from current conversation
function clearAllClips() {
  if (confirm('Are you sure you want to clear all notes from this conversation?')) {
    // 1. Remove all highlights from the current page DOM
    clearAllHighlights(); // Call the existing function to clear styles

    // 2. Clear clips array for the current conversation
    clips = [];
    currentClipId = 0; // Reset ID counter

    // 3. Update the master storage object
    if (allClips[currentConversationId]) {
        allClips[currentConversationId].clips = []; // Set to empty array
        allClips[currentConversationId].lastUpdated = new Date().toISOString();
    } else {
        // If conversation wasn't in allClips somehow, initialize it empty
        // This shouldn't typically happen if clips existed, but good practice
        allClips[currentConversationId] = {
          id: currentConversationId,
          title: conversationTitle, // Use current title
          lastUpdated: new Date().toISOString(),
          clips: []
        };
    }

    // 4. Save updated storage
    chrome.storage.local.set({ 'claudeNotesV2': allClips }, () => {
        console.log('Claude Notes: All clips cleared from conversation', currentConversationId);
    });

    // 5. Update the modal UI
    updateModalContent();
  }
}

// Load clips from storage
function loadClips() {
  chrome.storage.local.get(['claudeNotes', 'claudeNotesV2'], (result) => {
    if (result.claudeNotesV2) {
      // Use V2 format
      allClips = result.claudeNotesV2;
      
      // Check each conversation title and fix if needed
      let needsUpdate = false;
      Object.values(allClips).forEach(conversation => {
        if (conversation.title && conversation.title.endsWith(' - Claude')) {
          conversation.title = conversation.title.replace(' - Claude', '').trim();
          conversation.lastUpdated = new Date().toISOString();
          needsUpdate = true;
        }
      });
      
      // Save updates if any titles were corrected
      if (needsUpdate) {
        chrome.storage.local.set({ 'claudeNotesV2': allClips }, () => {
          console.log('Updated conversation titles');
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

        // Show modal if we have clips and are in a conversation
        if (clips.length > 0 && currentConversationId !== 'default') {
          console.log('Found existing clips, showing modal...');
          if (!noteModal) {
            createModal();
          }
          noteModal.style.display = 'flex';
          updateModalContent();
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
    
    // Update modal content
    updateModalContent();
    
    // Apply highlights with a slight delay to ensure page has loaded
    if (clips.length > 0) {
      console.log('Waiting for Claude content before applying highlights...');
      waitForClaudeContent();
    }
  });
}

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);
  
  if (message.action === 'toggleModal') {
    // Get current conversation ID
    const currentConvId = extractConversationId();
    
    // Check if we're on a page with a valid conversation ID
    if (currentConvId === 'default') {
      console.log('No valid conversation ID found, cannot show modal');
      sendResponse({ success: false, error: 'No conversation found on this page' });
      return true;
    }
    
    // Initialize if needed
    if (!noteModal) {
      console.log('Modal not initialized yet, creating it now');
      init();
    } else {
      // Check if we need to refresh data due to conversation change
      if (currentConvId !== currentConversationId) {
        console.log('Conversation changed since last modal interaction, updating...');
        // Update conversation info
        currentConversationId = currentConvId;
        lastUrl = window.location.href;
        conversationTitle = document.title.replace(' - Claude', '').trim();
        
        // Clear old highlights
        clearAllHighlights();
        
        // Load new clips and update modal
        loadClips();
        
        // This will trigger after loadClips completes
        setTimeout(() => {
          // Apply new highlights
          applyHighlights();
        }, 100);
      } else {
        // Same conversation, but make sure modal content is up to date
        updateModalContent();
      }
    }
    
    // Toggle modal visibility
    if (noteModal) {
      if (noteModal.style.display === 'none') {
        console.log('Showing modal');

        // --- NEW: Explicitly set initial position (v2) ---
        console.log('Applying initial position: top 100px, right 24px, clear left'); // Updated log
        noteModal.style.top = '100px';
        noteModal.style.right = '24px'; // Changed from 50px
        noteModal.style.left = ''; // Clear any explicit left style
        // --- END NEW ---

        noteModal.style.display = 'flex';

        // Force update the content when showing
        updateModalContent();

        // Make sure modal stays within bounds
        ensureModalWithinBounds();
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

// Ensure modal stays within bounds when window resizes
function ensureModalWithinBounds() {
  if (!noteModal) return;
  
  console.log('--- ensureModalWithinBounds --- START ---'); // Log start
  console.log('Initial styles:', { top: noteModal.style.top, left: noteModal.style.left, right: noteModal.style.right }); // Log initial styles

  const minDistanceFromEdge = 50;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const modalWidth = noteModal.offsetWidth;
  const modalHeight = noteModal.offsetHeight;

  // Get current position more reliably using getBoundingClientRect
  const rect = noteModal.getBoundingClientRect();
  let currentTop = rect.top;
  let currentLeft = rect.left;
  
  console.log('Dimensions:', { windowWidth, windowHeight, modalWidth, modalHeight });
  console.log('Current Rect:', { currentTop, currentLeft });

  // Check if modal is too close to any edge
  let needsRepositioning = false;

  // Top constraint
  if (currentTop < minDistanceFromEdge) {
    console.log('Adjusting TOP: Too close to top');
    noteModal.style.top = `${minDistanceFromEdge}px`;
    needsRepositioning = true;
  } 
  // Bottom constraint
  else if (currentTop + modalHeight > windowHeight - minDistanceFromEdge) {
    console.log('Adjusting TOP: Too close to bottom');
    const newTop = Math.max(minDistanceFromEdge, windowHeight - modalHeight - minDistanceFromEdge); // Ensure it doesn't go above top edge
    noteModal.style.top = `${newTop}px`;
    needsRepositioning = true;
  }
  
  // --- Check RIGHT edge FIRST if right style is set ---
  if (noteModal.style.right && noteModal.style.right !== 'auto') {
      const currentRight = windowWidth - currentLeft - modalWidth;
      console.log('Checking RIGHT edge (currentRight value: ', currentRight, ')');
      if (currentRight < minDistanceFromEdge) {
          console.log('Adjusting RIGHT: Too close to right edge');
          const newRight = minDistanceFromEdge;
          noteModal.style.right = `${newRight}px`;
          noteModal.style.left = ''; // Clear left if setting right
          needsRepositioning = true;
      }
      // If right is okay, we might not need to check left unless it's also out of bounds
      else if (currentLeft < minDistanceFromEdge) {
          console.log('Adjusting LEFT (even though right was set): Too close to left edge');
          noteModal.style.left = `${minDistanceFromEdge}px`;
          noteModal.style.right = ''; // Clear right if setting left
          needsRepositioning = true;
      }
  } else {
      // --- Original Left/Right check if right style wasn't the priority ---
      console.log('Checking LEFT/RIGHT edges (right style not set)');
      // Left constraint
      if (currentLeft < minDistanceFromEdge) {
        console.log('Adjusting LEFT: Too close to left edge');
        noteModal.style.left = `${minDistanceFromEdge}px`;
        noteModal.style.right = ''; // Clear right if setting left
        needsRepositioning = true;
      } 
      // Right constraint (based on left + width)
      else if (currentLeft + modalWidth > windowWidth - minDistanceFromEdge) {
        console.log('Adjusting LEFT: Too close to right edge');
        const newLeft = Math.max(minDistanceFromEdge, windowWidth - modalWidth - minDistanceFromEdge); // Ensure it doesn't go past left edge
        noteModal.style.left = `${newLeft}px`;
        noteModal.style.right = ''; // Clear right if setting left
        needsRepositioning = true;
      }
  }

  if (needsRepositioning) {
      console.log('Final styles applied:', { top: noteModal.style.top, left: noteModal.style.left, right: noteModal.style.right });
  }
  console.log('--- ensureModalWithinBounds --- END ---'); // Log end
}

// Add this new function to handle scrolling to a clip
function scrollToClip(clipId) {
  const highlight = document.querySelector(`.claude-notes-highlight[data-clip-id="${clipId}"]`);
  if (!highlight) {
    console.log('Could not find highlight for clip:', clipId);
    return;
  }

  // Scroll the highlight into view with some padding
  highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Optional: Add a brief highlight animation
  highlight.style.transition = 'background-color 0.5s';
  highlight.style.backgroundColor = 'rgba(201, 100, 66, 0.2)';  // Using the primary color
  
  // Remove the highlight after animation
  setTimeout(() => {
    highlight.style.backgroundColor = '';
    highlight.style.transition = '';
  }, 1500);
}

function restoreHighlight(clip, container) {
  // Find the matching element based on context
  let targetElement = null;
  const elementContext = clip.elementContext;
  
  // Handle headings
  if (elementContext.isHeading) {
    const headings = container.querySelectorAll(`h${elementContext.headingLevel}`);
    for (const heading of headings) {
      if (heading.textContent.includes(clip.text)) {
        targetElement = heading;
        break;
      }
    }
  }
  // Handle list items
  else if (elementContext.isList) {
    const listContext = elementContext.listContext;
    const listSelector = listContext.isOrdered ? 'ol' : 'ul';
    const lists = container.querySelectorAll(listSelector);
    
    for (const list of lists) {
      // Check if list properties match
      if (listContext.isOrdered) {
        const startMatch = list.getAttribute('start') === listContext.listStart;
        const reversedMatch = list.hasAttribute('reversed') === listContext.listReversed;
        if (!startMatch || !reversedMatch) continue;
      }
      
      const items = Array.from(list.children);
      // Try to find the matching list item
      for (const item of items) {
        if (item.textContent.includes(clip.text)) {
          targetElement = item;
          break;
        }
      }
      if (targetElement) break;
    }
  }
  // Handle other elements
  else {
    // Existing logic for other elements
    const elements = container.querySelectorAll(`${elementContext.type}.${elementContext.classes.split(' ').join('.')}`);
    for (const el of elements) {
      if (el.textContent.includes(clip.text)) {
        targetElement = el;
        break;
      }
    }
  }

  if (!targetElement) return false;

  // Create range and highlight
  const range = document.createRange();
  const textNode = findTextNode(targetElement, clip.text);
  if (!textNode) return false;

  range.setStart(textNode, clip.startOffset);
  range.setEnd(textNode, clip.endOffset);
  
  highlightRange(range);
  return true;
}

// Helper function to find text node containing the target text
function findTextNode(element, targetText) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.includes(targetText)) {
      return node;
    }
  }
  return null;
}

// --- Label Storage Functions ---
async function getLabels() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['claudeNotesLabels'], (result) => {
            resolve(result.claudeNotesLabels || []);
        });
    });
}

async function addLabel(newLabel) {
    return new Promise(async (resolve) => {
        const existingLabels = await getLabels();
        if (!existingLabels.includes(newLabel)) {
            const updatedLabels = [...existingLabels, newLabel].sort(); // Keep sorted
            chrome.storage.local.set({ 'claudeNotesLabels': updatedLabels }, () => {
                console.log('Added new label:', newLabel);
                resolve();
            });
        } else {
            resolve(); // Label already exists
        }
    });
}

// New function
async function openAnnotationModal(selection, isCodeBlock) {
    // Store selection info immediately
    const selectedText = selection.toString().trim();
    if (!selectedText) return; // Don't open if selection disappeared
    const range = selection.getRangeAt(0).cloneRange(); // Clone range for later use

    // --- Create Modal Elements ---
    const annotationModal = document.createElement('div');
    annotationModal.id = 'claude-notes-annotation-modal';
    applyStyles(annotationModal, createStyleObject(baseStyles.modal, {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)', // Center the modal
        width: '400px',
        maxHeight: '80vh', // Limit height
        zIndex: '10002', // Ensure it's above the main modal
        display: 'flex' // Make sure it's visible
    }));

    // Header
    const modalHeader = document.createElement('div');
    applyStyles(modalHeader, baseStyles.header);
    const modalTitle = document.createElement('span');
    modalTitle.textContent = 'Add Label to Annotation';
    applyStyles(modalTitle, { fontWeight: 'bold' });
    const closeButton = document.createElement('button');
    applyStyles(closeButton, baseStyles.button);
    closeButton.appendChild(ClaudeIcons.createIcon('x', 20, styles.colors.text.normal));
    closeButton.onclick = () => document.body.removeChild(annotationModal);
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);

    // Content Area
    const modalContent = document.createElement('div');
    applyStyles(modalContent, createStyleObject(baseStyles.content, { display: 'flex', flexDirection: 'column', gap: styles.spacing.md }));

    // Preview Section
    const previewLabel = document.createElement('div');
    previewLabel.textContent = 'Selected text:';
    applyStyles(previewLabel, { fontWeight: 'bold' });
    const preview = document.createElement('div');
    preview.textContent = selectedText;
    applyStyles(preview, {
        padding: styles.spacing.sm,
        backgroundColor: styles.colors.background.light,
        borderRadius: '4px',
        fontSize: '0.875rem',
        maxHeight: '150px', // Limit preview height
        overflowY: 'auto'
    });

    // Labeling Section
    const labelingSection = document.createElement('div');
    applyStyles(labelingSection, { display: 'flex', flexDirection: 'column', gap: styles.spacing.sm });
    
    const existingLabels = await getLabels(); // Fetch existing labels (async)
    let labelSelect;
    
    if (existingLabels.length > 0) {
        const selectLabelText = document.createElement('label');
        selectLabelText.textContent = 'Select existing label:';
        applyStyles(selectLabelText, { fontSize: '0.9rem', color: styles.colors.text.normal });
        
        labelSelect = document.createElement('select');
        applyStyles(labelSelect, { padding: styles.spacing.sm, border: `1px solid ${styles.colors.border}`, borderRadius: '4px' });
        
        // Add a default "Select..." option
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "-- Select existing --";
        labelSelect.appendChild(defaultOption);

        // Add existing labels
        existingLabels.forEach(label => {
            const option = document.createElement('option');
            option.value = label;
            option.textContent = label;
            labelSelect.appendChild(option);
        });
        labelingSection.appendChild(selectLabelText);
        labelingSection.appendChild(labelSelect);
    }

    const newLabelLabel = document.createElement('label');
    newLabelLabel.textContent = existingLabels.length > 0 ? 'Or add new label:' : 'Add label:';
     applyStyles(newLabelLabel, { fontSize: '0.9rem', color: styles.colors.text.normal, marginTop: existingLabels.length > 0 ? styles.spacing.sm : '0' });
    
    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.placeholder = 'Enter new label...';
    applyStyles(labelInput, { padding: styles.spacing.sm, border: `1px solid ${styles.colors.border}`, borderRadius: '4px' });
    labelingSection.appendChild(newLabelLabel);
    labelingSection.appendChild(labelInput);

    // Action Buttons
    const modalActions = document.createElement('div');
    applyStyles(modalActions, createStyleObject(baseStyles.actions, { borderTop: 'none', paddingTop: '0' })); // No border needed here
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    applyStyles(cancelButton, createStyleObject(baseStyles.actionButton, { backgroundColor: styles.colors.text.normal }));
    cancelButton.onclick = () => document.body.removeChild(annotationModal);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save Annotation';
    applyStyles(saveButton, createStyleObject(baseStyles.actionButton, { backgroundColor: styles.colors.primary }));
    saveButton.onclick = async () => {
        let chosenLabel = "";
        // Prioritize dropdown selection if it exists and has a value
        if (labelSelect && labelSelect.value) {
            chosenLabel = labelSelect.value;
        } else {
            chosenLabel = labelInput.value.trim();
        }

        if (!chosenLabel) {
            alert("Please select or enter a label.");
            return;
        }

        // If it's a new label, add it to the global list
        if (!existingLabels.includes(chosenLabel)) {
            await addLabel(chosenLabel); 
        }

        // --- Save the clip with the label ---
        const clipRangeInfo = getRangeInfo(range); // Get context for the original range
        if (!clipRangeInfo) {
             console.error("Could not get range info for annotation.");
             alert("Error saving annotation context. Please try again.");
             document.body.removeChild(annotationModal);
             return;
        }

        const clip = createClipObject(
            range, 
            selectedText, 
            isCodeBlock, 
            true, // Mark as secondary/annotation
            currentClipId, // Use the current global ID
            clipRangeInfo.elementContext.isList // Pass isList flag from context
        );
        clip.label = chosenLabel; // Add the label property

        clips.push(clip);
        currentClipId++; // Increment AFTER assigning

        highlightText(range, clip.id, clip.isCode, clip.isSecondary);
        updateStorageAndUI(); // Save to storage and update main modal

        document.body.removeChild(annotationModal); // Close this modal
    };

    modalActions.appendChild(cancelButton);
    modalActions.appendChild(saveButton);

    // --- Assemble Modal ---
    modalContent.appendChild(previewLabel);
    modalContent.appendChild(preview);
    modalContent.appendChild(labelingSection);
    annotationModal.appendChild(modalHeader);
    annotationModal.appendChild(modalContent);
    annotationModal.appendChild(modalActions);

    // Add to document
    document.body.appendChild(annotationModal);
    labelInput.focus(); // Focus the input field
} 