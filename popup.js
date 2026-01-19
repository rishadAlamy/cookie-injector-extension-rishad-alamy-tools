// ---------------- LOAD EXISTING PUI_PR ----------------
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const tab = tabs[0];

  if (!tab || !tab.url.startsWith("http")) return;

  const origin = new URL(tab.url).origin;

  chrome.cookies.get(
    {
      url: origin,
      name: "PUI_PR"
    },
    cookie => {
      if (cookie && cookie.value) {
        document.getElementById("value1").value = cookie.value;
      }
    }
  );
});


const body = document.body;
const statusEl = document.getElementById("status");
const cookieListEl = document.getElementById("cookieList");

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

// ---------------- APPLY ----------------
document.getElementById("apply").onclick = () => {
  statusEl.style.display = "none";
  cookieListEl.innerHTML = "";

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tab = tabs[0];

    if (!tab || !tab.url.startsWith("http")) {
      showError("Open a website first");
      return;
    }

    const cookies = [];

    const v1 = document.getElementById("value1").value.trim();
    if (v1) {
      cookies.push({ name: "PUI_PR", value: v1 });
    }

    const n2 = document.getElementById("name2").value.trim();
    const v2 = document.getElementById("value2").value.trim();
    if (n2 && v2) {
      cookies.push({ name: n2, value: v2 });
    }

    if (cookies.length === 0) {
      showError("No cookies to apply");
      return;
    }

chrome.runtime.sendMessage({
  action: "applyCookies",
  tabUrl: tab.url,
  cookies
});

showSuccess("Cookies applied. Please reload the tab.");
showCookieList(cookies);

  });
};

// ---------------- RELOAD ----------------
document.getElementById("reload").onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.tabs.reload(tabs[0].id);
  });
};

// ---------------- HELPERS ----------------
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
  cookies.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.name} = ${c.value}`;
    ul.appendChild(li);
  });

  cookieListEl.innerHTML = "<strong>Applied cookies:</strong>";
  cookieListEl.appendChild(ul);
}
