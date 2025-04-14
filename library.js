// Library script for Claude Notes

// Global DOM element variables
let notesTabButton, labelsTabButton;
let searchInput, exportButton, clearAllButton; // Assign later
let searchContainer, mainContentArea, clipsContainer, emptyState;
let activeLibraryTab = 'notes'; // Default tab

// Global data variables
let allClipsV2 = {}; // New format with conversations

document.addEventListener('DOMContentLoaded', function() {
  console.log('Library page loaded');
  
  // Assign existing top-level buttons
  searchInput = document.getElementById('search');
  exportButton = document.getElementById('export-notes');
  clearAllButton = document.getElementById('clear-all');

  // Get main container where content will be swapped
  const container = document.querySelector('.container'); 
  if (!container) {
      console.error("Main container (.container) not found!");
      return;
  }

  // --- Create Header (if it doesn't exist) ---
  let header = container.querySelector('header');
  if (!header) {
      header = document.createElement('header');
      const title = document.createElement('h1');
      title.textContent = 'Claude Notes Library';
      header.appendChild(title);
      container.prepend(header); // Prepend header to the main container
  }

  // Ensure header actions div exists
  let headerActions = header.querySelector('.actions');
  if (!headerActions) {
      headerActions = document.createElement('div');
      headerActions.className = 'actions';
      header.appendChild(headerActions);
  }

  // Move Export and Clear buttons to header actions if they aren't already there
  if (exportButton && exportButton.parentNode !== headerActions) {
      if (exportButton.parentNode) exportButton.parentNode.removeChild(exportButton);
      headerActions.appendChild(exportButton);
  }
  if (clearAllButton && clearAllButton.parentNode !== headerActions) {
      if (clearAllButton.parentNode) clearAllButton.parentNode.removeChild(clearAllButton);
      headerActions.appendChild(clearAllButton);
  }


  // --- Create Tab Container --- 
  const tabContainer = document.createElement('div');
  tabContainer.className = 'library-tabs'; // Add class for styling

  notesTabButton = document.createElement('button');
  notesTabButton.textContent = 'Notes';
  notesTabButton.className = 'tab-button active'; // Start as active
  notesTabButton.addEventListener('click', () => switchLibraryTab('notes'));

  labelsTabButton = document.createElement('button');
  labelsTabButton.textContent = 'Labels';
  labelsTabButton.className = 'tab-button';
  labelsTabButton.addEventListener('click', () => switchLibraryTab('labels'));

  tabContainer.appendChild(notesTabButton);
  tabContainer.appendChild(labelsTabButton);

  // Insert tabs after the header
  header.after(tabContainer);

  // --- Create Main Content Area --- 
  mainContentArea = document.createElement('div');
  mainContentArea.id = 'library-main-content';

  // Find existing search and clips containers and detach them
  searchContainer = document.querySelector('.search-container'); 
  clipsContainer = document.getElementById('clips-container');   
  emptyState = document.getElementById('empty-state'); 

  if (searchContainer && searchContainer.parentNode) searchContainer.parentNode.removeChild(searchContainer);
  if (clipsContainer && clipsContainer.parentNode) clipsContainer.parentNode.removeChild(clipsContainer);
  if (emptyState && emptyState.parentNode) emptyState.parentNode.removeChild(emptyState);

  // Insert main content area after the tabs
  tabContainer.after(mainContentArea);

  // --- Initial Load --- 
  chrome.storage.local.get(['claudeNotesV2'], function(result) {
    if (result.claudeNotesV2) {
      allClipsV2 = result.claudeNotesV2;
      // Initial render based on the default active tab ('notes')
      switchLibraryTab(activeLibraryTab);
    } else {
       // Handle case with no data at all
       switchLibraryTab(activeLibraryTab); // Still setup the view
    }
  });

  // --- Event Listeners --- 
   if (searchInput) { 
       searchInput.addEventListener('input', filterClips);
   } else {
       console.warn("Search input element not found during setup.");
   }
   if (exportButton) {
       exportButton.addEventListener('click', exportNotes);
   } else {
        console.warn("Export button not found during setup.");
   }
   if (clearAllButton) {
        clearAllButton.addEventListener('click', confirmClearAll);
   } else {
        console.warn("Clear All button not found during setup.");
   }
   
}); // End DOMContentLoaded

