// Library script for Claude Notes

document.addEventListener('DOMContentLoaded', function() {
  console.log('Library page loaded');
  
  // DOM elements
  const clipsContainer = document.getElementById('clips-container');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('search');
  const exportButton = document.getElementById('export-notes');
  const clearAllButton = document.getElementById('clear-all');
  
  let allClipsV2 = {}; // New format with conversations
  let oldClips = []; // Old format (for migration if needed)
  
  // Load clips from storage
  chrome.storage.local.get(['claudeNotesV2'], function(result) {
    if (result.claudeNotesV2) {
      allClipsV2 = result.claudeNotesV2;
      renderConversations(allClipsV2);
    } else {
      showEmptyState();
    }
  });
  
  // Event listeners
  searchInput.addEventListener('input', filterClips);
  exportButton.addEventListener('click', exportNotes);
  clearAllButton.addEventListener('click', confirmClearAll);
  
  // Show empty state message
  function showEmptyState() {
    clipsContainer.innerHTML = `
      <div class="empty-message">
        No notes found. Select text in Claude.ai and click "Clip" to save notes.
      </div>
    `;
  }
  
  // Render all conversations
  function renderConversations(conversationsObj) {
    // Remove loading indicator if exists
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
      loadingElement.remove();
    }
    
    // Convert to array and sort by last updated
    const conversations = Object.values(conversationsObj)
      .filter(conv => conv.clips && conv.clips.length > 0)
      .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
    
    if (conversations.length === 0) {
      showEmptyState();
      return;
    }
    
    // Create container for all conversations
    const conversationsContainer = document.createElement('div');
    conversationsContainer.className = 'conversations-container';
    
    // Render each conversation
    conversations.forEach(conversation => {
      // Skip conversations with no clips
      if (!conversation.clips || conversation.clips.length === 0) return;
      
      // Create conversation section
      const conversationSection = document.createElement('div');
      conversationSection.className = 'conversation-section';
      
      // Create conversation header
      const conversationHeader = document.createElement('div');
      conversationHeader.className = 'conversation-header';
      
      const conversationTitle = document.createElement('h2');
      conversationTitle.className = 'conversation-title';
      // Use the actual conversation title
      conversationTitle.textContent = conversation.title || 'Untitled Conversation';
      
      const headerActions = document.createElement('div');
      headerActions.className = 'header-actions';
      
      const downloadButton = document.createElement('button');
      downloadButton.textContent = 'Download';
      downloadButton.className = 'download-btn';
      downloadButton.addEventListener('click', () => downloadConversation(conversation));
      
      // Add download button to header actions
      headerActions.appendChild(downloadButton);
      
      // Add title and actions to header
      conversationHeader.appendChild(conversationTitle);
      conversationHeader.appendChild(headerActions);
      
      // Create date section with border
      const dateSection = document.createElement('div');
      dateSection.className = 'date-section';
      
      // Create a separate div for the border only
      const borderDiv = document.createElement('div');
      borderDiv.className = 'border-div';
      dateSection.appendChild(borderDiv);
      
      // Create a container for the date that will appear below the border
      const dateContainer = document.createElement('div');
      dateContainer.className = 'date-container';
      
      const conversationDate = document.createElement('span');
      conversationDate.className = 'conversation-date';
      conversationDate.textContent = new Date(conversation.lastUpdated).toLocaleDateString();
      
      dateContainer.appendChild(conversationDate);
      dateSection.appendChild(dateContainer);
      
      // Create clips container
      const conversationClips = document.createElement('div');
      conversationClips.className = 'conversation-clips';
      
      // Add clips to this conversation
      conversation.clips.forEach(clip => {
        const clipCard = createClipCard(clip, conversation.id);
        conversationClips.appendChild(clipCard);
      });
      
      // Assemble conversation section
      conversationSection.appendChild(conversationHeader);
      conversationSection.appendChild(dateSection);
      conversationSection.appendChild(conversationClips);
      
      // Add to conversations container
      conversationsContainer.appendChild(conversationSection);
    });
    
    clipsContainer.innerHTML = '';
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
    
    // Check if this clip is code and apply different styling
    if (clip.isCode) {
      const codeElement = document.createElement('code');
      codeElement.textContent = clip.text;
      codeElement.className = 'code-block';
      clipContent.appendChild(codeElement);
    } else {
      clipContent.textContent = clip.text;
    }
    
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
      renderConversations(allClipsV2);
      return;
    }
    
    const filteredConversations = {};
    
    Object.entries(allClipsV2).forEach(([id, conversation]) => {
      const matchingClips = conversation.clips.filter(clip => 
        clip.text.toLowerCase().includes(searchTerm)
      );
      
      if (matchingClips.length > 0) {
        filteredConversations[id] = {
          ...conversation,
          clips: matchingClips
        };
      }
    });
    
    renderConversations(filteredConversations);
  }
  
  // Delete a clip
  function deleteClip(clipId, conversationId) {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    const conversation = allClipsV2[conversationId];
    if (!conversation) return;
    
    // Remove clip from conversation
    conversation.clips = conversation.clips.filter(clip => clip.id !== clipId);
    conversation.lastUpdated = new Date().toISOString();
    
    // Save updated data
    chrome.storage.local.set({ 'claudeNotesV2': allClipsV2 }, () => {
      // Re-render conversations
      renderConversations(allClipsV2);
    });
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
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text:', err);
    });
  }
  
  // Add new function for downloading conversation
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
      }
    });
    
    // Create and trigger download
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `${conversation.title}.md`.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  }
}); 