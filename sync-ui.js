// sync-ui.js — "Cloud Sync" panel for the Claude Notes library page.
//
// Adds a Sync button to the library header and a modal where the user enters
// their encryption passphrase and triggers an end-to-end encrypted sync to
// Google Drive. The passphrase is held only in memory (see sync.js).

(function () {
  function injectStyles() {
    if (document.getElementById('sync-ui-styles')) return;
    const style = document.createElement('style');
    style.id = 'sync-ui-styles';
    style.textContent = `
      .sync-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45);
        display: flex; align-items: center; justify-content: center; z-index: 9999; }
      .sync-modal { background: #fff; color: #1a1a1a; width: 420px; max-width: 92vw;
        border-radius: 10px; padding: 22px; box-shadow: 0 12px 40px rgba(0,0,0,0.25);
        font-family: 'Inter', system-ui, sans-serif; }
      .sync-modal h2 { margin: 0 0 4px; font-size: 1.15rem; }
      .sync-modal .sync-sub { margin: 0 0 16px; font-size: 0.82rem; color: #666; }
      .sync-modal label { display: block; font-size: 0.8rem; font-weight: 600;
        margin: 12px 0 4px; }
      .sync-modal input[type="password"] { width: 100%; padding: 9px 10px;
        border: 1px solid #ccc; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; }
      .sync-row { display: flex; gap: 8px; margin-top: 18px; }
      .sync-modal button { padding: 9px 14px; border-radius: 6px; border: none;
        cursor: pointer; font-size: 0.85rem; font-weight: 600; }
      .sync-primary { background: #d97757; color: #fff; flex: 1; }
      .sync-secondary { background: #eee; color: #333; }
      .sync-status { margin-top: 14px; font-size: 0.8rem; min-height: 1.2em; }
      .sync-status.err { color: #c0392b; }
      .sync-status.ok { color: #2e7d32; }
      .sync-note { margin-top: 16px; font-size: 0.72rem; color: #888; line-height: 1.4;
        border-top: 1px solid #eee; padding-top: 12px; }
      .sync-meta { font-size: 0.75rem; color: #777; margin-top: 6px; }
    `;
    document.head.appendChild(style);
  }

  function setStatus(el, msg, kind) {
    el.textContent = msg || '';
    el.className = 'sync-status' + (kind ? ' ' + kind : '');
  }

  async function openModal() {
    const meta = await NotesSync.getMeta();
    const lastSynced = meta.lastSynced
      ? new Date(meta.lastSynced).toLocaleString()
      : 'never';

    const overlay = document.createElement('div');
    overlay.className = 'sync-overlay';
    overlay.innerHTML = `
      <div class="sync-modal" role="dialog" aria-modal="true">
        <h2>Cloud Sync</h2>
        <p class="sync-sub">End-to-end encrypted sync to your Google Drive.</p>
        <label for="sync-pass">Encryption passphrase</label>
        <input type="password" id="sync-pass" placeholder="Your secret passphrase" autocomplete="off" />
        <div class="sync-meta">Last synced: ${lastSynced}</div>
        <div class="sync-row">
          <button class="sync-primary" id="sync-go">Sync now</button>
          <button class="sync-secondary" id="sync-disconnect">Disconnect</button>
          <button class="sync-secondary" id="sync-close">Close</button>
        </div>
        <div class="sync-status" id="sync-status"></div>
        <p class="sync-note">
          Your notes are encrypted on this device with a key derived from your
          passphrase before anything is uploaded. Google cannot read them, and
          neither can we. <strong>If you forget the passphrase, your synced
          notes cannot be recovered.</strong> Use the same passphrase on every
          device.
        </p>
      </div>`;

    document.body.appendChild(overlay);
    const statusEl = overlay.querySelector('#sync-status');
    const passEl = overlay.querySelector('#sync-pass');
    passEl.focus();

    const close = () => overlay.remove();
    overlay.querySelector('#sync-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('#sync-go').addEventListener('click', async () => {
      const pass = passEl.value;
      if (!pass || pass.length < 8) {
        setStatus(statusEl, 'Passphrase must be at least 8 characters.', 'err');
        return;
      }
      NotesSync.setPassphrase(pass);
      try {
        await NotesSync.syncNow((s) => setStatus(statusEl, s));
        setStatus(statusEl, 'Sync complete. Refreshing…', 'ok');
        setTimeout(() => location.reload(), 800);
      } catch (e) {
        let msg = 'Sync failed: ' + (e.message || e);
        if (e.message === 'WRONG_PASSPHRASE') {
          msg = 'Wrong passphrase for the existing cloud data — nothing was changed.';
        } else if (e.message === 'NO_PASSPHRASE') {
          msg = 'Please enter a passphrase.';
        }
        setStatus(statusEl, msg, 'err');
      } finally {
        NotesSync.clearPassphrase();
      }
    });

    overlay.querySelector('#sync-disconnect').addEventListener('click', async () => {
      setStatus(statusEl, 'Disconnecting…');
      await DriveSync.disconnect();
      const m = await NotesSync.getMeta();
      m.connected = false;
      await NotesSync.setMeta(m);
      setStatus(statusEl, 'Disconnected from Google Drive.', 'ok');
    });
  }

  function addSyncButton() {
    const headerActions = document.querySelector('header .actions');
    if (!headerActions || document.getElementById('sync-notes')) return;
    const btn = document.createElement('button');
    btn.id = 'sync-notes';
    btn.textContent = 'Sync';
    btn.addEventListener('click', openModal);
    headerActions.prepend(btn);
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectStyles();
    // library.js builds header .actions during its own DOMContentLoaded
    // handler (registered earlier), so it exists by the time this runs.
    addSyncButton();
  });
})();