// --- New Tab Switching Logic ---
function switchLibraryTab(tabName) {
  activeLibraryTab = tabName;
  mainContentArea.innerHTML = ''; // Clear previous content

  if (tabName === 'notes') {
    notesTabButton.classList.add('active');
    labelsTabButton.classList.remove('active');

    // Add search bar back
    if (searchContainer) {
        mainContentArea.appendChild(searchContainer);
    } else {
        console.error("Search container ref is missing when switching to Notes tab.");
    }
    // Add clips container back (renderConversations will populate it)
    if (clipsContainer) {
        mainContentArea.appendChild(clipsContainer);
    } else {
         console.error("Clips container ref is missing when switching to Notes tab.");
    }
     // Add empty state back (it will be managed by renderConversations)
    if (emptyState && !document.getElementById('empty-state')) { // Prevent duplicates if already added
        mainContentArea.appendChild(emptyState); 
    }

    // Render notes content
    renderConversations(allClipsV2);
    // Re-apply filter if needed
    if (searchInput && searchInput.value) {
        filterClips();
    }

  } else if (tabName === 'labels') {
    notesTabButton.classList.remove('active');
    labelsTabButton.classList.add('active');

    // Render labels content
    renderLabelsTab();
  }
}

// --- New Function to Render Labels Tab ---
async function renderLabelsTab() {
  mainContentArea.innerHTML = ''; // Clear notes/search stuff

  const labels = await getLabels(); // Use utility function

  const labelsContainer = document.createElement('div');
  labelsContainer.className = 'labels-list-container';

  if (labels.length === 0) {
    labelsContainer.innerHTML = '<p class="empty-message">No labels created yet.</p>';
  } else {
    labels.forEach(label => {
      const labelRow = document.createElement('div');
      labelRow.className = 'label-row';

      const labelText = document.createElement('span');
      labelText.textContent = label;
      labelText.className = 'label-text';

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.className = 'danger label-delete-btn'; // Use danger style
      deleteButton.addEventListener('click', () => deleteLabel(label));

      labelRow.appendChild(labelText);
      labelRow.appendChild(deleteButton);
      labelsContainer.appendChild(labelRow);
    });
  }
  mainContentArea.appendChild(labelsContainer);
}

// --- New Function to Delete Labels ---
async function deleteLabel(labelToDelete) {
    if (!confirm(`Are you sure you want to delete the label "${labelToDelete}"? This will remove the label from all associated annotations.`)) {
        return;
    }

    try {
        // 1. Fetch current clips data
        const result = await new Promise(resolve => chrome.storage.local.get(['claudeNotesV2'], resolve));
        let currentAllClips = result.claudeNotesV2 || {};
        let updated = false;

        // 2. Iterate and remove label from clips
        Object.values(currentAllClips).forEach(conversation => {
            if (conversation.clips && conversation.clips.length > 0) {
                conversation.clips.forEach(clip => {
                    if (clip.label === labelToDelete) {
                        delete clip.label; // Remove the property
                        updated = true;
                    }
                });
            }
        });

        // 3. Fetch current labels list
        const currentLabels = await getLabels();

        // 4. Filter out the deleted label
        const updatedLabels = currentLabels.filter(label => label !== labelToDelete);

        // 5. Save updated clips data (only if changed)
        if (updated) {
            await new Promise(resolve => chrome.storage.local.set({ 'claudeNotesV2': currentAllClips }, resolve));
             allClipsV2 = currentAllClips; // Update in-memory version
             console.log(`Label "${labelToDelete}" removed from associated clips.`);
        }

        // 6. Save updated labels list
        await new Promise(resolve => chrome.storage.local.set({ 'claudeNotesLabels': updatedLabels }, resolve));
        console.log(`Label "${labelToDelete}" deleted from global list.`);

        // 7. Re-render the labels tab
        renderLabelsTab();

    } catch (error) {
        console.error("Error deleting label:", error);
        alert("An error occurred while deleting the label.");
    }
}


// --- Utility Functions ---
async function getLabels() {
    // Fetches labels from storage
    return new Promise((resolve) => {
        chrome.storage.local.get(['claudeNotesLabels'], (result) => {
            resolve(result.claudeNotesLabels || []);
        });
    });
}

// --- Existing Functions (Adjusted for Tab View) ---

