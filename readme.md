# 🍪 Cookie Injector
**by Rishad Alamy Tools**

A lightweight Chrome extension to inject cookies into the current website.  
Built for testing, development, and internal debugging workflows.

---

## 🎬 Demo

[Watch a video demonstration of the extension in action.](./screenshots/demo.mp4)

---

## ✨ Features

- Inject `PUI_PR` cookie easily
- Add one optional second cookie
- Reload the tab with one click
- Automatically loads existing `PUI_PR` cookie if present
- Stores last **5 used `PUI_PR` values** as suggestions
- Hover on `PUI_PR` input or suggestions to view **GitHub PR details**
- Works with **private GitHub repositories** (optional token)
- Clean UI with Light / Dark mode
- No background tracking
- No data collection

---

## 🖥️ Installation (Manual)

This extension is **not published on the Chrome Web Store**.  
Manual installation is free, safe, and transparent.

### Step 1: Download
- Download this project as a ZIP file
- Right-click the ZIP file
- Click **Extract All**

### Step 2: Open Chrome Extensions
1. Open Google Chrome
2. Go to:
    `chrome://extensions`


### Step 3: Enable Developer Mode
- Turn ON **Developer mode** (top-right corner)

### Step 4: Load the Extension
1. Click **Load unpacked**
2. Select the **extension** folder
3. Click **Select Folder**

✅ Extension installed successfully.

### Note for Multiple Chrome Profiles
Chrome extensions are installed **per profile**.  
Install the extension in the correct profile if you use more than one.

---

## 🚀 How to Use

1. Open any website (`http` or `https`)
2. Click the **Cookie Injector** (RA icon)
3. If a `PUI_PR` cookie exists, it will be auto-filled
4. Otherwise, enter a new `PUI_PR` value or select one from **Suggestions**
5. (Optional) Enter a second cookie name and value
6. Click **Apply**
7. Click **Reload**

Cookies are now active on the page.

---

## 💡 Suggestions & History

- The last **5 used `PUI_PR` values** are stored locally
- Displayed as a clickable suggestion list
- Clicking a suggestion fills the input
- Hovering a suggestion shows PR details (if enabled)
- History is cleared when the extension is removed

---

## 🔍 GitHub PR Details (Private Repo Support)

This extension can show **GitHub Pull Request details** on hover:

- PR title  
- PR author  

Repository:
    `alamy-ops/product-ui-container`


Because this repository is **private**, GitHub authentication is required.

---

## 🔑 How to Create a GitHub Personal Access Token

1. Go to **GitHub**
2. Navigate to:
Settings → Developer settings → Personal access tokens

3. Click **Tokens (classic)**
4. Click **Generate new token (classic)**

### Token settings
- **Note**: Cookie Injector
- **Expiration**: Your choice
- **Scopes**:
- `repo` (read-only access is sufficient)

5. Click **Generate token**
6. Copy the token (you will not be able to see it again)

---

## 🧩 Add Token to the Extension

1. Open:
    `extension/config.js`

2. Paste your token:
```js
const GITHUB_TOKEN = "ghp_your_token_here"; ```

Save the file

Reload the extension:

`chrome://extensions` → **Reload**

✅ PR hover details are now enabled.

⚠️ If Token Is Not Added

- PR hover feature remains disabled
- A small hint is shown instead
- All other features continue to work normally

## 🔒 Security & Privacy

- Token is stored locally only
- Token is never synced or sent anywhere
- No backend servers involved
- No analytics or tracking
- All logic runs inside your browser

⚠️ Intended for internal / developer use only.

## ⚠️ Important Notes

- Does not work on `chrome://` pages
- Cannot modify `HttpOnly` cookies (Chrome limitation)
- Clearing browser cookies removes injected cookies
- Suggestions and token are removed when the extension is uninstalled

## 👤 Credits

Built by **Rishad Alamy Tools**
