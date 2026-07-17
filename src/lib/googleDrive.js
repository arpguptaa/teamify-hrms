// Lets a master or client account pick a Google Drive folder as their
// storage location. Needs a Google Cloud OAuth client ID + API key —
// see README "Connecting Google Drive" for the one-time setup.
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let pickerReady = false;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export function isGoogleConfigured() {
  return Boolean(CLIENT_ID && API_KEY);
}

export async function ensureGoogleLoaded() {
  await loadScript('https://accounts.google.com/gsi/client');
  await loadScript('https://apis.google.com/js/api.js');
  if (!pickerReady) {
    await new Promise((resolve) => window.gapi.load('picker', resolve));
    pickerReady = true;
  }
}

export function requestDriveAccess() {
  return new Promise((resolve, reject) => {
    if (!isGoogleConfigured()) return reject(new Error('not-configured'));
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
          if (resp.error) reject(resp);
          else resolve(resp.access_token);
        },
      });
      tokenClient.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
}

export function openFolderPicker(accessToken) {
  return new Promise((resolve) => {
    const view = new window.google.picker.DocsView(window.google.picker.ViewId.FOLDERS)
      .setSelectFolderEnabled(true)
      .setIncludeFolders(true);
    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(API_KEY)
      .setTitle('Choose a folder for Teamify data')
      .setCallback((data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs[0];
          resolve({ id: doc.id, name: doc.name });
        } else if (data.action === window.google.picker.Action.CANCEL) {
          resolve(null);
        }
      })
      .build();
    picker.setVisible(true);
  });
}

// Connects the whole flow: load scripts -> get token -> open picker.
export async function connectGoogleDriveFolder() {
  await ensureGoogleLoaded();
  const token = await requestDriveAccess();
  return openFolderPicker(token);
}