// Modify showEmptyState to accept a target container and ensure it has the ID
function showEmptyState(target = clipsContainer) { 
   if (!target) target = mainContentArea; // Fallback if clipsContainer ref is lost
   target.innerHTML = ''; // Clear previous content before showing empty state
   const emptyDiv = document.createElement('div');
   emptyDiv.id = 'empty-state'; // Ensure it has the ID
   emptyDiv.className = 'empty-message';
   emptyDiv.textContent = 'No notes found. Select text in Claude.ai and click "Clip" to save notes.';
   target.appendChild(emptyDiv);
}

// Adjust renderConversations to target the correct container
function renderConversations(conversationsObj) {
    const targetContainer = document.getElementById('clips-container') || mainContentArea; 
    targetContainer.innerHTML = ''; // Clear previous content
    
    const conversations = Object.values(conversationsObj)
      .filter(conv => conv.clips && conv.clips.length > 0)
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    
    if (conversations.length === 0) {
      showEmptyState(targetContainer);
      return;
    }
    
    const conversationsContainer = document.createElement('div');
    conversationsContainer.className = 'conversations-container';
    
    conversations.forEach(conversation => {
      if (!conversation.clips || conversation.clips.length === 0) return;
      
      const conversationSection = document.createElement('div');
      conversationSection.className = 'conversation-section';
      
      const conversationHeader = document.createElement('div');
      conversationHeader.className = 'conversation-header';
      
      const conversationTitle = document.createElement('h2');
      conversationTitle.className = 'conversation-title';
      conversationTitle.textContent = conversation.title || 'Untitled Conversation';
      conversationTitle.style.margin = '0'; // Keep margin override if desired
      
      const headerActions = document.createElement('div');
      headerActions.className = 'header-actions';
      
      const downloadButton = document.createElement('button');
      downloadButton.textContent = 'Download';
      downloadButton.className = 'download-btn';
      downloadButton.addEventListener('click', () => downloadConversation(conversation));
      
      headerActions.appendChild(downloadButton);
      
      conversationHeader.appendChild(conversationTitle);
      conversationHeader.appendChild(headerActions);
            
      const conversationClips = document.createElement('div');
      conversationClips.className = 'conversation-clips';
      
      conversation.clips.forEach(clip => {
        const clipCard = createClipCard(clip, conversation.id);
        conversationClips.appendChild(clipCard);
      });
      
      conversationSection.appendChild(conversationHeader);
      conversationSection.appendChild(conversationClips);
      
      conversationsContainer.appendChild(conversationSection);
    });
    
    targetContainer.appendChild(conversationsContainer);
}

