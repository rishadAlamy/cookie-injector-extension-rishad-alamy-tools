chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action !== "applyCookies") return;

  const origin = new URL(msg.tabUrl).origin;

  msg.cookies.forEach(c => {
    chrome.cookies.set({
      url: origin,
      name: c.name,
      value: c.value,
      path: "/",
      secure: origin.startsWith("https://"),
      sameSite: "lax"
    });
  });

  // ✅ Explicit success response
  sendResponse({ success: true });

  // 🔥 IMPORTANT for MV3
  return true;
});
