const body = document.body;
const statusEl = document.getElementById("status");
const cookieListEl = document.getElementById("cookieList");
const valueInput = document.getElementById("value1");
const suggestionsBox = document.getElementById("suggestions");
const suggestionsSelect = document.getElementById("puiSuggestions");

// ---------------- THEME ----------------
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") body.classList.add("light");

document.getElementById("themeToggle").onclick = () => {
  body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    body.classList.contains("light") ? "light" : "dark"
  );
};

// ---------------- LOAD EXISTING PUI_PR COOKIE ONLY ----------------
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  if (!tab || !tab.url.startsWith("http")) return;

  const origin = new URL(tab.url).origin;

  chrome.cookies.get({ url: origin, name: "PUI_PR" }, (cookie) => {
    if (cookie && cookie.value) {
      valueInput.value = cookie.value;
    }
  });
});

// ---------------- LOAD STORED SUGGESTIONS ----------------
chrome.storage.local.get(["puiHistory"], (data) => {
  const history = Array.isArray(data.puiHistory) ? data.puiHistory : [];
  if (!history.length) return;

  history.forEach((val) => {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val;
    suggestionsSelect.appendChild(opt);
  });

  suggestionsBox.style.display = "block";
});

// When user selects a suggestion
suggestionsSelect.onchange = (e) => {
  if (e.target.value) {
    valueInput.value = e.target.value;
  }
};

// ---------------- APPLY COOKIES ----------------
document.getElementById("apply").onclick = () => {
  statusEl.style.display = "none";
  cookieListEl.innerHTML = "";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url.startsWith("http")) {
      showError("Open a website first");
      return;
    }

    const cookies = [];

    // ---- PUI_PR ----
    const v1 = valueInput.value.trim();
    if (v1) {
      cookies.push({ name: "PUI_PR", value: v1 });

      // 🔥 SAVE HISTORY (MAX 5, UNIQUE)
      chrome.storage.local.get(["puiHistory"], (data) => {
        let history = Array.isArray(data.puiHistory) ? data.puiHistory : [];

        history = history.filter((v) => v !== v1); // remove duplicate
        history.unshift(v1);                       // add to top
        history = history.slice(0, 5);             // keep max 5

        chrome.storage.local.set({ puiHistory: history });
      });
    }

    // ---- SECOND COOKIE (OPTIONAL) ----
    const n2 = document.getElementById("name2").value.trim();
    const v2 = document.getElementById("value2").value.trim();
    if (n2 && v2) {
      cookies.push({ name: n2, value: v2 });
    }

    if (!cookies.length) {
      showError("No cookies to apply");
      return;
    }

    chrome.runtime.sendMessage(
      {
        action: "applyCookies",
        tabUrl: tab.url,
        cookies
      },
      (res) => {
        if (!res || !res.success) {
          showError("Failed to apply cookies");
          return;
        }

        showSuccess("Cookies applied. Please reload the tab.");
        showCookieList(cookies);
      }
    );
  });
};

// ---------------- RELOAD TAB ----------------
document.getElementById("reload").onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.reload(tabs[0].id);
  });
};

// ---------------- UI HELPERS ----------------
function showSuccess(msg) {
  statusEl.textContent = msg;
  statusEl.className = "success";
  statusEl.style.display = "block";
}

function showError(msg) {
  statusEl.textContent = msg;
  statusEl.className = "error";
  statusEl.style.display = "block";
}

function showCookieList(cookies) {
  const ul = document.createElement("ul");
  cookies.forEach((c) => {
    const li = document.createElement("li");
    li.textContent = `${c.name} = ${c.value}`;
    ul.appendChild(li);
  });

  cookieListEl.innerHTML = "<strong>Applied cookies:</strong>";
  cookieListEl.appendChild(ul);
}