// Create a clip card element (No changes needed here usually)
function createClipCard(clip, conversationId) {
    const clipCard = document.createElement('div');
    clipCard.className = 'clip-card';
    clipCard.dataset.clipId = clip.id;
    clipCard.dataset.conversationId = conversationId;
    
    const clipContent = document.createElement('div');
    clipContent.className = 'clip-content';
    
    if (clip.isCode) {
      const codeElement = document.createElement('code');
      codeElement.textContent = clip.text;
      codeElement.className = 'code-block';
      clipContent.appendChild(codeElement);
    } else {
      clipContent.textContent = clip.text;
      // Display label if it exists (should only be for secondary/annotations)
      if (clip.label) { // Display label for annotations
          const clipLabel = document.createElement('div');
          clipLabel.textContent = clip.label;
          clipLabel.style.fontSize = '0.75rem';
          clipLabel.style.color = '#666'; 
          clipLabel.style.marginTop = '4px'; 
          clipLabel.style.fontStyle = 'italic';
          clipContent.appendChild(clipLabel);
      }
      // Optionally add emphasis for annotations if needed
      // if (clip.isSecondary) { clipContent.style.fontWeight = 'bold'; }
    }
    
    const clipMeta = document.createElement('div');
    clipMeta.className = 'clip-meta';
    
    const clipDate = document.createElement('span');
    clipDate.textContent = new Date(clip.timestamp).toLocaleString();
    
    const clipNumber = document.createElement('span');
    clipNumber.textContent = `#${clip.id + 1}`;
    if (clip.isSecondary) {
      clipNumber.style.color = '#444'; // Example: different color for annotation numbers
    }
    
    clipMeta.appendChild(clipDate);
    clipMeta.appendChild(clipNumber);
    
    const clipActions = document.createElement('div');
    clipActions.className = 'clip-actions';
    
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.addEventListener('click', () => {
      copyToClipboard(clip.text);
      copyButton.textContent = 'Copied!';
      setTimeout(() => { copyButton.textContent = 'Copy'; }, 2000);
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'danger';
    deleteButton.addEventListener('click', () => {
      deleteClip(clip.id, conversationId); // Use the existing single clip delete
    });
    
    clipActions.appendChild(copyButton);
    clipActions.appendChild(deleteButton);
    
    clipCard.appendChild(clipContent);
    clipCard.appendChild(clipMeta);
    clipCard.appendChild(clipActions);
    
    return clipCard;
}

// Adjust filterClips to target the correct container
function filterClips() {
  const searchTerm = searchInput.value.toLowerCase();
  const targetContainer = document.getElementById('clips-container') || mainContentArea;

  // Ensure the target exists before clearing
  if (!targetContainer) {
      console.error("Target container for filtering not found.");
      return;
  }
  targetContainer.innerHTML = ''; // Clear previous results

  if (!searchTerm) {
    renderConversations(allClipsV2);
    return;
  }
  
  const filteredConversations = {};
  Object.entries(allClipsV2).forEach(([id, conversation]) => {
    const matchingClips = conversation.clips.filter(clip => 
      (clip.text && clip.text.toLowerCase().includes(searchTerm)) || 
      (clip.label && clip.label.toLowerCase().includes(searchTerm)) // Also search labels
    );
    
    if (matchingClips.length > 0) {
      filteredConversations[id] = {
        ...conversation,
        clips: matchingClips
      };
    }
  });
  
  // Pass the specific container to render into
  renderConversations(filteredConversations);
}

// Delete a single clip (Adjusted slightly for clarity)
function deleteClip(clipId, conversationId) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    const conversation = allClipsV2[conversationId];
    if (!conversation) {
        console.error(`Conversation ${conversationId} not found for deletion.`);
        return;
    }
    
    const initialLength = conversation.clips.length;
    conversation.clips = conversation.clips.filter(clip => clip.id !== clipId);
    
    if (conversation.clips.length < initialLength) { // Check if a clip was actually deleted
        conversation.lastUpdated = new Date().toISOString();
        
        chrome.storage.local.set({ 'claudeNotesV2': allClipsV2 }, () => {
          console.log(`Clip ${clipId} deleted from conversation ${conversationId}`);
          // Re-render the currently active tab
          switchLibraryTab(activeLibraryTab);
        });
    } else {
        console.warn(`Clip ${clipId} not found in conversation ${conversationId} for deletion.`);
    }
}

// Clear all clips (No changes needed)
function confirmClearAll() {
  if (confirm('Are you sure you want to delete ALL notes from ALL conversations? This cannot be undone.')) {
    allClipsV2 = {};
    chrome.storage.local.set({ 'claudeNotesV2': allClipsV2, 'claudeNotesLabels': [] }, () => { // Also clear labels
      console.log('Claude Notes: All data cleared');
      // Update UI - render the current (empty) view
      switchLibraryTab(activeLibraryTab);
    });
  }
}

// Export notes (No changes needed)
function exportNotes() {
    // Check if we have any notes
    const hasNotes = Object.values(allClipsV2).some(
      conversation => conversation.clips && conversation.clips.length > 0
    );
    
    if (!hasNotes) {
      alert('No notes to export');
      return;
    }
    
    const exportData = {
      conversations: allClipsV2,
      exportDate: new Date().toISOString(),
      version: '2.0.0' // Update if schema changes significantly
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `claude-notes-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Copy text to clipboard (No changes needed)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text:', err);
    });
}

// Download conversation (No changes needed)
function downloadConversation(conversation) {
    // Create markdown content
    let markdownContent = `# ${conversation.title}\n\n`;
    
    // Add each clip's text
    conversation.clips.forEach(clip => {
      if (clip.isCode) {
        // Format code blocks with triple backticks
        markdownContent += "```\n" + clip.text + "\n```\n\n";
      } else {
        markdownContent += `${clip.text}\n\n`;
        // Add label if it exists
        if (clip.label) {
            markdownContent += `_Label: ${clip.label}_\n\n`;
        }
      }
    });
    
    // Create and trigger download
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    // Sanitize filename
    const safeTitle = (conversation.title || 'Untitled').replace(/[^a-z0-9]/gi, '-').toLowerCase();
    downloadLink.download = `${safeTitle}.md`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
} 