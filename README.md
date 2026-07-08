# Claude Notes

A Chrome extension that allows you to capture, organize, and revisit valuable AI text responses from Claude.ai.

## Features

- **Quick Clip Functionality**: One-click saving of selected text from Claude.ai conversations
- **Visual Context Preservation**: Underlines saved clips for easy reference within the conversation
- **Notes Library**: Dedicated page to view, search, and manage all your saved notes
- **Export/Import**: Download your conversation notes as Markdown for backup or sharing

## Cool Details
- When active the modal will automatically load on any conversation, allowing you to refer back and add quickly
- If you close the modal, reopen it with the Notes button next to Share in conversation header


## Installation

Since this is a development version, you'll need to install it manually in Chrome:

1. Download or clone this repository to your local machine
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the folder containing the extension files
5. The Claude Notes extension should now be installed and visible in your extensions list

## Usage

1. Visit Claude.ai and start a conversation
2. Select text you want to save
3. Click the "Clip" button that appears near your selection
4. The text will be saved and highlighted with an underline
5. Click the extension icon in your browser toolbar to open the Notes Library page

## Storage

All notes are stored locally in your browser using Chrome's storage API. By
default nothing leaves your machine.

## Cloud Sync (optional, end-to-end encrypted)

You can optionally sync your notes across devices through your own Google
Drive. Sync is **zero-knowledge**: notes are encrypted on your device with a
key derived from a passphrase you choose, and only the encrypted blob is
uploaded. Google cannot read your notes, and neither can anyone else without
your passphrase.

- **Encryption**: AES-256-GCM with a key derived via PBKDF2-HMAC-SHA256
  (600,000 iterations). See `crypto.js`.
- **Storage location**: a single encrypted file in Drive's hidden, app-private
  `appDataFolder` — invisible in your normal Drive and inaccessible to other
  apps. See `drive-sync.js`.
- **Passphrase**: never written to disk or sent anywhere. **If you forget it,
  synced notes are unrecoverable.** Use the same passphrase on every device.
  The optional "Remember until I close the browser" checkbox keeps it in
  `chrome.storage.session` (in-memory only, cleared when the browser closes) so
  you don't retype it every sync.
- **Merge**: syncing is non-destructive — it unions local and remote notes so a
  sync never loses data. (Trade-off: deletions don't propagate across devices;
  use "Clear all" on each device to remove notes everywhere.)

### Sync setup (one-time)

The manifest pins a fixed extension ID via the `key` field, so the extension
has the **same ID on every machine**: `fjbjjbmbemmlbgcpfngojbdhmedniaok`. This
is what lets one OAuth client work across all your devices.

1. In the [Google Cloud Console](https://console.cloud.google.com/), create a
   project and enable the **Google Drive API**.
2. Configure the OAuth consent screen and add yourself as a test user.
3. Create an **OAuth client ID** of type **Chrome Extension**, using the fixed
   extension ID above as the **Item ID**.
4. Put the generated client ID into `manifest.json` under `oauth2.client_id`,
   then reload the extension. (This repo already ships a working client ID.)

Then open the Notes Library, click **Sync**, enter your passphrase, and
**Sync now**. The same extension folder can be loaded on any machine and will
share the same ID, so sync works everywhere without reconfiguring.

> Note: end-to-end encryption protects your notes against a breach of Google's
> servers or the network. It does not protect against malware on your own
> device, since notes are necessarily decrypted in the browser to be used.

## Development

To modify or extend the extension:

1. Edit the relevant files as needed
2. Reload the extension in Chrome's extensions page
3. Test your changes on Claude.ai

## License

This project is open source and available under the MIT License. 