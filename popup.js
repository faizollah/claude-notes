// Popup script for Claude Notes

document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on Claude.ai
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    const statusMessage = document.getElementById('status-message');
    const clipsContainer = document.getElementById('clips-container');
    
    if (!currentTab.url.includes('claude.ai')) {
      statusMessage.textContent = 'This extension only works on Claude.ai';
      statusMessage.style.color = '#f44336';
      document.getElementById('toggle-modal').disabled = true;
    } else {
      // Load and display recent clips
      chrome.storage.local.get('claudeNotes', function(result) {
        const clips = result.claudeNotes || [];
        
        if (clips.length === 0) {
          clipsContainer.innerHTML = '<p class="empty-message">No clips saved yet.</p>';
        } else {
          // Show only the 3 most recent clips in the popup
          const recentClips = clips.slice(-3).reverse();
          
          clipsContainer.innerHTML = '';
          
          recentClips.forEach(clip => {
            const clipElement = document.createElement('div');
            clipElement.className = 'clip-item';
            
            const clipText = document.createElement('p');
            // Truncate text if it's too long
            clipText.textContent = clip.text.length > 100 ? 
              clip.text.substring(0, 100) + '...' : 
              clip.text;
            
            const clipDate = document.createElement('small');
            clipDate.textContent = new Date(clip.timestamp).toLocaleString();
            
            clipElement.appendChild(clipText);
            clipElement.appendChild(clipDate);
            clipsContainer.appendChild(clipElement);
          });
        }
      });
      
      // Set up toggle modal button
      document.getElementById('toggle-modal').addEventListener('click', function() {
        chrome.tabs.sendMessage(
          currentTab.id,
          { action: 'toggleModal' },
          function(response) {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            }
          }
        );
      });
    }
  });
}); 