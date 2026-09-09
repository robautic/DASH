chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {})
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'DASH_PIPE_OPEN_SIDE_PANEL') return
  const tabId = sender.tab?.id
  if (!tabId || !chrome.sidePanel?.open) return
  chrome.sidePanel.open({ tabId }).then(() => sendResponse({ ok: true })).catch((error) => sendResponse({ ok: false, error: error.message }))
  return true
})
