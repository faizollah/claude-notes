// drive-sync.js — Google Drive transport for Claude Notes cloud sync.
//
// Stores a single encrypted file in the Drive "appDataFolder": a hidden,
// per-application folder that is invisible to the user's normal Drive and
// inaccessible to other apps. We only ever read/write the encrypted envelope
// produced by crypto.js, so Google never sees plaintext notes.
//
// Auth uses chrome.identity.getAuthToken, which requires an OAuth client to be
// registered for this extension in Google Cloud Console and its client_id
// placed in manifest.json (see README "Cloud Sync setup").

const DriveSync = (() => {
  const FILE_NAME = 'claude-notes-sync.json';
  const FILES_API = 'https://www.googleapis.com/drive/v3/files';
  const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files';

  // Get an OAuth token. `interactive: true` may show the Google consent/account
  // chooser, so it must be triggered by a user gesture (e.g. a button click).
  function getToken(interactive) {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: !!interactive }, (token) => {
        if (chrome.runtime.lastError || !token) {
          reject(new Error(chrome.runtime.lastError?.message || 'No auth token'));
        } else {
          resolve(token);
        }
      });
    });
  }

  // Drop a token from Chrome's cache (e.g. after a 401) so the next request
  // forces a fresh one.
  function removeCachedToken(token) {
    return new Promise((resolve) => {
      if (!token) return resolve();
      chrome.identity.removeCachedAuthToken({ token }, resolve);
    });
  }

  // Revoke access entirely (used by "Disconnect").
  async function disconnect() {
    try {
      const token = await getToken(false);
      await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, { method: 'POST' });
      await removeCachedToken(token);
    } catch (e) {
      // Already disconnected / no token — nothing to do.
    }
  }

  async function authedFetch(token, url, options = {}) {
    const headers = Object.assign({}, options.headers, {
      Authorization: `Bearer ${token}`
    });
    let res = await fetch(url, Object.assign({}, options, { headers }));
    if (res.status === 401) {
      // Token expired — refresh once and retry.
      await removeCachedToken(token);
      const fresh = await getToken(true);
      headers.Authorization = `Bearer ${fresh}`;
      res = await fetch(url, Object.assign({}, options, { headers }));
    }
    return res;
  }

  // Find the sync file's id in appDataFolder, or null if it doesn't exist yet.
  async function findFileId(token) {
    const q = encodeURIComponent(`name = '${FILE_NAME}'`);
    const url = `${FILES_API}?spaces=appDataFolder&q=${q}&fields=files(id,name,modifiedTime)`;
    const res = await authedFetch(token, url);
    if (!res.ok) throw new Error(`Drive list failed: ${res.status}`);
    const data = await res.json();
    return data.files && data.files.length ? data.files[0].id : null;
  }

  // Download and parse the encrypted envelope, or null if there's no file yet.
  async function downloadEnvelope(token) {
    const fileId = await findFileId(token);
    if (!fileId) return null;
    const res = await authedFetch(token, `${FILES_API}/${fileId}?alt=media`);
    if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
    return res.json();
  }

  // Create or overwrite the sync file with the given envelope object.
  async function uploadEnvelope(token, envelope) {
    const fileId = await findFileId(token);
    const metadata = fileId
      ? {}
      : { name: FILE_NAME, parents: ['appDataFolder'] };

    const boundary = 'claude-notes-' + Math.random().toString(36).slice(2);
    const body =
      `--${boundary}\r\n` +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) + '\r\n' +
      `--${boundary}\r\n` +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(envelope) + '\r\n' +
      `--${boundary}--`;

    const method = fileId ? 'PATCH' : 'POST';
    const url = fileId
      ? `${UPLOAD_API}/${fileId}?uploadType=multipart`
      : `${UPLOAD_API}?uploadType=multipart`;

    const res = await authedFetch(token, url, {
      method,
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body
    });
    if (!res.ok) throw new Error(`Drive upload failed: ${res.status}`);
    return res.json();
  }

  return { getToken, disconnect, downloadEnvelope, uploadEnvelope };
})();

if (typeof window !== 'undefined') window.DriveSync = DriveSync;
