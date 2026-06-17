// sync.js — Orchestrates encrypted cloud sync for Claude Notes.
//
// Flow for a sync: pull the encrypted envelope from Drive, decrypt it with the
// in-memory passphrase, non-destructively merge it with local notes, save the
// result locally, then re-encrypt and push it back. The passphrase lives only
// in memory for the lifetime of the page — it is never persisted.

const NotesSync = (() => {
  const SYNC_META_KEY = 'claudeNotesSync';

  // In-memory only. Cleared on page reload; the user re-enters it to sync.
  let passphrase = null;

  function setPassphrase(p) { passphrase = p; }
  function hasPassphrase() { return !!passphrase; }
  function clearPassphrase() { passphrase = null; }

  function getLocal() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['claudeNotesV2', 'claudeNotesLabels'], (r) => {
        resolve({
          claudeNotesV2: r.claudeNotesV2 || {},
          claudeNotesLabels: r.claudeNotesLabels || []
        });
      });
    });
  }

  function saveLocal(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({
        claudeNotesV2: data.claudeNotesV2 || {},
        claudeNotesLabels: data.claudeNotesLabels || []
      }, resolve);
    });
  }

  function getMeta() {
    return new Promise((resolve) => {
      chrome.storage.local.get([SYNC_META_KEY], (r) => resolve(r[SYNC_META_KEY] || {}));
    });
  }

  function setMeta(meta) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [SYNC_META_KEY]: meta }, resolve);
    });
  }

  // Non-destructive merge: the union of both sides. We never drop a note, so a
  // sync can't lose data. Trade-off: deletions made on one device do not
  // propagate to the other (a re-synced device will restore them). Use the
  // "Clear all" action on every device, or rely on local edits, to remove
  // notes permanently.
  function merge(local, remote) {
    if (!remote) return local;

    const convs = {};
    const allIds = new Set([
      ...Object.keys(local.claudeNotesV2 || {}),
      ...Object.keys(remote.claudeNotesV2 || {})
    ]);

    allIds.forEach((id) => {
      const a = (local.claudeNotesV2 || {})[id];
      const b = (remote.claudeNotesV2 || {})[id];
      if (a && !b) { convs[id] = a; return; }
      if (b && !a) { convs[id] = b; return; }

      // Both sides have this conversation — merge their clips by clip id.
      const clipsById = new Map();
      const absorb = (clips) => {
        (clips || []).forEach((clip) => {
          const existing = clipsById.get(clip.id);
          if (!existing) { clipsById.set(clip.id, clip); return; }
          // Prefer the more recently created/edited version of a clip.
          const tNew = new Date(clip.timestamp || 0).getTime();
          const tOld = new Date(existing.timestamp || 0).getTime();
          if (tNew >= tOld) clipsById.set(clip.id, clip);
        });
      };
      absorb(a.clips);
      absorb(b.clips);

      const aTime = new Date(a.lastUpdated || 0).getTime();
      const bTime = new Date(b.lastUpdated || 0).getTime();
      const newer = bTime > aTime ? b : a;

      convs[id] = Object.assign({}, newer, {
        clips: Array.from(clipsById.values()).sort((x, y) => x.id - y.id),
        lastUpdated: new Date(Math.max(aTime, bTime)).toISOString()
      });
    });

    const labels = Array.from(new Set([
      ...(local.claudeNotesLabels || []),
      ...(remote.claudeNotesLabels || [])
    ]));

    return { claudeNotesV2: convs, claudeNotesLabels: labels };
  }

  // Run a full two-way sync. `onStatus` receives human-readable progress
  // strings. Returns the merged data so callers can refresh the UI.
  async function syncNow(onStatus = () => {}) {
    if (!passphrase) throw new Error('NO_PASSPHRASE');

    onStatus('Connecting to Google Drive…');
    const token = await DriveSync.getToken(true);

    onStatus('Downloading encrypted notes…');
    const envelope = await DriveSync.downloadEnvelope(token);

    let remote = null;
    if (envelope) {
      onStatus('Decrypting…');
      // Throws WRONG_PASSPHRASE if the passphrase doesn't match the cloud file.
      remote = await CryptoUtil.openEnvelope(passphrase, envelope);
    }

    onStatus('Merging…');
    const local = await getLocal();
    const merged = merge(local, remote);
    await saveLocal(merged);

    onStatus('Encrypting & uploading…');
    const newEnvelope = await CryptoUtil.buildEnvelope(passphrase, merged);
    await DriveSync.uploadEnvelope(token, newEnvelope);

    const meta = await getMeta();
    meta.lastSynced = new Date().toISOString();
    meta.connected = true;
    await setMeta(meta);

    onStatus('Sync complete');
    return merged;
  }

  return {
    setPassphrase, hasPassphrase, clearPassphrase,
    getMeta, setMeta, syncNow, merge
  };
})();

if (typeof window !== 'undefined') window.NotesSync = NotesSync;
