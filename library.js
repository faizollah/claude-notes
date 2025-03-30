// Library script for Claude Notes

document.addEventListener('DOMContentLoaded', function() {
  console.log('Library page loaded');
  
  // DOM elements
  const clipsContainer = document.getElementById('clips-container');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('search-input');
  const exportButton = document.getElementById('export-notes');
  const clearAllButton = document.getElementById('clear-all');
  
  let allClipsV2 = {}; // New format with conversations
  let oldClips = []; // Old format (for migration if needed)
  
  // Load all clips
  loadClips();
  
  // Event listeners
  searchInput.addEventListener('input', filterClips);
  exportButton.addEventListener('click', exportNotes);
  clearAllButton.addEventListener('click', confirmClearAll);
  
  // Load clips from storage
  function loadClips() {
    console.log('Loading clips from storage');
    try {
      // Try to load both old and new formats
      chrome.storage.local.get(['claudeNotes', 'claudeNotesV2'], function(result) {
        console.log('Clips loaded:', result);
        
        if (chrome.runtime.lastError) {
          console.error('Error loading clips:', chrome.runtime.lastError);
          showError('Failed to load your notes. Please try again.');
          return;
        }
        
        // Load new format if available
        if (result.claudeNotesV2) {
          allClipsV2 = result.claudeNotesV2;
          renderConversations(allClipsV2);
        } 
        // Fallback to old format if no new format
        else if (result.claudeNotes) {
          oldClips = result.claudeNotes;
          showMigrationMessage();
        } 
        // No clips yet
        else {
          // Remove loading indicator
          const loadingElement = document.querySelector('.loading');
          if (loadingElement) {
            loadingElement.remove();
          }
          emptyState.style.display = 'block';
        }
      });
    } catch (error) {
      console.error('Error in loadClips:', error);
      showError('An error occurred while loading your notes.');
    }
  }
  
  // Show migration message (if we have old clips but no new ones)
  function showMigrationMessage() {
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
      loadingElement.remove();
    }
    
    const migrationDiv = document.createElement('div');
    migrationDiv.className = 'migration-message';
    migrationDiv.style.padding = '20px';
    migrationDiv.style.textAlign = 'center';
    migrationDiv.style.backgroundColor = '#e3f2fd';
    migrationDiv.style.borderRadius = '8px';
    migrationDiv.style.marginBottom = '20px';
    
    const title = document.createElement('h3');
    title.textContent = 'Migrate Your Notes';
    title.style.marginBottom = '10px';
    
    const message = document.createElement('p');
    message.textContent = 'We\'ve updated how notes are stored to organize them by conversation. Click below to migrate your existing notes.';
    message.style.marginBottom = '15px';
    
    const migrateButton = document.createElement('button');
    migrateButton.textContent = 'Migrate Notes';
    migrateButton.style.padding = '8px 16px';
    migrateButton.addEventListener('click', migrateOldNotes);
    
    migrationDiv.appendChild(title);
    migrationDiv.appendChild(message);
    migrationDiv.appendChild(migrateButton);
    
    clipsContainer.innerHTML = '';
    clipsContainer.appendChild(migrationDiv);
  }
  
  // Migrate old notes to new format
  function migrateOldNotes() {
    // Process old notes - check if any titles need fixing
    oldClips.forEach(clip => {
      // Fix any clip titles that might have the wrong format
      if (clip.title && clip.title.endsWith(' | Claude')) {
        clip.title = clip.title.replace(' | Claude', '').trim();
      }
    });

    // Create conversation for migrated notes
    const migratedConversation = {
      id: 'migrated',
      title: 'Migrated Notes',
      lastUpdated: new Date().toISOString(),
      clips: oldClips
    };
    
    // Create new format object
    allClipsV2 = {
      'migrated': migratedConversation
    };
    
    // Save to storage
    chrome.storage.local.set({ 'claudeNotesV2': allClipsV2 }, () => {
      console.log('Notes migrated successfully');
      
      // Render the migrated notes
      renderConversations(allClipsV2);
    });
  }
  
  // Show error message
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#f44336';
    errorDiv.style.padding = '20px';
    errorDiv.style.textAlign = 'center';
    
    // Remove loading element if exists
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
      loadingElement.remove();
    }
    
    clipsContainer.innerHTML = '';
    clipsContainer.appendChild(errorDiv);
  }
  
  // Render conversations to the container
  function renderConversations(conversationsObj) {
    // Remove loading indicator if exists
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
      loadingElement.remove();
    }
    
    clipsContainer.innerHTML = '';
    
    // Get conversations as array and sort by last updated
    const conversations = Object.values(conversationsObj);
    
    if (conversations.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    
    // Sort conversations by last updated time (newest first)
    conversations.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    
    // Container for all conversations
    const conversationsContainer = document.createElement('div');
    conversationsContainer.className = 'conversations-container';
    conversationsContainer.style.display = 'flex';
    conversationsContainer.style.flexDirection = 'column';
    conversationsContainer.style.gap = '30px';
    conversationsContainer.style.width = '100%';
    
    // Create a section for each conversation
    conversations.forEach(conversation => {
      // Skip conversations with no clips
      if (!conversation.clips || conversation.clips.length === 0) return;
      
      // Create conversation section
      const conversationSection = document.createElement('div');
      conversationSection.className = 'conversation-section';
      conversationSection.style.marginBottom = '30px';
      
      // Create conversation header
      const conversationHeader = document.createElement('div');
      conversationHeader.className = 'conversation-header';
      conversationHeader.style.marginBottom = '15px';
      conversationHeader.style.padding = '10px 15px';
      conversationHeader.style.backgroundColor = '#f0f2fd';
      conversationHeader.style.borderRadius = '8px';
      conversationHeader.style.display = 'flex';
      conversationHeader.style.justifyContent = 'space-between';
      conversationHeader.style.alignItems = 'center';
      
      // Ensure title is correctly formatted
      let displayTitle = conversation.title;
      if (displayTitle.endsWith(' - Claude')) {
        displayTitle = displayTitle.replace(' - Claude', '');
      }
      
      const conversationTitle = document.createElement('h2');
      conversationTitle.textContent = displayTitle;
      conversationTitle.style.fontSize = '18px';
      conversationTitle.style.margin = '0';
      
      const conversationDate = document.createElement('span');
      conversationDate.textContent = new Date(conversation.lastUpdated).toLocaleDateString();
      conversationDate.style.color = '#777';
      conversationDate.style.fontSize = '14px';
      
      conversationHeader.appendChild(conversationTitle);
      conversationHeader.appendChild(conversationDate);
      
      // Create clips container for this conversation
      const conversationClips = document.createElement('div');
      conversationClips.className = 'clips-grid';
      conversationClips.style.display = 'grid';
      conversationClips.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
      conversationClips.style.gap = '20px';
      
      // Add clips to this conversation
      conversation.clips.forEach(clip => {
        const clipCard = createClipCard(clip, conversation.id);
        conversationClips.appendChild(clipCard);
      });
      
      // Assemble conversation section
      conversationSection.appendChild(conversationHeader);
      conversationSection.appendChild(conversationClips);
      
      // Add to conversations container
      conversationsContainer.appendChild(conversationSection);
    });
    
    clipsContainer.appendChild(conversationsContainer);
  }
  
  // Create a clip card element
  function createClipCard(clip, conversationId) {
    const clipCard = document.createElement('div');
    clipCard.className = 'clip-card';
    clipCard.dataset.clipId = clip.id;
    clipCard.dataset.conversationId = conversationId;
    
    const clipContent = document.createElement('div');
    clipContent.className = 'clip-content';
    clipContent.textContent = clip.text;
    
    const clipMeta = document.createElement('div');
    clipMeta.className = 'clip-meta';
    
    const clipDate = document.createElement('span');
    clipDate.textContent = new Date(clip.timestamp).toLocaleString();
    
    const clipNumber = document.createElement('span');
    clipNumber.textContent = `#${clip.id + 1}`;
    
    clipMeta.appendChild(clipDate);
    clipMeta.appendChild(clipNumber);
    
    const clipActions = document.createElement('div');
    clipActions.className = 'clip-actions';
    
    const copyButton = document.createElement('button');
    copyButton.textContent = 'Copy';
    copyButton.addEventListener('click', () => {
      copyToClipboard(clip.text);
      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 2000);
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'danger';
    deleteButton.addEventListener('click', () => {
      deleteClip(clip.id, conversationId);
    });
    
    clipActions.appendChild(copyButton);
    clipActions.appendChild(deleteButton);
    
    clipCard.appendChild(clipContent);
    clipCard.appendChild(clipMeta);
    clipCard.appendChild(clipActions);
    
    return clipCard;
  }
  
  // Filter clips based on search input
  function filterClips() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
      // If no search term, show all conversations
      renderConversations(allClipsV2);
      return;
    }
    
    // Clone the conversations object
    const filteredConversations = {};
    
    // For each conversation, filter its clips
    Object.values(allClipsV2).forEach(conversation => {
      // Filter clips that match the search term
      const filteredClips = conversation.clips.filter(clip => 
        clip.text.toLowerCase().includes(searchTerm)
      );
      
      // If we have matching clips, include this conversation
      if (filteredClips.length > 0) {
        filteredConversations[conversation.id] = {
          ...conversation,
          clips: filteredClips
        };
      }
    });
    
    // Render filtered conversations
    renderConversations(filteredConversations);
  }
  
  // Delete a specific clip
  function deleteClip(clipId, conversationId) {
    if (confirm('Are you sure you want to delete this note?')) {
      // Update the conversation's clips
      if (allClipsV2[conversationId]) {
        allClipsV2[conversationId].clips = allClipsV2[conversationId].clips.filter(
          clip => clip.id !== clipId
        );
        allClipsV2[conversationId].lastUpdated = new Date().toISOString();
        
        // Update storage
        chrome.storage.local.set({ 'claudeNotesV2': allClipsV2 }, () => {
          console.log('Claude Notes: Clip deleted');
          
          // Re-render
          renderConversations(allClipsV2);
        });
      }
    }
  }
  
  // Clear all clips
  function confirmClearAll() {
    if (confirm('Are you sure you want to delete ALL notes from ALL conversations? This cannot be undone.')) {
      // Clear all conversations
      allClipsV2 = {};
      
      // Clear storage
      chrome.storage.local.set({ 'claudeNotesV2': allClipsV2 }, () => {
        console.log('Claude Notes: All clips cleared');
        
        // Update UI
        emptyState.style.display = 'block';
        clipsContainer.innerHTML = '';
      });
    }
  }
  
  // Export notes to JSON file
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
      version: '2.0.0'
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `claude-notes-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
  
  // Copy text to clipboard
  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
      .catch(err => {
        console.error('Could not copy text: ', err);
        
        // Fallback method if clipboard API fails
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback: Could not copy text: ', err);
        }
        
        document.body.removeChild(textArea);
      });
  }
}); 