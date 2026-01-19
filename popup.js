// =======================
// ELEMENT REFERENCES
// =======================
const valueInput = document.getElementById("value1");
const name2Input = document.getElementById("name2");
const value2Input = document.getElementById("value2");
const applyBtn = document.getElementById("apply");
const reloadBtn = document.getElementById("reload");
const statusEl = document.getElementById("status");
const cookieListEl = document.getElementById("cookieList");
const suggestionsBox = document.getElementById("suggestions");
const suggestionsList = document.getElementById("puiSuggestions");
const prTooltip = document.getElementById("prTooltip");

let prCache = {};
let hoverInside = false;

// =======================
// LOAD EXISTING PUI_PR COOKIE
// =======================
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

// =======================
// LOAD PUI_PR HISTORY (CUSTOM LIST)
// =======================
chrome.storage.local.get(["puiHistory"], (data) => {
  const history = Array.isArray(data.puiHistory) ? data.puiHistory : [];
  if (!history.length) return;

  suggestionsBox.style.display = "block";
  suggestionsList.innerHTML = "";

  history.forEach((pr) => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.textContent = pr;

    item.addEventListener("mouseenter", () => {
      hoverInside = true;
      showPRHover(pr, item);
    });

    item.addEventListener("mouseleave", () => {
      hoverInside = false;
      hideTooltipWithDelay();
    });

    item.addEventListener("click", () => {
      valueInput.value = pr;
      prTooltip.style.display = "none";
    });

    suggestionsList.appendChild(item);
  });
});

// =======================
// APPLY COOKIES
// =======================
applyBtn.onclick = () => {
  statusEl.style.display = "none";
  cookieListEl.innerHTML = "";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url.startsWith("http")) {
      showError("Open a website first");
      return;
    }

    const cookies = [];
    const prValue = valueInput.value.trim();

    if (prValue) {
      cookies.push({ name: "PUI_PR", value: prValue });

      // Save history (max 5, unique)
      chrome.storage.local.get(["puiHistory"], (data) => {
        let history = Array.isArray(data.puiHistory) ? data.puiHistory : [];
        history = history.filter((v) => v !== prValue);
        history.unshift(prValue);
        history = history.slice(0, 5);
        chrome.storage.local.set({ puiHistory: history });
      });
    }

    const n2 = name2Input.value.trim();
    const v2 = value2Input.value.trim();
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
        showSuccess("Cookies applied. Reload the tab.");
        showCookieList(cookies);
      }
    );
  });
};

// =======================
// RELOAD TAB
// =======================
reloadBtn.onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.reload(tabs[0].id);
  });
};

// =======================
// PR HOVER HANDLING (FIXED)
// =======================
valueInput.addEventListener("mouseenter", () => {
  hoverInside = true;
  const pr = valueInput.value.trim();
  if (pr) showPRHover(pr, valueInput);
});

valueInput.addEventListener("mouseleave", () => {
  hoverInside = false;
  hideTooltipWithDelay();
});

prTooltip.addEventListener("mouseenter", () => {
  hoverInside = true;
});

prTooltip.addEventListener("mouseleave", () => {
  hoverInside = false;
  hideTooltipWithDelay();
});

function hideTooltipWithDelay() {
  setTimeout(() => {
    if (!hoverInside) {
      prTooltip.style.display = "none";
    }
  }, 120);
}

function showPRHover(prNumber, anchor) {
  if (!prNumber || isNaN(prNumber)) return;

  const rect = anchor.getBoundingClientRect();

  // Position tooltip ABOVE the anchor
  const tooltipHeight = prTooltip.offsetHeight || 80;
  prTooltip.style.top = rect.top - tooltipHeight - 6 + "px";
  prTooltip.style.left = rect.left + 16 + "px";

  if (!GITHUB_TOKEN) {
    prTooltip.innerHTML =
      "Add GitHub token in <b>config.js</b> to enable PR details";
    prTooltip.style.display = "block";
    return;
  }

  if (prCache[prNumber]) {
    renderPR(prCache[prNumber], prNumber);
    return;
  }

  fetch(
    `https://api.github.com/repos/alamy-ops/product-ui-container/pulls/${prNumber}`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`
      }
    }
  )
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then((data) => {
      const prData = {
        title: data.title,
        author: data.user.login
      };
      prCache[prNumber] = prData;
      renderPR(prData, prNumber);
    })
    .catch(() => {
      prTooltip.innerHTML = `PR #${prNumber}<br>Unable to fetch details`;
      prTooltip.style.display = "block";
    });
}



function renderPR(pr, prNumber) {
  prTooltip.innerHTML = `
    <div style="font-weight:600; margin-bottom:4px;">
      ${escapeHTML(pr.title)}
    </div>
    <div style="font-size:11px; color:var(--muted); margin-bottom:6px;">
      Author: ${escapeHTML(pr.author)}
    </div>
    <button
      id="openPrBtn"
      style="
        width:100%;
        padding:6px;
        border-radius:6px;
        border:1px solid var(--border);
        background:transparent;
        color:var(--text);
        font-size:12px;
        cursor:pointer;
      ">
      Open PR on GitHub
    </button>
  `;

  prTooltip.style.display = "block";

  document.getElementById("openPrBtn").onclick = () => {
    chrome.tabs.create({
      url: `https://github.com/alamy-ops/product-ui-container/pull/${prNumber}`
    });
  };
}

// =======================
// UI HELPERS
// =======================
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
  cookieListEl.innerHTML =
    "<strong>Applied cookies:</strong><br>" +
    cookies.map(c => `${c.name} = ${c.value}`).join("<br>");
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[m])
  );
}
